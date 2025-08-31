import { ethers } from 'ethers';
import { createRequire } from 'module';
import { ARANDU_CONFIG, backendSigner } from '../config/blockchain.js';

const require = createRequire(import.meta.url);

// Import ABIs
const ANDUTokenABI = require('../abis/ANDUToken.json');
const AranduRewardsABI = require('../abis/AranduRewards.json');
const AranduBadgesABI = require('../abis/AranduBadges.json');
const AranduCertificatesABI = require('../abis/AranduCertificates.json');
const DataAnchorABI = require('../abis/DataAnchor.json');

class AranduContractService {
  constructor() {
    this.contracts = null;
    this.initialized = false;
  }

  initializeContracts() {
    if (!backendSigner) {
      console.warn('⚠️ Backend signer not available. Blockchain operations will be limited.');
      return null;
    }

    return {
      anduToken: new ethers.Contract(
        ARANDU_CONFIG.contracts.ANDUToken,
        ANDUTokenABI,
        backendSigner
      ),
      aranduRewards: new ethers.Contract(
        ARANDU_CONFIG.contracts.AranduRewards,
        AranduRewardsABI,
        backendSigner
      ),
      aranduBadges: new ethers.Contract(
        ARANDU_CONFIG.contracts.AranduBadges,
        AranduBadgesABI,
        backendSigner
      ),
      aranduCertificates: new ethers.Contract(
        ARANDU_CONFIG.contracts.AranduCertificates,
        AranduCertificatesABI,
        backendSigner
      ),
      dataAnchor: new ethers.Contract(
        ARANDU_CONFIG.contracts.DataAnchor,
        DataAnchorABI,
        backendSigner
      )
    };
  }

  async initialize() {
    if (this.initialized) return;

    this.contracts = this.initializeContracts();

    if (!this.contracts) {
      console.warn('⚠️ Contracts not initialized due to missing backend signer');
      return;
    }

    try {
      // Verify backend is owner of contracts
      const isOwner = await this.contracts.aranduRewards.owner();
      console.log(`🔐 Backend is owner: ${isOwner === backendSigner.address}`);

      this.initialized = true;
      console.log('✅ ARANDU contracts initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize contracts:', error.message);
      throw error;
    }
  }

  // ======================
  // STUDENT FUNCTIONS
  // ======================

  /**
   * Grant token rewards to student (with automatic badge checking)
   */
  async grantTokenReward(studentWalletAddress, amount, isStreakActivity = false) {
    if (!this.contracts) {
      throw new Error('Contracts not initialized');
    }

    try {
      const checkedAddress = ethers.getAddress(studentWalletAddress);
      const amountWei = ethers.parseEther(amount.toString());

      console.log(`💰 Granting ${amount} ANDU to ${checkedAddress}`);

      const tx = await this.contracts.aranduRewards['grantTokenReward(address,uint256,bool)'](
        checkedAddress,
        amountWei,
        isStreakActivity
      );

      const receipt = await tx.wait();

      // Check for badge events in the receipt
      const badgeEvents = receipt.logs
        .filter(log => {
          try {
            const decoded = this.contracts.aranduRewards.interface.parseLog(log);
            return decoded && decoded.name === 'BadgeGranted';
          } catch {
            return false;
          }
        })
        .map(log => {
          const decoded = this.contracts.aranduRewards.interface.parseLog(log);
          return {
            student: decoded.args.student,
            badgeName: decoded.args.badgeName
          };
        });

      console.log(`✅ Token reward granted: ${tx.hash}`);
      if (badgeEvents.length > 0) {
        console.log(`🎉 Badges earned: ${badgeEvents.map(e => e.badgeName).join(', ')}`);
      }

      return {
        success: true,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        tokensGranted: amount,
        badgesEarned: badgeEvents,
        gasUsed: receipt.gasUsed.toString()
      };

    } catch (error) {
      console.error('❌ Error granting token reward:', error);
      throw this.handleContractError(error);
    }
  }

