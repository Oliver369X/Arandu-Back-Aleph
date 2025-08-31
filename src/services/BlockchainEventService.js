import { ethers } from 'ethers';
import { PrismaClient } from '@prisma/client';
import { ARANDU_CONFIG, provider } from '../config/blockchain.js';
import AranduContractService from './AranduContractService.js';
import BlockchainDatabaseService from './BlockchainDatabaseService.js';

const prisma = new PrismaClient();

class BlockchainEventService {
  constructor() {
    this.isListening = false;
    this.eventListeners = new Map();
    this.retryInterval = null;
    this.pollingInterval = null;
    this.lastProcessedBlock = null;
  }

  async startEventListening() {
    if (this.isListening) {
      console.log('🎧 Event listening already active');
      return;
    }
    
    if (!AranduContractService.contracts) {
      console.warn('⚠️ Contracts not initialized. Skipping event listening.');
      return;
    }
    
    console.log('🎧 Starting blockchain event listening...');
    this.isListening = true;
    
    try {
      // Setup listeners for each contract
      await this.setupAranduRewardsListeners();
      await this.setupAranduBadgesListeners();
      await this.setupAranduCertificatesListeners();
      await this.setupDataAnchorListeners();
      
      // Sync historical events on startup
      await this.syncHistoricalEvents();
      
      // Start retry mechanism for failed transactions
      this.startRetryMechanism();
      
      console.log('✅ Blockchain event listening started successfully');
    } catch (error) {
      console.error('❌ Failed to start event listening:', error);
      this.isListening = false;
      throw error;
    }
  }

  async setupAranduRewardsListeners() {
    // Use polling instead of filters for better compatibility with Lisk Sepolia
    console.log('🎧 Setting up polling-based event listeners for better RPC compatibility...');
    
    // Start polling for new events every 30 seconds
    this.startEventPolling();
  }

  async setupAranduBadgesListeners() {
    // Handled by polling
  }

  async setupAranduCertificatesListeners() {
    // Handled by polling
  }

  async setupDataAnchorListeners() {
    // Handled by polling
  }

  startEventPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
    
    console.log('🔄 Starting event polling every 30 seconds...');
    
    // Poll immediately
    this.pollForEvents();
    
