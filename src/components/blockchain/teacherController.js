import { validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import AranduContractService from '../../services/AranduContractService.js';
import BlockchainDatabaseService from '../../services/BlockchainDatabaseService.js';

/**
 * Verify teacher credentials and grant blockchain role
 */
export const verifyTeacher = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const { teacherId, walletAddress, credentials } = req.body;
    
    // 1. Verify teacher credentials with existing logic
    const verification = await verifyTeacherCredentials(teacherId, credentials);
    
    if (!verification.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Teacher verification failed',
        details: verification.errors
      });
    }
    
    // 2. Grant teacher role on blockchain
    const blockchainResult = await AranduContractService.addTeacher(walletAddress);
    
    // 3. Update user in database
    const updatedUser = await updateTeacherVerification(teacherId, {
      walletAddress,
      verified: true,
      verifiedAt: new Date(),
      transactionHash: blockchainResult.transactionHash
    });
    
    // 4. Issue teacher certificate (optional)
    let certificateResult = null;
    try {
      const certificateUri = await createTeacherCertificateMetadata(teacherId, verification.credentials);
      certificateResult = await AranduContractService.issueTeacherCertificate(
        walletAddress,
        certificateUri
      );
      
      // Save certificate achievement
      await BlockchainDatabaseService.saveAchievement({
        walletAddress,
        type: 'certificate',
        name: 'Teacher Verification Certificate',
        description: 'Official teacher verification certificate',
        tokenId: certificateResult.tokenId,
        transactionHash: certificateResult.transactionHash,
        blockNumber: certificateResult.blockNumber,
        contractAddress: process.env.ARANDU_CERTIFICATES_CONTRACT
      });
    } catch (certError) {
      console.warn('⚠️ Certificate issuance failed:', certError.message);
    }
    
    res.json({
      success: true,
      message: 'Teacher verified successfully',
      teacher: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        walletAddress: updatedUser.walletAddress,
        teacherRoleGranted: true
      },
      blockchain: {
        roleGranted: blockchainResult.transactionHash,
        certificateIssued: certificateResult?.transactionHash || null,
        network: 'lisk-sepolia'
      }
    });
    
  } catch (error) {
    console.error('❌ Error verifying teacher:', error);
    res.status(500).json({ 
      success: false,
      error: 'Teacher verification failed',
      details: error.message 
    });
  }
};

/**
 * Get teacher dashboard with blockchain stats
 */
export const getTeacherDashboard = async (req, res) => {
  try {
    const { walletAddress } = req.params;
    
    // Get teacher data from database
    const teacherData = await BlockchainDatabaseService.getUserByWalletAddress(walletAddress);
    
    if (!teacherData) {
      return res.status(404).json({ 
        success: false,
        error: 'Teacher not found' 
      });
    }
    
    // Verify teacher role on blockchain
    const isTeacher = await AranduContractService.isTeacher(walletAddress);
    
    if (!isTeacher) {
      return res.status(403).json({
        success: false,
        error: 'Address does not have teacher role'
      });
    }
    
    // Get teacher's students and their progress
    const teacherStats = await getTeacherStats(teacherData.id);
    
    // Get teacher's achievements (certificates, etc.)
    const teacherAchievements = teacherData.achievements.filter(a => 
      a.type === 'certificate' || a.type === 'teacher_badge'
    );
    
    res.json({
      success: true,
      teacher: {
        id: teacherData.id,
        name: teacherData.name,
        email: teacherData.email,
        walletAddress: teacherData.walletAddress,
        roles: teacherData.userRoles.map(ur => ur.role.name),
        teacherRoleGranted: teacherData.teacherRoleGranted
      },
      stats: teacherStats,
      achievements: teacherAchievements.map(achievement => ({
        id: achievement.id,
        type: achievement.type,
        name: achievement.name,
        description: achievement.description,
        tokenId: achievement.tokenId?.toString(),
        transactionHash: achievement.transactionHash,
        earnedAt: achievement.earnedAt
      })),
      blockchain: {
        isVerifiedTeacher: isTeacher,
        network: 'lisk-sepolia'
      },
      lastUpdated: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error getting teacher dashboard:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to load teacher dashboard',
      details: error.message 
    });
  }
};