  /**
   * Issue certificate to student
   */
  async issueCertificate(studentWalletAddress, metadataUri, certificateType = 'student') {
    if (!this.contracts) {
      throw new Error('Contracts not initialized');
    }

    try {
      const checkedAddress = ethers.getAddress(studentWalletAddress);
      console.log(`🎓 Issuing ${certificateType} certificate to ${checkedAddress}`);

      const tx = await this.contracts.aranduRewards.issueCertificate(
        checkedAddress,
        metadataUri,
        certificateType
      );

      const receipt = await tx.wait();

      // Extract token ID from mint event
      const mintEvent = receipt.logs.find(log => {
        try {
          const decoded = this.contracts.aranduCertificates.interface.parseLog(log);
          return decoded && decoded.name === 'Transfer' && decoded.args.from === ethers.ZeroAddress;
        } catch {
          return false;
        }
      });

      let tokenId = null;
      if (mintEvent) {
        const decoded = this.contracts.aranduCertificates.interface.parseLog(mintEvent);
        tokenId = decoded.args.tokenId.toString();
      }

      console.log(`✅ Certificate issued: ${tx.hash}, Token ID: ${tokenId}`);

      return {
        success: true,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        tokenId,
        metadataUri,
        certificateType
      };

    } catch (error) {
      console.error('❌ Error issuing certificate:', error);
      throw this.handleContractError(error);
    }
  }

  /**
   * Grant badge manually (for special events)
   */
  async grantBadge(studentWalletAddress, badgeName) {
    if (!this.contracts) {
      throw new Error('Contracts not initialized');
    }

    try {
      const checkedAddress = ethers.getAddress(studentWalletAddress);
      console.log(`🏆 Granting badge "${badgeName}" to ${checkedAddress}`);

      const tx = await this.contracts.aranduRewards.grantBadgeReward(
        checkedAddress,
        badgeName
      );

      const receipt = await tx.wait();

      console.log(`✅ Badge granted: ${tx.hash}`);

      return {
        success: true,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        badgeName
      };

    } catch (error) {
      console.error('❌ Error granting badge:', error);
      throw this.handleContractError(error);
    }
  }

  /**
   * Get student statistics from blockchain
   */
  async getStudentStats(studentWalletAddress) {
    if (!this.contracts) {
      throw new Error('Contracts not initialized');
    }

    try {
      const checkedAddress = ethers.getAddress(studentWalletAddress);
      const [stats, tokenBalance, badgeBalance, certificateBalance] = await Promise.all([
        this.contracts.aranduRewards.getStudentStats(checkedAddress),
        this.contracts.anduToken.balanceOf(checkedAddress),
        this.contracts.aranduBadges.balanceOf(checkedAddress),
        this.contracts.aranduCertificates.balanceOf(checkedAddress)
      ]);

      return {
        tokensEarned: ethers.formatEther(stats.tokensEarned),
        certificatesEarned: stats.certificatesEarned.toString(),
        currentStreak: stats.currentStreak.toString(),
        currentTokenBalance: ethers.formatEther(tokenBalance),
        badgeCount: badgeBalance.toString(),
        certificateCount: certificateBalance.toString()
      };

    } catch (error) {
      console.error('❌ Error getting student stats:', error);
      throw this.handleContractError(error);
    }
  }

  // ======================
  // TEACHER FUNCTIONS
  // ======================

  /**
   * Add teacher role to wallet address
   */
  async addTeacher(teacherWalletAddress) {
    if (!this.contracts) {
      throw new Error('Contracts not initialized');
    }

    try {
      const checkedAddress = ethers.getAddress(teacherWalletAddress);
      console.log(`👨‍🏫 Adding teacher role to ${checkedAddress}`);

      const tx = await this.contracts.anduToken.addTeacher(checkedAddress);
      const receipt = await tx.wait();

      console.log(`✅ Teacher role granted: ${tx.hash}`);

      return {
        success: true,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber
      };

    } catch (error) {
      console.error('❌ Error adding teacher:', error);
      throw this.handleContractError(error);
    }
  }