    // Then poll every 30 seconds
    this.pollingInterval = setInterval(() => {
      this.pollForEvents();
    }, 30000);
  }

  async pollForEvents() {
    if (!AranduContractService.contracts || !provider) {
      return;
    }

    try {
      // Get current block
      const currentBlock = await provider.getBlockNumber();
      
      // Get the last processed block from memory or default to current - 100
      const lastProcessedBlock = this.lastProcessedBlock || (currentBlock - 100);
      
      // Only process new blocks
      if (currentBlock <= lastProcessedBlock) {
        return;
      }
      
      const fromBlock = lastProcessedBlock + 1;
      const toBlock = Math.min(currentBlock, fromBlock + 50); // Process max 50 blocks at a time
      
      console.log(`🔍 Polling events from block ${fromBlock} to ${toBlock}...`);
      
      // Poll each contract for events
      await this.pollContractEvents(AranduContractService.contracts.aranduRewards, 'AranduRewards', fromBlock, toBlock);
      await this.pollContractEvents(AranduContractService.contracts.aranduBadges, 'AranduBadges', fromBlock, toBlock);
      await this.pollContractEvents(AranduContractService.contracts.aranduCertificates, 'AranduCertificates', fromBlock, toBlock);
      await this.pollContractEvents(AranduContractService.contracts.dataAnchor, 'DataAnchor', fromBlock, toBlock);
      
      // Update last processed block
      this.lastProcessedBlock = toBlock;
      
    } catch (error) {
      console.error('❌ Error polling for events:', error.message);
    }
  }

  async pollContractEvents(contract, contractName, fromBlock, toBlock) {
    try {
      const events = await contract.queryFilter('*', fromBlock, toBlock);
      
      if (events.length > 0) {
        console.log(`📋 Found ${events.length} new events for ${contractName}`);
        
        for (const event of events) {
          await this.processPolledEvent(event, contractName);
        }
      }
      
    } catch (error) {
      console.error(`❌ Error polling ${contractName} events:`, error.message);
    }
  }

  async processPolledEvent(event, contractName) {
    try {
      if (!event.fragment || !event.fragment.name) {
        return;
      }

      const eventName = event.fragment.name;
      const args = event.args;

      switch (eventName) {
        case 'TokenRewardGranted':
          console.log(`💰 Token reward: ${ethers.formatEther(args.amount)} ANDU to ${args.student}`);
          await this.processTokenRewardEvent({
            student: args.student,
            amount: ethers.formatEther(args.amount),
            transactionHash: event.transactionHash,
            blockNumber: event.blockNumber
          });
          break;

        case 'BadgeGranted':
          console.log(`🎉 Badge granted: ${args.badgeName} to ${args.student}`);
          await this.processBadgeGrantedEvent({
            student: args.student,
            badgeName: args.badgeName,
            transactionHash: event.transactionHash,
            blockNumber: event.blockNumber
          });
          break;

        case 'CertificateIssued':
          console.log(`🎓 Certificate issued: ${args.certificateType} (ID: ${args.tokenId}) to ${args.student}`);
          await this.processCertificateIssuedEvent({
            student: args.student,
            tokenId: args.tokenId.toString(),
            certificateType: args.certificateType,
            transactionHash: event.transactionHash,
            blockNumber: event.blockNumber
          });
          break;

        case 'StreakUpdated':
          console.log(`🔥 Streak updated: ${args.newStreak} for ${args.student}`);
          await this.processStreakUpdatedEvent({
            student: args.student,
            newStreak: args.newStreak.toString(),
            transactionHash: event.transactionHash,
            blockNumber: event.blockNumber
          });
          break;

        case 'AchievementUnlocked':
          console.log(`🏆 Achievement unlocked: ${args.achievement} for ${args.student}`);
          await this.processAchievementUnlockedEvent({
            student: args.student,
            achievement: args.achievement,
            transactionHash: event.transactionHash,
            blockNumber: event.blockNumber
          });
          break;

        case 'BadgeMinted':
          console.log(`🏅 Badge minted: ${args.badgeName} (ID: ${args.tokenId}) to ${args.student}`);
          await this.processBadgeMintedEvent({
            student: args.student,
            tokenId: args.tokenId.toString(),
            badgeName: args.badgeName,
            transactionHash: event.transactionHash,
            blockNumber: event.blockNumber
          });
          break;

        case 'DataAnchored':
          console.log(`🔗 Data anchored: ${args.dataHash} by ${args.publisher}`);
          await this.processDataAnchoredEvent({
            dataHash: args.dataHash,
            publisher: args.publisher,
            timestamp: args.timestamp.toString(),
            transactionHash: event.transactionHash,
            blockNumber: event.blockNumber
          });
          break;
      }

    } catch (error) {
      console.error(`❌ Error processing polled event:`, error.message);
    }
  }

  // ======================
  // EVENT PROCESSORS
  // ======================

  async processTokenRewardEvent(eventData) {
    // Save blockchain event
    await BlockchainDatabaseService.saveBlockchainEvent({
      contractAddress: ARANDU_CONFIG.contracts.AranduRewards,
      eventName: 'TokenRewardGranted',
      blockNumber: eventData.blockNumber,
      transactionHash: eventData.transactionHash,
      eventData: eventData,
      processed: true
    });
    
    // Update user's cached token balance
    await this.syncUserBlockchainData(eventData.student);
    
    // Trigger real-time notification
    await this.notifyFrontend(eventData.student, {
      type: 'token_reward',
      amount: eventData.amount,
      transactionHash: eventData.transactionHash
    });
  }

  async processBadgeGrantedEvent(eventData) {
    // Save achievement
    await BlockchainDatabaseService.saveAchievement({
      walletAddress: eventData.student,
      type: 'badge',
      name: eventData.badgeName,
      description: `Badge earned: ${eventData.badgeName}`,
      transactionHash: eventData.transactionHash,
      blockNumber: eventData.blockNumber,
      contractAddress: ARANDU_CONFIG.contracts.AranduBadges
    });
    
    // Save blockchain event
    await BlockchainDatabaseService.saveBlockchainEvent({
      contractAddress: ARANDU_CONFIG.contracts.AranduRewards,
      eventName: 'BadgeGranted',
      blockNumber: eventData.blockNumber,
      transactionHash: eventData.transactionHash,
      eventData: eventData,
      processed: true
    });
    
    // Update user's cached badge count
    await this.syncUserBlockchainData(eventData.student);
    
    // Trigger real-time notification
    await this.notifyFrontend(eventData.student, {
      type: 'badge_earned',
      badgeName: eventData.badgeName,
      transactionHash: eventData.transactionHash
    });
  }

  async processCertificateIssuedEvent(eventData) {
    // Save achievement
    await BlockchainDatabaseService.saveAchievement({
      walletAddress: eventData.student,
      type: 'certificate',
      name: `Certificate - ${eventData.certificateType}`,
      description: `Certificate earned: ${eventData.certificateType}`,
      tokenId: BigInt(eventData.tokenId),
      transactionHash: eventData.transactionHash,
      blockNumber: eventData.blockNumber,
      contractAddress: ARANDU_CONFIG.contracts.AranduCertificates
    });
    
    // Save blockchain event
    await BlockchainDatabaseService.saveBlockchainEvent({
      contractAddress: ARANDU_CONFIG.contracts.AranduRewards,
      eventName: 'CertificateIssued',
      blockNumber: eventData.blockNumber,
      transactionHash: eventData.transactionHash,
      eventData: eventData,
      processed: true
    });
    
    // Update user's cached certificate count
    await this.syncUserBlockchainData(eventData.student);
    
    // Trigger real-time notification
    await this.notifyFrontend(eventData.student, {
      type: 'certificate_earned',
      certificateType: eventData.certificateType,
      tokenId: eventData.tokenId,
      transactionHash: eventData.transactionHash
    });
  }

  async processStreakUpdatedEvent(eventData) {
    // Update user's cached streak count
    const user = await BlockchainDatabaseService.getUserByWalletAddress(eventData.student);
    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          cachedStreakCount: parseInt(eventData.newStreak),
          lastBlockchainSync: new Date()
        }
      });
    }
    
    // Save blockchain event
    await BlockchainDatabaseService.saveBlockchainEvent({
      contractAddress: ARANDU_CONFIG.contracts.AranduRewards,
      eventName: 'StreakUpdated',
      blockNumber: eventData.blockNumber,
      transactionHash: eventData.transactionHash,
      eventData: eventData,
      processed: true
    });
    
    // Trigger real-time notification
    await this.notifyFrontend(eventData.student, {
      type: 'streak_updated',
      newStreak: eventData.newStreak,
      transactionHash: eventData.transactionHash
    });
  }

  async processAchievementUnlockedEvent(eventData) {
    // Save achievement
    await BlockchainDatabaseService.saveAchievement({
      walletAddress: eventData.student,
      type: 'achievement',
      name: eventData.achievement,
      description: `Achievement unlocked: ${eventData.achievement}`,
      transactionHash: eventData.transactionHash,
      blockNumber: eventData.blockNumber,
      contractAddress: ARANDU_CONFIG.contracts.AranduRewards
    });
    
    // Save blockchain event
    await BlockchainDatabaseService.saveBlockchainEvent({
      contractAddress: ARANDU_CONFIG.contracts.AranduRewards,
      eventName: 'AchievementUnlocked',
      blockNumber: eventData.blockNumber,
      transactionHash: eventData.transactionHash,
      eventData: eventData,
      processed: true
    });
    
    // Trigger real-time notification
    await this.notifyFrontend(eventData.student, {
      type: 'achievement_unlocked',
      achievement: eventData.achievement,
      transactionHash: eventData.transactionHash
    });
  }

  async processBadgeMintedEvent(eventData) {
    // This is handled by the BadgeGranted event from AranduRewards
    // Just save the blockchain event for audit trail
    await BlockchainDatabaseService.saveBlockchainEvent({
      contractAddress: ARANDU_CONFIG.contracts.AranduBadges,
      eventName: 'BadgeMinted',
      blockNumber: eventData.blockNumber,
      transactionHash: eventData.transactionHash,
      eventData: eventData,
      processed: true
    });
  }

  async processCertificateNFTEvent(eventData) {
    // This is handled by the CertificateIssued event from AranduRewards
    // Just save the blockchain event for audit trail
    await BlockchainDatabaseService.saveBlockchainEvent({
      contractAddress: ARANDU_CONFIG.contracts.AranduCertificates,
      eventName: 'CertificateIssued',
      blockNumber: eventData.blockNumber,
      transactionHash: eventData.transactionHash,
      eventData: eventData,
      processed: true
    });
  }

  async processDataAnchoredEvent(eventData) {
    // Save blockchain event
    await BlockchainDatabaseService.saveBlockchainEvent({
      contractAddress: ARANDU_CONFIG.contracts.DataAnchor,
      eventName: 'DataAnchored',
      blockNumber: eventData.blockNumber,
      transactionHash: eventData.transactionHash,
      eventData: eventData,
      processed: true
    });
    
    console.log(`📊 Data hash ${eventData.dataHash} anchored by ${eventData.publisher}`);
  }

  // ======================
  // UTILITY FUNCTIONS
  // ======================

  async syncUserBlockchainData(walletAddress) {
    try {
      const blockchainStats = await AranduContractService.getStudentStats(walletAddress);
      await BlockchainDatabaseService.syncUserWithBlockchain(walletAddress, blockchainStats);
    } catch (error) {
      console.error('❌ Error syncing user blockchain data:', error);
    }
  }

  async notifyFrontend(walletAddress, notification) {
    // TODO: Implement real-time notifications
    // This could be WebSocket, SSE, or push notifications
    console.log(`📢 Notification for ${walletAddress}:`, notification);
    
    // If you have WebSocket setup:
    // io.to(`user:${walletAddress.toLowerCase()}`).emit('blockchain-update', notification);
    
    // If you have push notification service:
    // await pushNotificationService.send(walletAddress, notification);
  }

  async syncHistoricalEvents() {
    if (!provider) {
      console.warn('⚠️ Provider not available for historical sync');
      return;
    }
    
    try {
      // Sync events from the last 24 hours on startup
      const currentBlock = await provider.getBlockNumber();
      const fromBlock = Math.max(0, currentBlock - 7200); // ~24 hours on Lisk (assuming 12s blocks)
      
      console.log(`📊 Syncing events from block ${fromBlock} to ${currentBlock}...`);
      
      const contracts = [
        { contract: AranduContractService.contracts.aranduRewards, name: 'AranduRewards' },
        { contract: AranduContractService.contracts.aranduBadges, name: 'AranduBadges' },
        { contract: AranduContractService.contracts.aranduCertificates, name: 'AranduCertificates' },
        { contract: AranduContractService.contracts.dataAnchor, name: 'DataAnchor' }
      ];
      
      for (const { contract, name } of contracts) {
        try {
          const events = await contract.queryFilter('*', fromBlock, currentBlock);
          console.log(`📋 Found ${events.length} historical events for ${name}`);
          
          for (const event of events) {
            await this.processHistoricalEvent(event, name);
          }
        } catch (error) {
          console.error(`❌ Error syncing ${name} events:`, error);
        }
      }
      
      console.log('✅ Historical event sync completed');
      
    } catch (error) {
      console.error('❌ Error syncing historical events:', error);
    }
  }

  async processHistoricalEvent(event, contractName) {
    try {
      // Save historical event (if not already processed)
      const eventData = {
        contractAddress: event.address,
        eventName: event.fragment?.name || event.eventName || 'Unknown',
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        eventData: {
          args: event.args ? Object.keys(event.args).reduce((acc, key) => {
            if (isNaN(key)) {
              acc[key] = event.args[key]?.toString ? event.args[key].toString() : event.args[key];
            }
            return acc;
          }, {}) : {},
          contractName
        },
        processed: false
      };
      
      await BlockchainDatabaseService.saveBlockchainEvent(eventData);
    } catch (error) {
      // Ignore duplicate events
      if (!error.message.includes('unique constraint')) {
        console.error('Error processing historical event:', error);
      }
    }
  }

  startRetryMechanism() {
    // Retry failed transactions every 5 minutes
    this.retryInterval = setInterval(async () => {
      try {
        const activitiesNeedingRetry = await BlockchainDatabaseService.getActivitiesNeedingRetry(3);
        
        if (activitiesNeedingRetry.length > 0) {
          console.log(`🔄 Retrying ${activitiesNeedingRetry.length} failed transactions...`);
          
          for (const activity of activitiesNeedingRetry) {
            if (!activity.user?.walletAddress) continue;
            
            try {
              const rewardAmount = activity.tokensEarned ? 
                parseFloat(activity.tokensEarned) : 10;
              
              const result = await AranduContractService.grantTokenReward(
                activity.user.walletAddress,
                rewardAmount,
                false
              );
              
              await BlockchainDatabaseService.updateActivityWithBlockchainData(activity.id, {
                tokensEarned: rewardAmount,
                transactionHash: result.transactionHash,
                badgesEarned: result.badgesEarned
              });
              
              console.log(`✅ Retry successful for activity ${activity.id}`);
              
              // Small delay between retries
              await new Promise(resolve => setTimeout(resolve, 2000));
              
            } catch (error) {
              console.error(`❌ Retry failed for activity ${activity.id}:`, error.message);
            }
          }
        }
      } catch (error) {
        console.error('❌ Error in retry mechanism:', error);
      }
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  async stopEventListening() {
    if (!this.isListening) return;
    
    console.log('🛑 Stopping blockchain event listening...');
    
    // Clear polling interval
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    
    // Clear retry interval
    if (this.retryInterval) {
      clearInterval(this.retryInterval);
      this.retryInterval = null;
    }
    
    this.eventListeners.clear();
    this.isListening = false;
    
    console.log('✅ Event listening stopped');
  }
}

export default new BlockchainEventService();
