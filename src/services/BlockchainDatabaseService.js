import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class BlockchainDatabaseService {

  /**
   * Create or update user with wallet address
   */
  async createOrUpdateUserWithWallet(userData) {
    try {
      const user = await prisma.user.upsert({
        where: { email: userData.email },
        update: {
          walletAddress: userData.walletAddress?.toLowerCase(),
          walletType: userData.walletType || 'web3auth',
          blockchainVerified: true,
          lastBlockchainSync: new Date()
        },
        create: {
          id: userData.id || undefined,
          email: userData.email,
          name: userData.name,
          password: userData.password, // Should be hashed
          walletAddress: userData.walletAddress?.toLowerCase(),
          walletType: userData.walletType || 'web3auth',
          blockchainVerified: true
        }
      });

      return user;
    } catch (error) {
      console.error('❌ Error creating/updating user:', error);
      throw error;
    }
  }

  /**
   * Save activity completion with blockchain data
   */
  async saveActivityCompletion(userId, activityData) {
    try {
      const activity = await prisma.activity.create({
        data: {
          userId: userId,
          activityId: activityData.activityId,
          activityType: activityData.activityType || 'quiz',
          answers: activityData.answers || null,
          score: activityData.score || null,
          tokensEarned: activityData.tokensEarned?.toString(),
          transactionHash: activityData.transactionHash,
          badgesEarned: activityData.badgesEarned || [],
          blockchainProcessed: !!activityData.transactionHash
        }
      });

      return activity;
    } catch (error) {
      console.error('❌ Error saving activity:', error);
      throw error;
    }
  }

  /**
   * Update activity with blockchain transaction data
   */
  async updateActivityWithBlockchainData(activityId, blockchainData) {
    try {
      const activity = await prisma.activity.update({
        where: { id: activityId },
        data: {
          tokensEarned: blockchainData.tokensEarned?.toString(),
          transactionHash: blockchainData.transactionHash,
          badgesEarned: blockchainData.badgesEarned || [],
          blockchainProcessed: true
        }
      });

      return activity;
    } catch (error) {
      console.error('❌ Error updating activity:', error);
      throw error;
    }
  }

  /**
   * Save blockchain achievement
   */
  async saveAchievement(achievementData) {
    try {
      const user = await prisma.user.findUnique({
        where: { walletAddress: achievementData.walletAddress.toLowerCase() }
      });

      if (!user) {
        throw new Error('User not found for wallet address');
      }

      const achievement = await prisma.achievement.create({
        data: {
          userId: user.id,
          walletAddress: achievementData.walletAddress.toLowerCase(),
          type: achievementData.type,
          name: achievementData.name,
          description: achievementData.description,
          tokenId: achievementData.tokenId ? BigInt(achievementData.tokenId) : null,
          contractAddress: achievementData.contractAddress,
          transactionHash: achievementData.transactionHash,
          blockNumber: achievementData.blockNumber ? BigInt(achievementData.blockNumber) : null,
          metadata: achievementData.metadata || {}
        }
      });

      return achievement;
    } catch (error) {
      console.error('❌ Error saving achievement:', error);
      throw error;
    }
  }

  /**
   * Sync user data with blockchain
   */
  async syncUserWithBlockchain(walletAddress, blockchainStats) {
    try {
      const user = await prisma.user.findUnique({
        where: { walletAddress: walletAddress.toLowerCase() }
      });

      if (!user) return null;

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
      console.error('❌ Error syncing user with blockchain:', error);
      throw error;
    }
  }

  /**
   * Get user by wallet address
   */
  async getUserByWalletAddress(walletAddress) {
    try {
      const user = await prisma.user.findUnique({
        where: { walletAddress: walletAddress.toLowerCase() },
        include: {
          userRoles: {
            include: {
              role: true
            }
          },
          activities: {
            orderBy: { completedAt: 'desc' },
            take: 10
          },
          achievements: {
            orderBy: { earnedAt: 'desc' }
          }
        }
      });

      return user;
    } catch (error) {
      console.error('❌ Error getting user by wallet:', error);
      throw error;
    }
  }

  /**
   * Get user activities with blockchain data
   */
  async getUserActivities(userId, limit = 20) {
    try {
      const activities = await prisma.activity.findMany({
        where: { userId },
        orderBy: { completedAt: 'desc' },
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              walletAddress: true
            }
          }
        }
      });

      return activities;
    } catch (error) {
      console.error('❌ Error getting user activities:', error);
      throw error;
    }
  }

  /**
   * Mark activity for retry (if blockchain transaction fails)
   */
  async markActivityForRetry(userId, activityId, errorMessage) {
    try {
      const activity = await prisma.activity.findFirst({
        where: {
          userId,
          activityId
        },
        orderBy: { completedAt: 'desc' }
      });

      if (activity) {
        await prisma.activity.update({
          where: { id: activity.id },
          data: {
            blockchainProcessed: false,
            metadata: {
              ...activity.metadata,
              retryError: errorMessage,
              needsRetry: true,
              lastRetryAt: new Date()
            }
          }
        });
      }
    } catch (error) {
      console.error('❌ Error marking activity for retry:', error);
    }
  }

  /**
   * Get activities that need blockchain retry
   */
  async getActivitiesNeedingRetry(limit = 10) {
    try {
      const activities = await prisma.activity.findMany({
        where: {
          blockchainProcessed: false,
          transactionHash: null
        },
        orderBy: { completedAt: 'asc' },
        take: limit,
        include: {
          user: {
            select: {
              walletAddress: true
            }
          }
        }
      });

      return activities;
    } catch (error) {
      console.error('❌ Error getting activities for retry:', error);
      return [];
    }
  }

  /**
   * Save blockchain event for processing
   */
  async saveBlockchainEvent(eventData) {
    try {
      const event = await prisma.blockchainEvent.create({
        data: {
          contractAddress: eventData.contractAddress,
          eventName: eventData.eventName,
          blockNumber: BigInt(eventData.blockNumber),
          transactionHash: eventData.transactionHash,
          eventData: eventData.eventData,
          processed: eventData.processed || false
        }
      });

      return event;
    } catch (error) {
      console.error('❌ Error saving blockchain event:', error);
      throw error;
    }
  }

  /**
   * Get system statistics for admin dashboard
   */
  async getSystemStats() {
    try {
      const [
        totalUsers,
        totalActivities,
        totalAchievements,
        recentActivities,
        blockchainProcessedCount,
        pendingRetries
      ] = await Promise.all([
        prisma.user.count(),
        prisma.activity.count(),
        prisma.achievement.count(),
        prisma.activity.count({
          where: {
            completedAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
            }
          }
        }),
        prisma.activity.count({
          where: { blockchainProcessed: true }
        }),
        prisma.activity.count({
          where: {
            blockchainProcessed: false,
            transactionHash: null
          }
        })
      ]);

      return {
        totalUsers,
        totalActivities,
        totalAchievements,
        recentActivities,
        blockchainProcessedCount,
        pendingRetries,
        blockchainProcessingRate: totalActivities > 0 ?
          (blockchainProcessedCount / totalActivities * 100).toFixed(2) : 0
      };
    } catch (error) {
      console.error('❌ Error getting system stats:', error);
      throw error;
    }
  }
}

export default new BlockchainDatabaseService();