/**
 * Grant special rewards to students (teacher function)
 */
export const grantStudentReward = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const { teacherWalletAddress } = req.params;
    const { studentWalletAddress, rewardType, amount, reason } = req.body;
    
    // Verify teacher role
    const isTeacher = await AranduContractService.isTeacher(teacherWalletAddress);
    if (!isTeacher) {
      return res.status(403).json({
        success: false,
        error: 'Only verified teachers can grant rewards'
      });
    }
    
    let result;
    
    if (rewardType === 'tokens') {
      result = await AranduContractService.grantTokenReward(
        studentWalletAddress,
        amount,
        false // Not a streak activity
      );
      
      // Save activity record
      const student = await BlockchainDatabaseService.getUserByWalletAddress(studentWalletAddress);
      if (student) {
        await BlockchainDatabaseService.saveActivityCompletion(student.id, {
          activityId: `teacher-reward-${Date.now()}`,
          activityType: 'teacher_reward',
          score: 100,
          tokensEarned: amount,
          transactionHash: result.transactionHash,
          badgesEarned: result.badgesEarned,
          answers: { reason, grantedBy: teacherWalletAddress }
        });
      }
      
    } else if (rewardType === 'badge') {
      // Grant badge
      result = await AranduContractService.grantBadge(studentWalletAddress, reason);
      
      // Save achievement
      await BlockchainDatabaseService.saveAchievement({
        walletAddress: studentWalletAddress,
        type: 'badge',
        name: reason,
        description: `Badge granted by teacher for: ${reason}`,
        transactionHash: result.transactionHash,
        blockNumber: result.blockNumber,
        contractAddress: process.env.ARANDU_BADGES_CONTRACT,
        metadata: { grantedBy: teacherWalletAddress }
      });
      
    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid reward type. Must be "tokens" or "badge"'
      });
    }
    
    res.json({
      success: true,
      message: `${rewardType} reward granted successfully`,
      student: studentWalletAddress,
      teacher: teacherWalletAddress,
      rewardType,
      amount: rewardType === 'tokens' ? amount : undefined,
      badgeName: rewardType === 'badge' ? reason : undefined,
      transactionHash: result.transactionHash,
      reason
    });
    
  } catch (error) {
    console.error('❌ Error granting student reward:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to grant reward',
      details: error.message 
    });
  }
};

/**
 * Issue course completion certificate to student
 */
export const issueCertificate = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const { teacherWalletAddress } = req.params;
    const { studentWalletAddress, courseName, courseDescription, completionDate } = req.body;
    
    // Verify teacher role
    const isTeacher = await AranduContractService.isTeacher(teacherWalletAddress);
    if (!isTeacher) {
      return res.status(403).json({
        success: false,
        error: 'Only verified teachers can issue certificates'
      });
    }
    
    // Create certificate metadata
    const certificateMetadata = {
      title: `Certificate of Completion - ${courseName}`,
      description: courseDescription,
      courseName,
      studentWallet: studentWalletAddress,
      teacherWallet: teacherWalletAddress,
      completionDate: completionDate || new Date().toISOString(),
      issueDate: new Date().toISOString(),
      type: 'course_completion'
    };
    
    // Upload metadata to IPFS (placeholder - implement actual IPFS upload)
    const metadataUri = await uploadCertificateMetadata(certificateMetadata);
    
    // Issue certificate on blockchain
    const result = await AranduContractService.issueCertificate(
      studentWalletAddress,
      metadataUri,
      'course_completion'
    );
    
    // Save achievement in database
    await BlockchainDatabaseService.saveAchievement({
      walletAddress: studentWalletAddress,
      type: 'certificate',
      name: `Certificate of Completion - ${courseName}`,
      description: courseDescription,
      tokenId: result.tokenId,
      transactionHash: result.transactionHash,
      blockNumber: result.blockNumber,
      contractAddress: process.env.ARANDU_CERTIFICATES_CONTRACT,
      metadata: {
        ...certificateMetadata,
        issuedBy: teacherWalletAddress
      }
    });
    
    res.json({
      success: true,
      message: 'Certificate issued successfully',
      certificate: {
        tokenId: result.tokenId,
        courseName,
        student: studentWalletAddress,
        teacher: teacherWalletAddress,
        transactionHash: result.transactionHash,
        metadataUri,
        issuedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Error issuing certificate:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to issue certificate',
      details: error.message 
    });
  }
};

