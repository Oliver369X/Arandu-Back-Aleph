import { Router } from 'express';
import studentRoutes from './studentRoutes.js';
import teacherRoutes from './teacherRoutes.js';
import adminRoutes from './adminRoutes.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Blockchain - Student
 *     description: Student blockchain operations (rewards, badges, certificates)
 *   - name: Blockchain - Teacher
 *     description: Teacher blockchain operations (verification, rewards, certificates)
 *   - name: Blockchain - Admin
 *     description: Admin blockchain operations (batch operations, system stats)
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   
 *   responses:
 *     UnauthorizedError:
 *       description: Authentication token is missing or invalid
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               error:
 *                 type: string
 *                 example: "Unauthorized"
 *     
 *     ValidationError:
 *       description: Request validation failed
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               errors:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     msg:
 *                       type: string
 *                     param:
 *                       type: string
 *                     location:
 *                       type: string
 *     
 *     ServerError:
 *       description: Internal server error
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               error:
 *                 type: string
 *                 example: "Internal server error"
 *               details:
 *                 type: string
 */

// Mount sub-routes
router.use('/student', studentRoutes);
router.use('/teacher', teacherRoutes);
router.use('/admin', adminRoutes);

/**
 * @swagger
 * /api/blockchain/health:
 *   get:
 *     summary: Check blockchain integration health
 *     tags: [Blockchain - System]
 *     responses:
 *       200:
 *         description: Blockchain health status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 blockchain:
 *                   type: object
 *                   properties:
 *                     network:
 *                       type: string
 *                     chainId:
 *                       type: number
 *                     backendConnected:
 *                       type: boolean
 *                     contractsInitialized:
 *                       type: boolean
 *                     eventListening:
 *                       type: boolean
 *                 contracts:
 *                   type: object
 *                   properties:
 *                     ANDUToken:
 *                       type: string
 *                     AranduRewards:
 *                       type: string
 *                     AranduBadges:
 *                       type: string
 *                     AranduCertificates:
 *                       type: string
 *                     DataAnchor:
 *                       type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *             example:
 *               success: true
 *               blockchain:
 *                 network: "lisk-sepolia"
 *                 chainId: 4202
 *                 backendConnected: true
 *                 contractsInitialized: true
 *                 eventListening: true
 *               contracts:
 *                 ANDUToken: "0xc518353025E46b587e424c4aBa6b260E4dB21322"
 *                 AranduRewards: "0x401DFD0a403245a2111B9Dac127B2815feBB3dfA"
 *                 AranduBadges: "0x0275c991DfE3339da93a5aecbB162BE4A9D152C4"
 *                 AranduCertificates: "0x60d4525Fe706c4CE938A415b2B8bC2a7f8b2f64c"
 *                 DataAnchor: "0x9aDb12a7448B32836b526D7942Cc441fF91a6d3D"
 *               timestamp: "2025-01-21T10:30:00.000Z"
 */
router.get('/health', async (req, res) => {
  try {
    const { default: AranduContractService } = await import('../../services/AranduContractService.js');
    const { default: BlockchainEventService } = await import('../../services/BlockchainEventService.js');
    const { ARANDU_CONFIG, backendSigner } = await import('../../config/blockchain.js');
    
    const health = {
      success: true,
      blockchain: {
        network: ARANDU_CONFIG.network,
        chainId: ARANDU_CONFIG.chainId,
        backendConnected: !!backendSigner,
        contractsInitialized: !!AranduContractService.contracts,
        eventListening: BlockchainEventService.isListening
      },
      contracts: ARANDU_CONFIG.contracts,
      timestamp: new Date().toISOString()
    };
    
    res.json(health);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to check blockchain health',
      details: error.message
    });
  }
});

/**
 * @swagger
 * /api/blockchain/info:
 *   get:
 *     summary: Get blockchain network information
 *     tags: [Blockchain - System]
 *     responses:
 *       200:
 *         description: Blockchain network information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 network:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     chainId:
 *                       type: number
 *                     rpcUrl:
 *                       type: string
 *                     explorerUrl:
 *                       type: string
 *                 features:
 *                   type: array
 *                   items:
 *                     type: string
 *                 supportedTokens:
 *                   type: array
 *                   items:
 *                     type: string
 *             example:
 *               success: true
 *               network:
 *                 name: "Lisk Sepolia Testnet"
 *                 chainId: 4202
 *                 rpcUrl: "https://rpc.sepolia-api.lisk.com"
 *                 explorerUrl: "https://sepolia-blockscout.lisk.com"
 *               features:
 *                 - "Token Rewards"
 *                 - "NFT Badges"
 *                 - "NFT Certificates"
 *                 - "Data Anchoring"
 *                 - "Teacher Verification"
 *               supportedTokens:
 *                 - "ANDU"
 *                 - "ETH (for gas)"
 */
router.get('/info', async (req, res) => {
  try {
    const { ARANDU_CONFIG } = await import('../../config/blockchain.js');
    
    const info = {
      success: true,
      network: {
        name: 'Lisk Sepolia Testnet',
        chainId: ARANDU_CONFIG.chainId,
        rpcUrl: ARANDU_CONFIG.rpcUrl,
        explorerUrl: ARANDU_CONFIG.explorerUrl
      },
      features: [
        'Token Rewards',
        'NFT Badges',
        'NFT Certificates',
        'Data Anchoring',
        'Teacher Verification',
        'Event Listening',
        'Batch Operations'
      ],
      supportedTokens: [
        'ANDU',
        'ETH (for gas)'
      ]
    };
    
    res.json(info);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get blockchain info',
      details: error.message
    });
  }
});

export default router;