  /**
   * Check if address has teacher role
   */
  async isTeacher(walletAddress) {
    if (!this.contracts) {
      return false;
    }

    try {
      const checkedAddress = ethers.getAddress(walletAddress);
      return await this.contracts.anduToken.isTeacher(checkedAddress);
    } catch (error) {
      console.error('❌ Error checking teacher status:', error);
      return false;
    }
  }

  /**
   * Issue teacher certificate
   */
  async issueTeacherCertificate(teacherWalletAddress, metadataUri) {
    return await this.issueCertificate(teacherWalletAddress, metadataUri, 'teacher');
  }

  // ======================
  // ADMIN FUNCTIONS
  // ======================

  /**
   * Anchor data hash for transparency
   */
  async anchorDataHash(dataHash) {
    if (!this.contracts) {
      throw new Error('Contracts not initialized');
    }

    try {
      console.log(`🔗 Anchoring data hash: ${dataHash}`);

      const tx = await this.contracts.dataAnchor.anchorHash(dataHash);
      const receipt = await tx.wait();

      console.log(`✅ Data anchored: ${tx.hash}`);

      return {
        success: true,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        dataHash
      };

    } catch (error) {
      console.error('❌ Error anchoring data:', error);
      throw this.handleContractError(error);
    }
  }

  /**
   * Get anchored data information
   */
  async getAnchoredData(dataHash) {
    if (!this.contracts) {
      throw new Error('Contracts not initialized');
    }

    try {
      const anchorData = await this.contracts.dataAnchor.getAnchorData(dataHash);

      return {
        hash: anchorData.hash,
        timestamp: new Date(Number(anchorData.timestamp) * 1000).toISOString(),
        publisher: anchorData.publisher,
        exists: anchorData.timestamp > 0
      };

    } catch (error) {
      console.error('❌ Error getting anchored data:', error);
      throw this.handleContractError(error);
    }
  }

  // ======================
  // UTILITY FUNCTIONS
  // ======================

  /**
   * Get current gas price for optimization
   */
  async getCurrentGasPrice() {
    if (!backendSigner) {
      return null;
    }

    try {
      const feeData = await backendSigner.provider.getFeeData();
      return {
        gasPrice: ethers.formatUnits(feeData.gasPrice, 'gwei'),
        maxFeePerGas: ethers.formatUnits(feeData.maxFeePerGas, 'gwei'),
        maxPriorityFeePerGas: ethers.formatUnits(feeData.maxPriorityFeePerGas, 'gwei')
      };
    } catch (error) {
      console.error('❌ Error getting gas price:', error);
      return null;
    }
  }

  /**
   * Check backend wallet balance
   */
  async getBackendBalance() {
    if (!backendSigner) {
      throw new Error('Backend signer not available');
    }

    try {
      const balance = await backendSigner.provider.getBalance(backendSigner.address);
      return {
        address: backendSigner.address,
        balance: ethers.formatEther(balance),
        balanceWei: balance.toString()
      };
    } catch (error) {
      console.error('❌ Error getting backend balance:', error);
      throw error;
    }
  }

  /**
   * Handle contract errors with user-friendly messages
   */
  handleContractError(error) {
    const errorMappings = {
      'insufficient funds': 'Backend wallet needs more ETH for gas',
      'AccessControlUnauthorizedAccount': 'Backend lacks required permissions',
      'AranduRewards: Badge already granted': 'Student already has this badge',
      'AranduRewards: Token address not set': 'Contract not properly configured',
      'execution reverted': 'Transaction validation failed'
    };

    const userMessage = Object.keys(errorMappings).find(key =>
      error.message.includes(key)
    );

    return {
      name: 'ContractError',
      message: userMessage ? errorMappings[userMessage] : 'Blockchain transaction failed',
      originalError: error.message,
      code: error.code
    };
  }
}

export default new AranduContractService();