// ======================
// HELPER FUNCTIONS
// ======================

/**
 * Verify teacher credentials (integrate with existing logic)
 */
async function verifyTeacherCredentials(teacherId, credentials) {
  // TODO: Integrate with your existing teacher verification logic
  // This is a placeholder implementation
  
  try {
    // Basic validation
    if (!credentials.education || !credentials.experience) {
      return {
        isValid: false,
        errors: ['Education and experience credentials are required']
      };
    }
    
    // In a real implementation, you would:
    // - Verify educational certificates
    // - Check professional references
    // - Validate teaching licenses
    // - Cross-reference with institutional databases
    
    return {
      isValid: true,
      credentials: {
        education: credentials.education,
        experience: credentials.experience,
        specializations: credentials.specializations || [],
        verifiedAt: new Date().toISOString()
      }
    };
  } catch (error) {
    return {
      isValid: false,
      errors: ['Credential verification failed']
    };
  }
}

/**
 * Update teacher verification status in database
 */
async function updateTeacherVerification(teacherId, verificationData) {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: teacherId },
      data: {
        walletAddress: verificationData.walletAddress?.toLowerCase(),
        blockchainVerified: verificationData.verified,
        teacherRoleGranted: verificationData.verified,
        lastBlockchainSync: verificationData.verifiedAt
      },
      include: {
        userRoles: {
          include: {
            role: true
          }
        }
      }
    });
    
    return updatedUser;
  } catch (error) {
    console.error('Error updating teacher verification:', error);
    throw error;
  }
}

/**
 * Create teacher certificate metadata
 */
async function createTeacherCertificateMetadata(teacherId, credentials) {
  // TODO: Implement actual metadata creation and IPFS upload
  const metadata = {
    title: 'Teacher Verification Certificate',
    description: 'Official certificate verifying teacher credentials',
    teacherId,
    credentials,
    issueDate: new Date().toISOString(),
    issuer: 'ARANDU Education Platform',
    type: 'teacher_verification'
  };
  
  // Placeholder URI - implement actual IPFS upload
  return `https://ipfs.arandu.com/teacher-cert-${teacherId}`;
}

/**
 * Get teacher statistics
 */
async function getTeacherStats(teacherId) {
  try {
    // TODO: Implement actual teacher statistics
    // This should integrate with your existing teacher/student relationship logic
    
    return {
      totalStudents: 0,
      activeStudents: 0,
      coursesTeaching: 0,
      certificatesIssued: 0,
      averageStudentProgress: 0,
      recentActivity: []
    };
  } catch (error) {
    console.error('Error getting teacher stats:', error);
    return {
      totalStudents: 0,
      activeStudents: 0,
      coursesTeaching: 0,
      certificatesIssued: 0,
      averageStudentProgress: 0,
      recentActivity: []
    };
  }
}

/**
 * Upload certificate metadata to IPFS
 */
async function uploadCertificateMetadata(metadata) {
  // TODO: Implement actual IPFS upload
  // For now, return a placeholder URI
  const hash = Buffer.from(JSON.stringify(metadata)).toString('base64');
  return `https://ipfs.arandu.com/certificates/${hash}`;
}
