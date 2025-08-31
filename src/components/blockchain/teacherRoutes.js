import { Router } from 'express';
import {
  verifyTeacher,
  getTeacherDashboard,
  grantStudentReward,
  issueCertificate
} from './teacherController.js';
import {
  validateVerifyTeacher,
  validateGetTeacherDashboard,
  validateGrantStudentReward,
  validateIssueCertificate
} from './teacherValidators.js';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     TeacherVerification:
 *       type: object
 *       required:
 *         - teacherId
 *         - walletAddress
 *         - credentials
 *       properties:
 *         teacherId:
 *           type: string
 *           format: uuid
 *           description: ID of the teacher
 *         walletAddress:
 *           type: string
 *           pattern: '^0x[a-fA-F0-9]{40}$'
 *           description: Teacher's blockchain wallet address
 *         credentials:
 *           type: object
 *           properties:
 *             education:
 *               type: string
 *               description: Educational background
 *             experience:
 *               type: string
 *               description: Teaching experience
 *             specializations:
 *               type: array
 *               items:
 *                 type: string
 *               description: Areas of specialization
 *     
 *     StudentReward:
 *       type: object
 *       required:
 *         - studentWalletAddress
 *         - rewardType
 *         - reason
 *       properties:
 *         studentWalletAddress:
 *           type: string
 *           pattern: '^0x[a-fA-F0-9]{40}$'
 *           description: Student's blockchain wallet address
 *         rewardType:
 *           type: string
 *           enum: [tokens, badge]
 *           description: Type of reward to grant
 *         amount:
 *           type: number
 *           minimum: 0.1
 *           maximum: 1000
 *           description: Amount of tokens (required if rewardType is 'tokens')
 *         reason:
 *           type: string
 *           minLength: 5
 *           maxLength: 200
 *           description: Reason for granting the reward
 *     
 *     CertificateIssuance:
 *       type: object
 *       required:
 *         - studentWalletAddress
 *         - courseName
 *         - courseDescription
 *       properties:
 *         studentWalletAddress:
 *           type: string
 *           pattern: '^0x[a-fA-F0-9]{40}$'
 *           description: Student's blockchain wallet address
 *         courseName:
 *           type: string
 *           minLength: 3
 *           maxLength: 100
 *           description: Name of the completed course
 *         courseDescription:
 *           type: string
 *           minLength: 10
 *           maxLength: 500
 *           description: Description of the course
 *         completionDate:
 *           type: string
 *           format: date-time
 *           description: Date when the course was completed
 */

/**
 * @swagger
 * /api/blockchain/teacher/verify:
 *   post:
 *     summary: Verify teacher credentials and grant blockchain role
 *     tags: [Blockchain - Teacher]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TeacherVerification'
 *           example:
 *             teacherId: "550e8400-e29b-41d4-a716-446655440001"
 *             walletAddress: "0x742d35Cc6634C0532925a3b8D6Ac4d55d7e1c8c4"
 *             credentials:
 *               education: "Master's in Computer Science, University of Technology"
 *               experience: "5 years teaching blockchain and cryptocurrency courses"
 *               specializations: ["Blockchain", "Cryptocurrency", "Smart Contracts"]
 *     responses:
 *       200:
 *         description: Teacher verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 teacher:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     walletAddress:
 *                       type: string
 *                     teacherRoleGranted:
 *                       type: boolean
 *                 blockchain:
 *                   type: object
 *                   properties:
 *                     roleGranted:
 *                       type: string
 *                     certificateIssued:
 *                       type: string
 *                     network:
 *                       type: string
 *             example:
 *               success: true
 *               message: "Teacher verified successfully"
 *               teacher:
 *                 id: "550e8400-e29b-41d4-a716-446655440001"
 *                 name: "Dr. Maria García"
 *                 email: "maria@university.edu"
 *                 walletAddress: "0x742d35Cc6634C0532925a3b8D6Ac4d55d7e1c8c4"
 *                 teacherRoleGranted: true
 *               blockchain:
 *                 roleGranted: "0x1234567890abcdef..."
 *                 certificateIssued: "0xabcdef1234567890..."
 *                 network: "lisk-sepolia"
 *       400:
 *         description: Validation error or verification failed
 *       500:
 *         description: Server error
 */
router.post('/verify', validateVerifyTeacher, verifyTeacher);

/**
 * @swagger
 * /api/blockchain/teacher/dashboard/{walletAddress}:
 *   get:
 *     summary: Get teacher dashboard with blockchain stats
 *     tags: [Blockchain - Teacher]
 *     parameters:
 *       - in: path
 *         name: walletAddress
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^0x[a-fA-F0-9]{40}$'
 *         description: Teacher's blockchain wallet address
 *         example: "0x742d35Cc6634C0532925a3b8D6Ac4d55d7e1c8c4"
 *     responses:
 *       200:
 *         description: Teacher dashboard data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 teacher:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     walletAddress:
 *                       type: string
 *                     roles:
 *                       type: array
 *                       items:
 *                         type: string
 *                     teacherRoleGranted:
 *                       type: boolean
 *                 stats:
 *                   type: object
 *                   properties:
 *                     totalStudents:
 *                       type: number
 *                     activeStudents:
 *                       type: number
 *                     coursesTeaching:
 *                       type: number
 *                     certificatesIssued:
 *                       type: number
 *                     averageStudentProgress:
 *                       type: number
 *                 achievements:
 *                   type: array
 *                   items:
 *                     type: object
 *                 blockchain:
 *                   type: object
 *                   properties:
 *                     isVerifiedTeacher:
 *                       type: boolean
 *                     network:
 *                       type: string
 *                 lastUpdated:
 *                   type: string
 *                   format: date-time
 *       403:
 *         description: Address does not have teacher role
 *       404:
 *         description: Teacher not found
 *       500:
 *         description: Server error
 */
