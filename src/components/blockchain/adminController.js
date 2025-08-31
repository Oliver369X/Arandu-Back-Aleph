import { validationResult } from 'express-validator';
import { ethers } from 'ethers';
import AranduContractService from '../../services/AranduContractService.js';
import BlockchainDatabaseService from '../../services/BlockchainDatabaseService.js';

/**
 * Grant rewards to multiple students (batch operation)
 */
export const batchGrantRewards = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const { rewards } = req.body; // Array of {walletAddress, amount, isStreak}
    
    const results = [];
    let successful = 0;
    let failed = 0;
    
    for (const reward of rewards) {
      try {
        const result = await AranduContractService.grantTokenReward(
          reward.walletAddress,
          reward.amount,
          reward.isStreak || false
        );
        
        // Save activity record for each reward
        const user = await BlockchainDatabaseService.getUserByWalletAddress(reward.walletAddress);
        if (user) {
          await BlockchainDatabaseService.saveActivityCompletion(user.id, {
            activityId: `admin-batch-reward-${Date.now()}`,
            activityType: 'admin_reward',
            score: 100,
            tokensEarned: reward.amount,
            transactionHash: result.transactionHash,
            badgesEarned: result.badgesEarned,
            answers: { reason: reward.reason || 'Admin batch reward', batchId: Date.now() }
          });
        }
        
        results.push({
          walletAddress: reward.walletAddress,
          success: true,
          transactionHash: result.transactionHash,
          tokensGranted: reward.amount,
          badgesEarned: result.badgesEarned
        });
        
        successful++;
        
        // Small delay to avoid nonce issues
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        results.push({
          walletAddress: reward.walletAddress,
          success: false,
          error: error.message
        });
        failed++;
      }
    }
    
    res.json({
      success: true,
      results,
      summary: {
        totalProcessed: rewards.length,
        successful,
        failed,
        successRate: `${((successful / rewards.length) * 100).toFixed(2)}%`
      }
    });
    
  } catch (error) {
    console.error('❌ Error in batch reward operation:', error);
    res.status(500).json({ 
      success: false,
      error: 'Batch reward operation failed',
      details: error.message 
    });
  }
};

/**
 * Anchor education report hash on blockchain for transparency
 */
export const anchorReport = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const { reportData, reportType = 'education_report' } = req.body;
    
    // 1. Generate report hash
    const reportJson = JSON.stringify(reportData);
    const reportHash = ethers.keccak256(ethers.toUtf8Bytes(reportJson));
    
    // 2. Anchor on blockchain
    const result = await AranduContractService.anchorDataHash(reportHash);
    
    // 3. Save report to database (optional - for your records)
    try {
      await saveEducationReport({
        reportData,
        reportType,
        reportHash,
        transactionHash: result.transactionHash,
        anchoredAt: new Date()
      });
    } catch (dbError) {
      console.warn('⚠️ Failed to save report to database:', dbError.message);
    }
    
    res.json({
      success: true,
      reportHash,
      transactionHash: result.transactionHash,
      blockNumber: result.blockNumber,
      reportType,
      anchoredAt: new Date().toISOString(),
      message: 'Report anchored on blockchain for transparency',
      explorerUrl: `https://sepolia-blockscout.lisk.com/tx/${result.transactionHash}`
    });
    
  } catch (error) {
    console.error('❌ Error anchoring report:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to anchor report',
      details: error.message 
    });
  }
};

/**
 * Get comprehensive system statistics
 */
