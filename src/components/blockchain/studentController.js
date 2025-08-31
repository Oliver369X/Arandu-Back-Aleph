import { validationResult } from 'express-validator';
import AranduContractService from '../../services/AranduContractService.js';
import BlockchainDatabaseService from '../../services/BlockchainDatabaseService.js';

/**
 * Complete learning activity and earn blockchain rewards
 */
export const completeActivity = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const { 
      studentId, 
      activityId, 
      activityType = 'quiz',
      answers, 
      walletAddress,
      score 
    } = req.body;
    
    // 1. Validate activity completion (integrate with existing game/quiz logic)
    const validation = await validateActivityCompletion(activityId, answers, activityType);
    
    if (!validation.isCorrect) {
      return res.json({
        success: false,
        message: 'Activity not completed successfully',
        score: validation.score,
        correctAnswers: validation.correctCount,
        totalQuestions: validation.totalQuestions,
        feedback: validation.feedback
      });
    }

    // 2. Calculate reward amount based on performance
    const rewardAmount = calculateRewardAmount(validation.score, activityType);
    
    // 3. Check if this is a streak activity
    const isStreakActivity = await checkIfDailyStreak(studentId);
    
    // 4. Save activity to database first (in case blockchain fails)
    const activityRecord = await BlockchainDatabaseService.saveActivityCompletion(studentId, {
      activityId,
      activityType,
      answers,
      score: validation.score
    });

    // 5. Grant blockchain rewards
    try {
      const blockchainResult = await AranduContractService.grantTokenReward(
        walletAddress,
        rewardAmount,
        isStreakActivity
      );
      
      // 6. Update activity record with blockchain info
      await BlockchainDatabaseService.updateActivityWithBlockchainData(activityRecord.id, {
        tokensEarned: rewardAmount,
        transactionHash: blockchainResult.transactionHash,
        badgesEarned: blockchainResult.badgesEarned
      });

      // 7. Save any new achievements
      if (blockchainResult.badgesEarned && blockchainResult.badgesEarned.length > 0) {
        for (const badge of blockchainResult.badgesEarned) {
          await BlockchainDatabaseService.saveAchievement({
            walletAddress,
            type: 'badge',
            name: badge.badgeName,
            transactionHash: blockchainResult.transactionHash,
            blockNumber: blockchainResult.blockNumber,
            contractAddress: process.env.ARANDU_BADGES_CONTRACT
          });
        }
      }

      res.json({
        success: true,
        score: validation.score,
        tokensEarned: rewardAmount,
        isStreakActivity,
        badgesEarned: blockchainResult.badgesEarned,
        transactionHash: blockchainResult.transactionHash,
        blockNumber: blockchainResult.blockNumber,
        message: `¡Excelente! Ganaste ${rewardAmount} tokens ANDU!`,
        feedback: validation.feedback
      });
      
    } catch (blockchainError) {
      // Mark activity for retry if blockchain fails
      await BlockchainDatabaseService.markActivityForRetry(
        studentId, 
        activityId, 
        blockchainError.message
      );
      
      // Still return success for the learning part, but note blockchain issue
      res.json({
        success: true,
        score: validation.score,
        tokensEarned: 0,
        blockchainPending: true,
        message: 'Actividad completada. Los tokens se procesarán pronto.',
        feedback: validation.feedback,
        error: 'Blockchain transaction pending'
      });
    }
    
  } catch (error) {
    console.error('❌ Error completing activity:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to complete activity',
      details: error.message 
    });
  }
};

/**
 * Get student dashboard data with blockchain stats
 */
export const getStudentDashboard = async (req, res) => {
  try {
    const { walletAddress } = req.params;
    
    // Get user data from database
    const userData = await BlockchainDatabaseService.getUserByWalletAddress(walletAddress);
    
    if (!userData) {
      return res.status(404).json({ 
        success: false,
        error: 'Student not found' 
      });
    }
    
    // Get blockchain stats
    const blockchainStats = await AranduContractService.getStudentStats(walletAddress);
    
    // Sync cached data
    await BlockchainDatabaseService.syncUserWithBlockchain(walletAddress, blockchainStats);
    
    // Get recent activities
    const recentActivities = await BlockchainDatabaseService.getUserActivities(userData.id, 10);
    
    res.json({
      success: true,
      student: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        walletAddress: userData.walletAddress,
        roles: userData.userRoles.map(ur => ur.role.name)
      },
      blockchain: {
        ...blockchainStats,
        network: 'lisk-sepolia'
      },
      recentActivities: recentActivities.map(activity => ({
        id: activity.id,
        activityId: activity.activityId,
        activityType: activity.activityType,
        score: activity.score,
        tokensEarned: activity.tokensEarned,
        badgesEarned: activity.badgesEarned,
        transactionHash: activity.transactionHash,
        completedAt: activity.completedAt,
        blockchainProcessed: activity.blockchainProcessed
      })),
      achievements: userData.achievements.map(achievement => ({
        id: achievement.id,
        type: achievement.type,
        name: achievement.name,
        description: achievement.description,
        transactionHash: achievement.transactionHash,
        earnedAt: achievement.earnedAt
      })),
      lastUpdated: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error getting dashboard data:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to load dashboard data',
      details: error.message 
    });
  }
};

/**
 * Get student's badge collection
 */
