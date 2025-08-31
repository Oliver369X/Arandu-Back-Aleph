import { Router } from 'express';
import {
  batchGrantRewards,
  anchorReport,
  getSystemStats,
  retryFailedTransactions,
  getBlockchainEvents,
  bulkIssueCertificates
} from './adminController.js';
import {
  validateBatchGrantRewards,
  validateAnchorReport,
  validateRetryFailedTransactions,
  validateGetBlockchainEvents,
  validateBulkIssueCertificates
} from './adminValidators.js';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     BatchReward:
 *       type: object
 *       required:
 *         - walletAddress
 *         - amount
 *       properties:
 *         walletAddress:
 *           type: string
 *           pattern: '^0x[a-fA-F0-9]{40}$'
 *           description: Student's blockchain wallet address
 *         amount:
 *           type: number
 *           minimum: 0.1
 *           maximum: 1000
 *           description: Amount of ANDU tokens to grant
 *         isStreak:
 *           type: boolean
 *           default: false
 *           description: Whether this counts as a streak activity
 *         reason:
 *           type: string
 *           maxLength: 200
 *           description: Reason for granting the reward
 *     
 *     ReportData:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - data
 *       properties:
 *         title:
 *           type: string
 *           minLength: 5
 *           maxLength: 200
 *           description: Report title
 *         description:
 *           type: string
 *           minLength: 10
 *           maxLength: 1000
 *           description: Report description
 *         data:
 *           type: object
 *           description: Actual report data
 *         generatedAt:
 *           type: string
 *           format: date-time
 *           description: When the report was generated
 *     
 *     BulkCertificate:
 *       type: object
 *       required:
 *         - studentWalletAddress
 *         - courseName
 *         - description
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
 *         description:
 *           type: string
 *           minLength: 10
 *           maxLength: 500
 *           description: Course description
 *         title:
 *           type: string
 *           minLength: 5
 *           maxLength: 150
 *           description: Certificate title (optional)
 *         completionDate:
 *           type: string
 *           format: date-time
 *           description: Course completion date (optional)
 */

/**
 * @swagger
 * /api/blockchain/admin/batch-rewards:
 *   post:
 *     summary: Grant rewards to multiple students (batch operation)
 *     tags: [Blockchain - Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rewards
 *             properties:
 *               rewards:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/BatchReward'
 *           example:
 *             rewards:
 *               - walletAddress: "0x742d35Cc6634C0532925a3b8D6Ac4d55d7e1c8c3"
 *                 amount: 25
 *                 isStreak: true
 *                 reason: "Monthly top performer"
 *               - walletAddress: "0x742d35Cc6634C0532925a3b8D6Ac4d55d7e1c8c4"
 *                 amount: 15
 *                 isStreak: false
 *                 reason: "Excellent project submission"
 *     responses:
 *       200:
 *         description: Batch rewards processed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       walletAddress:
 *                         type: string
 *                       success:
 *                         type: boolean
 *                       transactionHash:
 *                         type: string
 *                       tokensGranted:
 *                         type: number
 *                       badgesEarned:
 *                         type: array
 *                       error:
 *                         type: string
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalProcessed:
 *                       type: number
 *                     successful:
 *                       type: number
 *                     failed:
 *                       type: number
 *                     successRate:
 *                       type: string
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post('/batch-rewards', validateBatchGrantRewards, batchGrantRewards);

/**
 * @swagger
 * /api/blockchain/admin/anchor-report:
 *   post:
 *     summary: Anchor education report hash on blockchain for transparency
 *     tags: [Blockchain - Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reportData
 *             properties:
 *               reportData:
 *                 $ref: '#/components/schemas/ReportData'
 *               reportType:
 *                 type: string
 *                 enum: [education_report, audit_report, system_report, compliance_report]
 *                 default: education_report
 *           example:
 *             reportData:
 *               title: "Q1 2025 Student Progress Report"
 *               description: "Comprehensive report on student progress and achievement metrics for Q1 2025"
 *               data:
 *                 totalStudents: 1250
 *                 completionRate: 87.5
 *                 averageScore: 82.3
 *                 tokensDistributed: 15000
 *                 certificatesIssued: 95
 *               generatedAt: "2025-01-21T10:30:00.000Z"
 *             reportType: "education_report"
 *     responses:
 *       200:
 *         description: Report anchored successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 reportHash:
 *                   type: string
 *                 transactionHash:
 *                   type: string
 *                 blockNumber:
 *                   type: number
 *                 reportType:
 *                   type: string
 *                 anchoredAt:
 *                   type: string
 *                   format: date-time
 *                 message:
 *                   type: string
 *                 explorerUrl:
 *                   type: string
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post('/anchor-report', validateAnchorReport, anchorReport);

/**
 * @swagger
 * /api/blockchain/admin/system-stats:
 *   get:
 *     summary: Get comprehensive system statistics
 *     tags: [Blockchain - Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 backend:
 *                   type: object
 *                   properties:
 *                     walletAddress:
 *                       type: string
 *                     ethBalance:
 *                       type: string
 *                     gasPrice:
 *                       type: object
 *                 platform:
 *                   type: object
 *                   properties:
 *                     totalUsers:
 *                       type: number
 *                     totalActivities:
 *                       type: number
 *                     totalAchievements:
 *                       type: number
 *                     recentActivities:
 *                       type: number
 *                     blockchainProcessedCount:
 *                       type: number
 *                     pendingRetries:
 *                       type: number
 *                     blockchainProcessingRate:
 *                       type: string
 *                     activitiesNeedingRetry:
 *                       type: number
 *                 blockchain:
 *                   type: object
 *                   properties:
 *                     network:
 *                       type: string
 *                     chainId:
 *                       type: number
 *                     explorerUrl:
 *                       type: string
 *                     contracts:
 *                       type: object
 *                 recentEvents:
 *                   type: array
 *                 systemHealth:
 *                   type: object
 *                   properties:
 *                     blockchainConnected:
 *                       type: boolean
 *                     databaseConnected:
 *                       type: boolean
 *                     contractsInitialized:
 *                       type: boolean
 *                     gasPrice:
 *                       type: string
 *                 lastUpdated:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Server error
 */