export const getSystemStats = async (req, res) => {
  try {
    // Get backend wallet status
    const backendBalance = await AranduContractService.getBackendBalance();
    
    // Get gas price info
    const gasPrice = await AranduContractService.getCurrentGasPrice();
    
    // Get database stats
    const dbStats = await BlockchainDatabaseService.getSystemStats();
    
    // Get blockchain network info
    const networkInfo = {
      network: 'lisk-sepolia',
      chainId: 4202,
      explorerUrl: 'https://sepolia-blockscout.lisk.com',
      contracts: {
        ANDUToken: process.env.ARANDU_ANDU_TOKEN_CONTRACT || 'Not configured',
        AranduRewards: process.env.ARANDU_REWARDS_CONTRACT || 'Not configured',
        AranduBadges: process.env.ARANDU_BADGES_CONTRACT || 'Not configured',
        AranduCertificates: process.env.ARANDU_CERTIFICATES_CONTRACT || 'Not configured',
        DataAnchor: process.env.ARANDU_DATA_ANCHOR_CONTRACT || 'Not configured'
      }
    };
    
    // Get recent blockchain events
    const recentEvents = await getRecentBlockchainEvents(10);
    
    // Get activities needing retry
    const activitiesNeedingRetry = await BlockchainDatabaseService.getActivitiesNeedingRetry(5);
    
    res.json({
      success: true,
      backend: {
        walletAddress: backendBalance?.address || 'Not configured',
        ethBalance: backendBalance?.balance || '0',
        gasPrice: gasPrice || 'Unable to fetch'
      },
      platform: {
        ...dbStats,
        activitiesNeedingRetry: activitiesNeedingRetry.length
      },
      blockchain: networkInfo,
      recentEvents,
      systemHealth: {
        blockchainConnected: !!backendBalance,
        databaseConnected: true,
        contractsInitialized: !!AranduContractService.contracts,
        gasPrice: gasPrice?.gasPrice || 'N/A'
      },
      lastUpdated: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error getting system stats:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to load system stats',
      details: error.message 
    });
  }
};

/**
 * Retry failed blockchain transactions
 */
export const retryFailedTransactions = async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    // Get activities that need retry
    const activitiesNeedingRetry = await BlockchainDatabaseService.getActivitiesNeedingRetry(
      parseInt(limit)
    );
    
    const results = [];
    let successful = 0;
    let failed = 0;
    
    for (const activity of activitiesNeedingRetry) {
      try {
        if (!activity.user?.walletAddress) {
          results.push({
            activityId: activity.id,
            success: false,
            error: 'No wallet address found for user'
          });
          failed++;
          continue;
        }
        
        // Calculate reward amount (use stored or default)
        const rewardAmount = activity.tokensEarned ? 
          parseFloat(activity.tokensEarned) : 
          calculateDefaultReward(activity.activityType, activity.score);
        
        // Retry the blockchain transaction
        const result = await AranduContractService.grantTokenReward(
          activity.user.walletAddress,
          rewardAmount,
          false
        );
        
        // Update activity with blockchain info
        await BlockchainDatabaseService.updateActivityWithBlockchainData(activity.id, {
          tokensEarned: rewardAmount,
          transactionHash: result.transactionHash,
          badgesEarned: result.badgesEarned
        });
        
        results.push({
          activityId: activity.id,
          success: true,
          transactionHash: result.transactionHash,
          tokensGranted: rewardAmount,
          badgesEarned: result.badgesEarned
        });
        
        successful++;
        
        // Small delay to avoid nonce issues
        await new Promise(resolve => setTimeout(resolve, 1500));
        
      } catch (error) {
        results.push({
          activityId: activity.id,
          success: false,
          error: error.message
        });
        failed++;
      }
    }
    
    res.json({
      success: true,
      message: `Processed ${activitiesNeedingRetry.length} failed transactions`,
      results,
      summary: {
        totalProcessed: activitiesNeedingRetry.length,
        successful,
        failed,
        successRate: activitiesNeedingRetry.length > 0 ? 
          `${((successful / activitiesNeedingRetry.length) * 100).toFixed(2)}%` : '0%'
      }
    });
    
  } catch (error) {
    console.error('❌ Error retrying failed transactions:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to retry transactions',
      details: error.message 
    });
  }
};

/**
 * Get blockchain event history
 */
export const getBlockchainEvents = async (req, res) => {
  try {
    const { limit = 20, contractAddress, eventName } = req.query;
    
    const events = await getRecentBlockchainEvents(
      parseInt(limit),
      contractAddress,
      eventName
    );
    
    res.json({
      success: true,
      events: events.map(event => ({
        id: event.id,
        contractAddress: event.contractAddress,
        eventName: event.eventName,
        blockNumber: event.blockNumber.toString(),
        transactionHash: event.transactionHash,
        eventData: event.eventData,
        processedAt: event.processedAt,
        explorerUrl: `https://sepolia-blockscout.lisk.com/tx/${event.transactionHash}`
      })),
      total: events.length,
      filters: {
        contractAddress: contractAddress || 'all',
        eventName: eventName || 'all',
        limit: parseInt(limit)
      }
    });
    
  } catch (error) {
    console.error('❌ Error getting blockchain events:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to load blockchain events',
      details: error.message 
    });
  }
};

