import { Router } from 'express';
import {
  completeActivity,
  getStudentDashboard,
  getStudentBadges,
  getStudentCertificates
} from './studentController.js';
import {
  validateCompleteActivity,
  validateGetStudentDashboard,
  validateGetStudentBadges,
  validateGetStudentCertificates
} from './studentValidators.js';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     ActivityCompletion:
 *       type: object
 *       required:
 *         - studentId
 *         - activityId
 *         - walletAddress
 *       properties:
 *         studentId:
 *           type: string
 *           format: uuid
 *           description: ID of the student
 *         activityId:
 *           type: string
 *           description: ID of the activity/game/quiz completed
 *         activityType:
 *           type: string
 *           enum: [quiz, game, lesson, assignment]
 *           default: quiz
 *         answers:
 *           type: array
 *           items:
 *             type: string
 *           description: Student answers or game results
 *         walletAddress:
 *           type: string
 *           pattern: '^0x[a-fA-F0-9]{40}$'
 *           description: Student's blockchain wallet address
 *         score:
 *           type: number
 *           minimum: 0
 *           maximum: 100
 *           description: Score achieved (0-100)
 *     
 *     ActivityCompletionResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         score:
 *           type: number
 *         tokensEarned:
 *           type: number
 *         isStreakActivity:
 *           type: boolean
 *         badgesEarned:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               student:
 *                 type: string
 *               badgeName:
 *                 type: string
 *         transactionHash:
 *           type: string
 *         message:
 *           type: string
 *         feedback:
 *           type: string
 *     
 *     StudentDashboard:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         student:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             name:
 *               type: string
 *             email:
 *               type: string
 *             walletAddress:
 *               type: string
 *             roles:
 *               type: array
 *               items:
 *                 type: string
 *         blockchain:
 *           type: object
 *           properties:
 *             tokensEarned:
 *               type: string
 *             currentTokenBalance:
 *               type: string
 *             badgeCount:
 *               type: string
 *             certificateCount:
 *               type: string
 *             currentStreak:
 *               type: string
 *             network:
 *               type: string
 *         recentActivities:
 *           type: array
 *           items:
 *             type: object
 *         achievements:
 *           type: array
 *           items:
 *             type: object
 */

/**
 * @swagger
 * /api/blockchain/student/complete-activity:
 *   post:
 *     summary: Complete learning activity and earn blockchain rewards
 *     tags: [Blockchain - Student]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ActivityCompletion'
 *           examples:
 *             quizCompletion:
 *               summary: Quiz completion example
 *               value:
 *                 studentId: "550e8400-e29b-41d4-a716-446655440000"
 *                 activityId: "blockchain-basics-quiz-1"
 *                 activityType: "quiz"
 *                 answers: ["A", "B", "C", "A"]
 *                 walletAddress: "0x742d35Cc6634C0532925a3b8D6Ac4d55d7e1c8c3"
 *                 score: 85
 *             gameCompletion:
 *               summary: Game completion example
 *               value:
 *                 studentId: "550e8400-e29b-41d4-a716-446655440000"
 *                 activityId: "memory-game-crypto-1"
 *                 activityType: "game"
 *                 answers: [{"completed": true, "score": 92, "timeSpent": 120}]
 *                 walletAddress: "0x742d35Cc6634C0532925a3b8D6Ac4d55d7e1c8c3"
 *                 score: 92
 *     responses:
 *       200:
 *         description: Activity completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ActivityCompletionResponse'
 *             examples:
 *               success:
 *                 summary: Successful completion with rewards
 *                 value:
 *                   success: true
 *                   score: 85
 *                   tokensEarned: 8
 *                   isStreakActivity: true
 *                   badgesEarned: [{"student": "0x742d35Cc6634C0532925a3b8D6Ac4d55d7e1c8c3", "badgeName": "Quiz Master"}]
 *                   transactionHash: "0x1234567890abcdef..."
 *                   message: "¡Excelente! Ganaste 8 tokens ANDU!"
 *                   feedback: "¡Excelente trabajo! Has aprobado el quiz."
 *               failure:
 *                 summary: Failed completion
 *                 value:
 *                   success: false
 *                   score: 45
 *                   correctAnswers: 2
 *                   totalQuestions: 4
 *                   message: "Activity not completed successfully"
 *                   feedback: "Necesitas mejorar. Intenta de nuevo."
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post('/complete-activity', validateCompleteActivity, completeActivity);

/**
 * @swagger
 * /api/blockchain/student/dashboard/{walletAddress}:
 *   get:
 *     summary: Get student dashboard with blockchain stats
 *     tags: [Blockchain - Student]
 *     parameters:
 *       - in: path
 *         name: walletAddress
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^0x[a-fA-F0-9]{40}$'
 *         description: Student's blockchain wallet address
 *         example: "0x742d35Cc6634C0532925a3b8D6Ac4d55d7e1c8c3"
 *     responses:
 *       200:
 *         description: Student dashboard data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StudentDashboard'
 *             example:
 *               success: true
 *               student:
 *                 id: "550e8400-e29b-41d4-a716-446655440000"
 *                 name: "Juan Pérez"
 *                 email: "juan@example.com"
 *                 walletAddress: "0x742d35Cc6634C0532925a3b8D6Ac4d55d7e1c8c3"
 *                 roles: ["student"]
 *               blockchain:
 *                 tokensEarned: "150.0"
 *                 currentTokenBalance: "125.5"
 *                 badgeCount: "3"
 *                 certificateCount: "1"
 *                 currentStreak: "5"
 *                 network: "lisk-sepolia"
 *               recentActivities: []
 *               achievements: []
 *               lastUpdated: "2025-01-21T10:30:00.000Z"
 *       404:
 *         description: Student not found
 *       500:
 *         description: Server error
 */