router.get('/system-stats', getSystemStats);

/**
 * @swagger
 * /api/blockchain/admin/retry-failed:
 *   post:
 *     summary: Retry failed blockchain transactions
 *     tags: [Blockchain - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 5
 *         description: Maximum number of failed transactions to retry
 *     responses:
 *       200:
 *         description: Failed transactions retry results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       activityId:
 *                         type: string
 *                       success:
 *                         type: boolean
 *                       transactionHash:
 *                         type: string
 *                       tokensGranted:
 *                         type: number
 *                       badgesEarned:
 *                         type: array
 *                       error:
 *                         type: string
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalProcessed:
 *                       type: number
 *                     successful:
 *                       type: number
 *                     failed:
 *                       type: number
 *                     successRate:
 *                       type: string
 *       500:
 *         description: Server error
 */
router.post('/retry-failed', validateRetryFailedTransactions, retryFailedTransactions);

/**
 * @swagger
 * /api/blockchain/admin/events:
 *   get:
 *     summary: Get blockchain event history
 *     tags: [Blockchain - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Maximum number of events to return
 *       - in: query
 *         name: contractAddress
 *         schema:
 *           type: string
 *           pattern: '^0x[a-fA-F0-9]{40}$'
 *         description: Filter by contract address
 *       - in: query
 *         name: eventName
 *         schema:
 *           type: string
 *         description: Filter by event name
 *     responses:
 *       200:
 *         description: Blockchain events
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 events:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       contractAddress:
 *                         type: string
 *                       eventName:
 *                         type: string
 *                       blockNumber:
 *                         type: string
 *                       transactionHash:
 *                         type: string
 *                       eventData:
 *                         type: object
 *                       processedAt:
 *                         type: string
 *                         format: date-time
 *                       explorerUrl:
 *                         type: string
 *                 total:
 *                   type: number
 *                 filters:
 *                   type: object
 *       500:
 *         description: Server error
 */
router.get('/events', validateGetBlockchainEvents, getBlockchainEvents);

/**
 * @swagger
 * /api/blockchain/admin/bulk-certificates:
 *   post:
 *     summary: Issue bulk certificates to multiple students
 *     tags: [Blockchain - Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - certificates
 *             properties:
 *               certificates:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/BulkCertificate'
 *           example:
 *             certificates:
 *               - studentWalletAddress: "0x742d35Cc6634C0532925a3b8D6Ac4d55d7e1c8c3"
 *                 courseName: "Blockchain Fundamentals"
 *                 description: "Comprehensive course covering blockchain basics"
 *                 title: "Certificate of Completion - Blockchain Fundamentals"
 *                 completionDate: "2025-01-20T12:00:00.000Z"
 *               - studentWalletAddress: "0x742d35Cc6634C0532925a3b8D6Ac4d55d7e1c8c4"
 *                 courseName: "Smart Contracts Development"
 *                 description: "Advanced course on smart contract programming"
 *     responses:
 *       200:
 *         description: Bulk certificates processed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       studentWalletAddress:
 *                         type: string
 *                       courseName:
 *                         type: string
 *                       success:
 *                         type: boolean
 *                       tokenId:
 *                         type: string
 *                       transactionHash:
 *                         type: string
 *                       error:
 *                         type: string
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalProcessed:
 *                       type: number
 *                     successful:
 *                       type: number
 *                     failed:
 *                       type: number
 *                     successRate:
 *                       type: string
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post('/bulk-certificates', validateBulkIssueCertificates, bulkIssueCertificates);

export default router;