router.get('/dashboard/:walletAddress', validateGetTeacherDashboard, getTeacherDashboard);

/**
 * @swagger
 * /api/blockchain/teacher/{teacherWalletAddress}/grant-reward:
 *   post:
 *     summary: Grant special rewards to students (teacher function)
 *     tags: [Blockchain - Teacher]
 *     parameters:
 *       - in: path
 *         name: teacherWalletAddress
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^0x[a-fA-F0-9]{40}$'
 *         description: Teacher's blockchain wallet address
 *         example: "0x742d35Cc6634C0532925a3b8D6Ac4d55d7e1c8c4"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StudentReward'
 *           examples:
 *             tokenReward:
 *               summary: Grant token reward
 *               value:
 *                 studentWalletAddress: "0x742d35Cc6634C0532925a3b8D6Ac4d55d7e1c8c3"
 *                 rewardType: "tokens"
 *                 amount: 25
 *                 reason: "Excellent participation in class discussion"
 *             badgeReward:
 *               summary: Grant badge reward
 *               value:
 *                 studentWalletAddress: "0x742d35Cc6634C0532925a3b8D6Ac4d55d7e1c8c3"
 *                 rewardType: "badge"
 *                 reason: "Outstanding Project"
 *     responses:
 *       200:
 *         description: Reward granted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 student:
 *                   type: string
 *                 teacher:
 *                   type: string
 *                 rewardType:
 *                   type: string
 *                 amount:
 *                   type: number
 *                 badgeName:
 *                   type: string
 *                 transactionHash:
 *                   type: string
 *                 reason:
 *                   type: string
 *             example:
 *               success: true
 *               message: "tokens reward granted successfully"
 *               student: "0x742d35Cc6634C0532925a3b8D6Ac4d55d7e1c8c3"
 *               teacher: "0x742d35Cc6634C0532925a3b8D6Ac4d55d7e1c8c4"
 *               rewardType: "tokens"
 *               amount: 25
 *               transactionHash: "0x1234567890abcdef..."
 *               reason: "Excellent participation in class discussion"
 *       400:
 *         description: Validation error
 *       403:
 *         description: Only verified teachers can grant rewards
 *       500:
 *         description: Server error
 */
router.post('/:teacherWalletAddress/grant-reward', validateGrantStudentReward, grantStudentReward);

/**
 * @swagger
 * /api/blockchain/teacher/{teacherWalletAddress}/issue-certificate:
 *   post:
 *     summary: Issue course completion certificate to student
 *     tags: [Blockchain - Teacher]
 *     parameters:
 *       - in: path
 *         name: teacherWalletAddress
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^0x[a-fA-F0-9]{40}$'
 *         description: Teacher's blockchain wallet address
 *         example: "0x742d35Cc6634C0532925a3b8D6Ac4d55d7e1c8c4"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CertificateIssuance'
 *           example:
 *             studentWalletAddress: "0x742d35Cc6634C0532925a3b8D6Ac4d55d7e1c8c3"
 *             courseName: "Blockchain Fundamentals"
 *             courseDescription: "Comprehensive course covering blockchain technology, smart contracts, and cryptocurrency basics"
 *             completionDate: "2025-01-20T12:00:00.000Z"
 *     responses:
 *       200:
 *         description: Certificate issued successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 certificate:
 *                   type: object
 *                   properties:
 *                     tokenId:
 *                       type: string
 *                     courseName:
 *                       type: string
 *                     student:
 *                       type: string
 *                     teacher:
 *                       type: string
 *                     transactionHash:
 *                       type: string
 *                     metadataUri:
 *                       type: string
 *                     issuedAt:
 *                       type: string
 *                       format: date-time
 *             example:
 *               success: true
 *               message: "Certificate issued successfully"
 *               certificate:
 *                 tokenId: "1"
 *                 courseName: "Blockchain Fundamentals"
 *                 student: "0x742d35Cc6634C0532925a3b8D6Ac4d55d7e1c8c3"
 *                 teacher: "0x742d35Cc6634C0532925a3b8D6Ac4d55d7e1c8c4"
 *                 transactionHash: "0x1234567890abcdef..."
 *                 metadataUri: "https://ipfs.arandu.com/certificates/..."
 *                 issuedAt: "2025-01-21T10:30:00.000Z"
 *       400:
 *         description: Validation error
 *       403:
 *         description: Only verified teachers can issue certificates
 *       500:
 *         description: Server error
 */
router.post('/:teacherWalletAddress/issue-certificate', validateIssueCertificate, issueCertificate);

export default router;
