import { PrismaClient } from '@prisma/client';
import AranduContractService from './AranduContractService.js';

const prisma = new PrismaClient();

export class PrismaAranduService {
  
  // ======================
  // USER MANAGEMENT
  // ======================
  
  /**
   * Create user with wallet integration
   */
  async createUserWithWallet(userData) {
    try {
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          name: userData.name,
          password: userData.hashedPassword, // Your existing password logic
          walletAddress: userData.walletAddress?.toLowerCase(),
          walletType: userData.walletType || 'web3auth',
          blockchainVerified: true
        }
      });
      
      console.log(`👤 User created with wallet: ${user.email} -> ${user.walletAddress}`);
      return user;
      
    } catch (error) {
      console.error('❌ Error creating user with wallet:', error);
      throw error;
    }
  }

  /**
   * Link wallet to existing user
   */
  async linkWalletToUser(userId, walletAddress) {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          walletAddress: walletAddress.toLowerCase(),
          blockchainVerified: true,
          lastBlockchainSync: new Date()
        }
      });
      
      console.log(`🔗 Wallet linked: User ${userId} -> ${walletAddress}`);
      return user;
      
    } catch (error) {
      console.error('❌ Error linking wallet:', error);
      throw error;
    }
  }

  /**
   * Get user by wallet address
   */
  async getUserByWallet(walletAddress) {
    return await prisma.user.findUnique({
      where: { walletAddress: walletAddress.toLowerCase() },
      include: {
        achievements: {
          orderBy: { earnedAt: 'desc' },
          take: 20
        },
        activities: {
          orderBy: { completedAt: 'desc' },
          take: 10
        }
      }
    });
  }

  // ======================
  // ACTIVITY MANAGEMENT
  // ======================
  
  /**
   * Save activity completion with blockchain rewards
   */
  async saveActivityWithBlockchainReward(activityData) {
    try {
      const activity = await prisma.activity.create({
        data: {
          userId: activityData.userId,
          activityId: activityData.activityId,
          activityType: activityData.activityType || 'quiz',
          answers: activityData.answers,
          score: activityData.score,
          tokensEarned: activityData.tokensEarned?.toString(),
          transactionHash: activityData.transactionHash,
          badgesEarned: activityData.badgesEarned || [],
          blockchainProcessed: true,
          blockNumber: activityData.blockNumber
        }
      });
      
      // Update user's cached data
      if (activityData.tokensEarned) {
        await this.updateUserBlockchainCache(activityData.userId, {
          tokensEarned: activityData.tokensEarned,
          badgeCount: activityData.badgesEarned?.length || 0
        });
      }
      
      return activity;
      
    } catch (error) {
      console.error('❌ Error saving activity with blockchain reward:', error);
      throw error;
    }
  }

  /**
   * Get student activity history with blockchain data
   */
  async getStudentActivities(userId, limit = 20) {
    return await prisma.activity.findMany({
      where: { userId },
      orderBy: { completedAt: 'desc' },
      take: limit,
      select: {
        id: true,
        activityId: true,
        activityType: true,
        score: true,
        tokensEarned: true,
        badgesEarned: true,
        transactionHash: true,
        completedAt: true
      }
    });
  }

  // ======================
  // ACHIEVEMENT MANAGEMENT
  // ======================
  
  /**
   * Save blockchain achievement
   */
  async saveBlockchainAchievement(achievementData) {
    try {
      const user = await prisma.user.findUnique({
        where: { walletAddress: achievementData.walletAddress.toLowerCase() }
      });
      
      if (!user) {
        throw new Error(`User not found for wallet ${achievementData.walletAddress}`);
      }
      
      const achievement = await prisma.achievement.create({
        data: {
          userId: user.id,
          walletAddress: achievementData.walletAddress.toLowerCase(),
          type: achievementData.type,
          name: achievementData.name,
          description: achievementData.description || null,
          tokenId: achievementData.tokenId,
          contractAddress: achievementData.contractAddress,
          transactionHash: achievementData.transactionHash,
          blockNumber: achievementData.blockNumber,
          metadata: achievementData.metadata || {}
        }
      });
      
      console.log(`🏆 Achievement saved: ${achievement.name} for user ${user.id}`);
      return achievement;
      
    } catch (error) {
      console.error('❌ Error saving achievement:', error);
      throw error;
    }
  }

  /**
   * Get user achievements with metadata
   */
  async getUserAchievements(userId) {
    return await prisma.achievement.findMany({
      where: { 
        userId
      },
      orderBy: { earnedAt: 'desc' },
      select: {
        id: true,
        type: true,
        name: true,
        description: true,
        tokenId: true,
        earnedAt: true,
        transactionHash: true
      }
    });
  }

  // ======================
  // TEACHER CONTENT MANAGEMENT
  // ======================
  
  /**
   * Save teacher content with blockchain NFT data
   */
  async saveTeacherContent(contentData) {
    try {
      const content = await prisma.content.create({
        data: {
          teacherId: contentData.teacherId,
          title: contentData.title,
          description: contentData.description,
          content: contentData.content,
          ipfsHash: contentData.ipfsHash,
          metadataUri: contentData.metadataUri,
          price: contentData.price?.toString(),
          initialSupply: contentData.initialSupply,
          royaltyBps: contentData.royaltyBps,
          status: 'uploaded'
        }
      });
      
      console.log(`📚 Content saved: ${content.title} by teacher ${content.teacherId}`);
      return content;
      
    } catch (error) {
      console.error('❌ Error saving teacher content:', error);
      throw error;
    }
  }

  /**
   * Update content with NFT minting data
   */
  async updateContentWithNFTData(contentId, nftData) {
    try {
      const content = await prisma.content.update({
        where: { id: contentId },
        data: {
          masterTokenId: nftData.masterTokenId,
          licenseTokenId: nftData.licenseTokenId,
          contractAddress: nftData.contractAddress,
          mintTransactionHash: nftData.transactionHash,
          status: 'minted'
        }
      });
      
      console.log(`🎨 Content updated with NFT data: ${content.title}`);
      return content;
      
    } catch (error) {
      console.error('❌ Error updating content with NFT data:', error);
      throw error;
    }
  }

  // ======================
  // BLOCKCHAIN EVENT TRACKING
  // ======================
  
  /**
   * Save blockchain event
   */
  async saveBlockchainEvent(eventData) {
    try {
      const event = await prisma.blockchainEvent.create({
        data: {
          contractAddress: eventData.contractAddress.toLowerCase(),
          eventName: eventData.eventName,
          blockNumber: BigInt(eventData.blockNumber),
          transactionHash: eventData.transactionHash,
          eventData: eventData.eventData,
          processed: false
        }
      });
      
      return event;
      
    } catch (error) {
      // Ignore duplicate events
      if (error.code === 'P2002') {
        console.log(`⚠️ Duplicate event ignored: ${eventData.transactionHash}`);
        return null;
      }
      throw error;
    }
  }

  /**
   * Update sync status
   */
  async updateSyncStatus(contractAddress, blockNumber) {
    try {
      await prisma.syncStatus.upsert({
        where: { contractAddress: contractAddress.toLowerCase() },
        update: {
          lastSyncedBlock: BigInt(blockNumber),
          lastSyncTime: new Date(),
          syncErrors: 0,
          isHealthy: true
        },
        create: {
          contractAddress: contractAddress.toLowerCase(),
          contractName: this.getContractName(contractAddress),
          lastSyncedBlock: BigInt(blockNumber),
          lastSyncTime: new Date(),
          isHealthy: true
        }
      });
      
    } catch (error) {
      console.error('❌ Error updating sync status:', error);
      throw error;
    }
  }

  // ======================
  // ANALYTICS & REPORTING
  // ======================
  
  /**
   * Generate system metrics for transparency
   */
  async generateSystemMetrics() {
    try {
      const [
        totalUsers,
        activeUsers24h,
        totalActivities,
        totalBadges,
        totalCertificates
      ] = await Promise.all([
        prisma.user.count({ where: { blockchainVerified: true } }),
        prisma.user.count({
          where: {
            blockchainVerified: true,
            lastBlockchainSync: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
            }
          }
        }),
        prisma.activity.count({ where: { blockchainProcessed: true } }),
        prisma.achievement.count({ where: { type: 'badge' } }),
        prisma.achievement.count({ where: { type: 'certificate' } })
      ]);

      // Calculate total tokens distributed
      const tokenActivities = await prisma.activity.findMany({
        where: { 
          tokensEarned: { not: null },
          blockchainProcessed: true
        },
        select: { tokensEarned: true }
      });
      
      const totalTokensDistributed = tokenActivities.reduce((sum, activity) => {
        return sum + parseFloat(activity.tokensEarned || 0);
      }, 0);

      const metrics = {
        totalUsers,
        activeUsers24h,
        totalActivities,
        totalTokensDistributed: totalTokensDistributed.toString(),
        totalBadgesEarned: totalBadges,
        totalCertificatesIssued: totalCertificates
      };

      // Save metrics to database
      const savedMetrics = await prisma.systemMetrics.create({
        data: metrics
      });
      
      console.log(`📊 System metrics generated:`, metrics);
      return savedMetrics;
      
    } catch (error) {
      console.error('❌ Error generating system metrics:', error);
      throw error;
    }
  }

  /**
   * Get system statistics for dashboard
   */
  async getSystemStats() {
    try {
      const [
        totalUsers,
        totalActivities,
        totalAchievements
      ] = await Promise.all([
        prisma.user.count({ where: { blockchainVerified: true } }),
        prisma.activity.count({ where: { blockchainProcessed: true } }),
        prisma.achievement.count()
      ]);

      // Calculate blockchain processing rate
      const totalActivitiesAll = await prisma.activity.count();
      const blockchainProcessingRate = totalActivitiesAll > 0 
        ? Math.round((totalActivities / totalActivitiesAll) * 100) 
        : 0;

      return {
        totalUsers,
        totalActivities,
        totalAchievements,
        blockchainProcessingRate
      };
      
    } catch (error) {
      console.error('❌ Error getting system stats:', error);
      throw error;
    }
  }

  // ======================
  // UTILITY METHODS
  // ======================
  
  /**
   * Update user blockchain cache
   */
  async updateUserBlockchainCache(userId, cacheData) {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: {
          cachedTokenBalance: cacheData.tokensEarned || '0',
          cachedBadgeCount: cacheData.badgeCount || 0,
          lastBlockchainSync: new Date()
        }
      });
    } catch (error) {
      console.error('❌ Error updating user blockchain cache:', error);
    }
  }

  /**
   * Sync user blockchain data
   */
  async syncUserBlockchainData(walletAddress) {
    try {
      const user = await prisma.user.findUnique({
        where: { walletAddress: walletAddress.toLowerCase() }
      });
      
      if (!user) return null;
      
      // Get fresh blockchain data
      const blockchainStats = await AranduContractService.getStudentStats(walletAddress);
      
      // Update cached data
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          cachedTokenBalance: blockchainStats.currentTokenBalance,
          cachedBadgeCount: parseInt(blockchainStats.badgeCount),
          cachedStreakCount: parseInt(blockchainStats.currentStreak),
          lastBlockchainSync: new Date()
        }
      });
      
      return updatedUser;
      
    } catch (error) {
      console.error('❌ Error syncing user blockchain data:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive student data
   */
  async getStudentDashboardData(walletAddress) {
    try {
      const user = await this.getUserByWallet(walletAddress);
      if (!user) return null;
      
      // Get recent activities
      const recentActivities = await this.getStudentActivities(user.id, 5);
      
      // Get achievements
      const achievements = await this.getUserAchievements(user.id);
      
      // Sync with blockchain if cache is stale (older than 5 minutes)
      const cacheAge = Date.now() - user.lastBlockchainSync.getTime();
      if (cacheAge > 5 * 60 * 1000) {
        await this.syncUserBlockchainData(walletAddress);
      }
      
      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          walletAddress: user.walletAddress
        },
        blockchain: {
          currentTokenBalance: user.cachedTokenBalance,
          badgeCount: user.cachedBadgeCount,
          currentStreak: user.cachedStreakCount,
          lastSync: user.lastBlockchainSync
        },
        recentActivities,
        achievements,
        stats: {
          totalActivities: recentActivities.length,
          averageScore: this.calculateAverageScore(recentActivities),
          totalTokensEarned: this.calculateTotalTokens(recentActivities)
        }
      };
      
    } catch (error) {
      console.error('❌ Error getting student dashboard data:', error);
      throw error;
    }
  }

  // Helper methods
  getContractName(address) {
    const contracts = {
      [process.env.ANDU_TOKEN_ADDRESS?.toLowerCase()]: 'ANDUToken',
      [process.env.ARANDU_REWARDS_ADDRESS?.toLowerCase()]: 'AranduRewards',
      [process.env.ARANDU_BADGES_ADDRESS?.toLowerCase()]: 'AranduBadges',
      [process.env.ARANDU_CERTIFICATES_ADDRESS?.toLowerCase()]: 'AranduCertificates',
      [process.env.ARANDU_RESOURCES_ADDRESS?.toLowerCase()]: 'AranduResources',
      [process.env.DATA_ANCHOR_ADDRESS?.toLowerCase()]: 'DataAnchor'
    };
    
    return contracts[address.toLowerCase()] || 'Unknown';
  }

  calculateAverageScore(activities) {
    if (activities.length === 0) return 0;
    const totalScore = activities.reduce((sum, activity) => sum + (activity.score || 0), 0);
    return (totalScore / activities.length).toFixed(1);
  }

  calculateTotalTokens(activities) {
    return activities.reduce((sum, activity) => {
      return sum + parseFloat(activity.tokensEarned || 0);
    }, 0).toFixed(2);
  }
}

export default new PrismaAranduService();
