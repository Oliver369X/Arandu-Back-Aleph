// Health check endpoint para Docker
import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api-v1/health
router.get('/health', async (req, res) => {
  try {
    // Verificar conexión a la base de datos
    await prisma.$queryRaw`SELECT 1`;
    
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      port: process.env.PORT || 3001,
      database: {
        status: 'connected',
        provider: 'postgresql'
      },
      services: {
        prisma: 'connected',
        express: 'running'
      }
    };

    res.status(200).json(healthData);
  } catch (error) {
    console.error('Health check failed:', error);
    
    const errorData = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      error: error.message || 'Unknown error',
      database: {
        status: 'disconnected',
        error: error.message
      }
    };

    res.status(500).json(errorData);
  }
});

// HEAD /api-v1/health - Health check más ligero
router.head('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).send();
  } catch {
    res.status(500).send();
  }
});

export default router;