/**
 * Issue bulk certificates to multiple students
 */
export const bulkIssueCertificates = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const { certificates } = req.body; // Array of certificate data
    
    const results = [];
    let successful = 0;
    let failed = 0;
    
    for (const certData of certificates) {
      try {
        // Create certificate metadata
        const certificateMetadata = {
          title: certData.title || `Certificate - ${certData.courseName}`,
          description: certData.description,
          courseName: certData.courseName,
          studentWallet: certData.studentWalletAddress,
          completionDate: certData.completionDate || new Date().toISOString(),
          issueDate: new Date().toISOString(),
          type: 'bulk_issued'
        };
        
        // Upload metadata (placeholder implementation)
        const metadataUri = await uploadCertificateMetadata(certificateMetadata);
        
        // Issue certificate on blockchain
        const result = await AranduContractService.issueCertificate(
          certData.studentWalletAddress,
          metadataUri,
          'course_completion'
        );
        
        // Save achievement in database
        await BlockchainDatabaseService.saveAchievement({
          walletAddress: certData.studentWalletAddress,
          type: 'certificate',
          name: certData.title || `Certificate - ${certData.courseName}`,
          description: certData.description,
          tokenId: result.tokenId,
          transactionHash: result.transactionHash,
          blockNumber: result.blockNumber,
          contractAddress: process.env.ARANDU_CERTIFICATES_CONTRACT,
          metadata: certificateMetadata
        });
        
        results.push({
          studentWalletAddress: certData.studentWalletAddress,
          courseName: certData.courseName,
          success: true,
          tokenId: result.tokenId,
          transactionHash: result.transactionHash
        });
        
        successful++;
        
        // Small delay to avoid nonce issues
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        results.push({
          studentWalletAddress: certData.studentWalletAddress,
          courseName: certData.courseName,
          success: false,
          error: error.message
        });
        failed++;
      }
    }
    
    res.json({
      success: true,
      message: `Processed ${certificates.length} certificate issuances`,
      results,
      summary: {
        totalProcessed: certificates.length,
        successful,
        failed,
        successRate: `${((successful / certificates.length) * 100).toFixed(2)}%`
      }
    });
    
  } catch (error) {
    console.error('❌ Error in bulk certificate issuance:', error);
    res.status(500).json({ 
      success: false,
      error: 'Bulk certificate issuance failed',
      details: error.message 
    });
  }
};

// ======================
// HELPER FUNCTIONS
// ======================

/**
 * Save education report to database
 */
async function saveEducationReport(reportData) {
  // TODO: Implement database storage for reports
  // This could be a separate table for audit trails
  console.log('📊 Report saved:', {
    type: reportData.reportType,
    hash: reportData.reportHash,
    transaction: reportData.transactionHash
  });
}

/**
 * Get recent blockchain events
 */
async function getRecentBlockchainEvents(limit = 10, contractAddress = null, eventName = null) {
  try {
    // TODO: Implement actual blockchain event retrieval from database
    // This is a placeholder implementation
    return [];
  } catch (error) {
    console.error('Error getting blockchain events:', error);
    return [];
  }
}

/**
 * Calculate default reward for retry
 */
function calculateDefaultReward(activityType, score) {
  const baseRewards = {
    quiz: 10,
    game: 15,
    lesson: 5,
    admin_reward: 20,
    teacher_reward: 15
  };
  
  const baseReward = baseRewards[activityType] || 10;
  const scoreMultiplier = score ? Math.max(0.5, score / 100) : 1;
  
  return Math.floor(baseReward * scoreMultiplier);
}

/**
 * Upload certificate metadata (placeholder)
 */
async function uploadCertificateMetadata(metadata) {
  // TODO: Implement actual IPFS upload
  const hash = Buffer.from(JSON.stringify(metadata)).toString('base64').slice(0, 32);
  return `https://ipfs.arandu.com/certificates/${hash}`;
}