router.get('/dashboard/:walletAddress', validateGetStudentDashboard, getStudentDashboard);

/**
 * @swagger
 * /api/blockchain/student/badges/{walletAddress}:
 *   get:
 *     summary: Get student's badge collection
 *     tags: [Blockchain - Student]
 *     parameters:
 *       - in: path
 *         name: walletAddress
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^0x[a-fA-F0-9]{40}$'
 *         description: Student's blockchain wallet address
 *         example: "0x742d35Cc6634C0532925a3b8D6Ac4d55d7e1c8c3"
 *     responses:
 *       200:
 *         description: Student's badge collection
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 badgeCount:
 *                   type: number
 *                 badges:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       transactionHash:
 *                         type: string
 *                       earnedAt:
 *                         type: string
 *                         format: date-time
 *                 walletAddress:
 *                   type: string
 *                 lastUpdated:
 *                   type: string
 *                   format: date-time
 *             example:
 *               success: true
 *               badgeCount: 3
 *               badges:
 *                 - id: "badge-1"
 *                   name: "Quiz Master"
 *                   description: "Complete 10 quizzes with 80%+ score"
 *                   transactionHash: "0x1234..."
 *                   earnedAt: "2025-01-20T15:30:00.000Z"
 *               walletAddress: "0x742d35Cc6634C0532925a3b8D6Ac4d55d7e1c8c3"
 *               lastUpdated: "2025-01-21T10:30:00.000Z"
 *       404:
 *         description: Student not found
 *       500:
 *         description: Server error
 */
router.get('/badges/:walletAddress', validateGetStudentBadges, getStudentBadges);

/**
 * @swagger
 * /api/blockchain/student/certificates/{walletAddress}:
 *   get:
 *     summary: Get student's certificate collection
 *     tags: [Blockchain - Student]
 *     parameters:
 *       - in: path
 *         name: walletAddress
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^0x[a-fA-F0-9]{40}$'
 *         description: Student's blockchain wallet address
 *         example: "0x742d35Cc6634C0532925a3b8D6Ac4d55d7e1c8c3"
 *     responses:
 *       200:
 *         description: Student's certificate collection
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 certificateCount:
 *                   type: number
 *                 certificates:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       tokenId:
 *                         type: string
 *                       transactionHash:
 *                         type: string
 *                       earnedAt:
 *                         type: string
 *                         format: date-time
 *                 walletAddress:
 *                   type: string
 *                 lastUpdated:
 *                   type: string
 *                   format: date-time
 *             example:
 *               success: true
 *               certificateCount: 1
 *               certificates:
 *                 - id: "cert-1"
 *                   name: "Blockchain Fundamentals"
 *                   description: "Certificate for completing blockchain basics course"
 *                   tokenId: "1"
 *                   transactionHash: "0x5678..."
 *                   earnedAt: "2025-01-15T12:00:00.000Z"
 *               walletAddress: "0x742d35Cc6634C0532925a3b8D6Ac4d55d7e1c8c3"
 *               lastUpdated: "2025-01-21T10:30:00.000Z"
 *       404:
 *         description: Student not found
 *       500:
 *         description: Server error
 */
router.get('/certificates/:walletAddress', validateGetStudentCertificates, getStudentCertificates);

export default router;