export const getStudentBadges = async (req, res) => {
  try {
    const { walletAddress } = req.params;
    
    // Get user data
    const userData = await BlockchainDatabaseService.getUserByWalletAddress(walletAddress);
    
    if (!userData) {
      return res.status(404).json({ 
        success: false,
        error: 'Student not found' 
      });
    }
    
    // Get badge achievements from database
    const badgeAchievements = userData.achievements.filter(a => a.type === 'badge');
    
    // Get blockchain badge count for verification
    const blockchainStats = await AranduContractService.getStudentStats(walletAddress);
    
    res.json({
      success: true,
      badgeCount: parseInt(blockchainStats.badgeCount),
      badges: badgeAchievements.map(badge => ({
        id: badge.id,
        name: badge.name,
        description: badge.description,
        transactionHash: badge.transactionHash,
        earnedAt: badge.earnedAt,
        metadata: badge.metadata
      })),
      walletAddress,
      lastUpdated: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error getting badges:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to load badges',
      details: error.message 
    });
  }
};

/**
 * Get student's certificate collection
 */
export const getStudentCertificates = async (req, res) => {
  try {
    const { walletAddress } = req.params;
    
    // Get user data
    const userData = await BlockchainDatabaseService.getUserByWalletAddress(walletAddress);
    
    if (!userData) {
      return res.status(404).json({ 
        success: false,
        error: 'Student not found' 
      });
    }
    
    // Get certificate achievements from database
    const certificateAchievements = userData.achievements.filter(a => a.type === 'certificate');
    
    // Get blockchain certificate count for verification
    const blockchainStats = await AranduContractService.getStudentStats(walletAddress);
    
    res.json({
      success: true,
      certificateCount: parseInt(blockchainStats.certificateCount),
      certificates: certificateAchievements.map(cert => ({
        id: cert.id,
        name: cert.name,
        description: cert.description,
        tokenId: cert.tokenId?.toString(),
        transactionHash: cert.transactionHash,
        earnedAt: cert.earnedAt,
        metadata: cert.metadata
      })),
      walletAddress,
      lastUpdated: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error getting certificates:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to load certificates',
      details: error.message 
    });
  }
};

// ======================
// HELPER FUNCTIONS
// ======================

/**
 * Validate activity completion based on type
 */
async function validateActivityCompletion(activityId, answers, activityType) {
  // This should integrate with your existing validation logic
  // For now, providing a basic structure
  
  switch (activityType) {
    case 'quiz':
      return await validateQuizCompletion(activityId, answers);
    case 'game':
      return await validateGameCompletion(activityId, answers);
    case 'lesson':
      return await validateLessonCompletion(activityId, answers);
    default:
      return {
        isCorrect: true,
        score: 100,
        correctCount: 1,
        totalQuestions: 1,
        feedback: 'Actividad completada exitosamente'
      };
  }
}

/**
 * Validate quiz completion (integrate with existing quiz logic)
 */
async function validateQuizCompletion(quizId, answers) {
  // TODO: Integrate with your existing quiz validation
  // This is a placeholder implementation
  
  const correctAnswers = ['A', 'B', 'C', 'A']; // Example - should come from database
  const correctCount = answers.filter((answer, index) => 
    answer === correctAnswers[index]
  ).length;
  
  const score = (correctCount / correctAnswers.length) * 100;
  
  return {
    isCorrect: score >= 70, // Passing criteria
    score,
    correctCount,
    totalQuestions: correctAnswers.length,
    feedback: score >= 70 ? 
      '¡Excelente trabajo! Has aprobado el quiz.' : 
      'Necesitas mejorar. Intenta de nuevo.'
  };
}

/**
 * Validate game completion (integrate with existing game logic)
 */
async function validateGameCompletion(gameId, gameResult) {
  // TODO: Integrate with your existing AI game validation
  // This is a placeholder implementation
  
  const completionData = gameResult || {};
  const score = completionData.score || 100;
  
  return {
    isCorrect: score >= 60,
    score,
    correctCount: 1,
    totalQuestions: 1,
    feedback: score >= 60 ? 
      '¡Juego completado exitosamente!' : 
      'Intenta completar el juego correctamente.'
  };
}

/**
 * Validate lesson completion
 */
async function validateLessonCompletion(lessonId, completionData) {
  // TODO: Integrate with your existing lesson tracking
  return {
    isCorrect: true,
    score: 100,
    correctCount: 1,
    totalQuestions: 1,
    feedback: 'Lección completada exitosamente'
  };
}

/**
 * Calculate reward amount based on performance and activity type
 */
function calculateRewardAmount(score, activityType) {
  const baseRewards = {
    quiz: 10,
    game: 15,
    lesson: 5
  };
  
  const baseReward = baseRewards[activityType] || 10;
  const scoreMultiplier = Math.max(0.5, score / 100); // Minimum 50% of base reward
  
  return Math.floor(baseReward * scoreMultiplier);
}

/**
 * Check if this activity counts as a daily streak
 */
async function checkIfDailyStreak(studentId) {
  // TODO: Implement streak logic based on your requirements
  // Check if student has completed activities in consecutive days
  
  try {
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    
    const recentActivities = await BlockchainDatabaseService.getUserActivities(studentId, 5);
    
    // Simple check: if student completed activity yesterday, this continues streak
    const hadActivityYesterday = recentActivities.some(activity => {
      const activityDate = new Date(activity.completedAt);
      return activityDate >= yesterday && activityDate < today;
    });
    
    return hadActivityYesterday;
  } catch (error) {
    console.error('Error checking streak:', error);
    return false;
  }
}
