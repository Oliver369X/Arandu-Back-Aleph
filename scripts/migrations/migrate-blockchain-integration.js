import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

// Load environment variables
config({ path: './.env' });

const prisma = new PrismaClient();

async function migrateToBlockchainIntegration() {
  console.log('🔄 Starting blockchain integration migration...');
  
  try {
    // 1. Create new tables (run prisma migrate first)
    console.log('📋 Creating blockchain tables...');
    
    // Create indexes one by one to avoid PostgreSQL limitation
    try {
      await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address)`;
      console.log('✅ Created index: idx_users_wallet_address');
    } catch (error) {
      console.log('⚠️ Index idx_users_wallet_address already exists or failed');
    }
    
    try {
      await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_activities_blockchain ON activities(blockchain_processed, completed_at)`;
      console.log('✅ Created index: idx_activities_blockchain');
    } catch (error) {
      console.log('⚠️ Index idx_activities_blockchain already exists or failed');
    }
    
    try {
      await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_achievements_wallet_type ON achievements(wallet_address, type)`;
      console.log('✅ Created index: idx_achievements_wallet_type');
    } catch (error) {
      console.log('⚠️ Index idx_achievements_wallet_type already exists or failed');
    }
    
    // 2. Initialize sync status for all contracts
    console.log('🔧 Initializing contract sync status...');
    const contracts = [
      { address: process.env.ANDU_TOKEN_ADDRESS, name: 'ANDUToken' },
      { address: process.env.ARANDU_REWARDS_ADDRESS, name: 'AranduRewards' },
      { address: process.env.ARANDU_BADGES_ADDRESS, name: 'AranduBadges' },
      { address: process.env.ARANDU_CERTIFICATES_ADDRESS, name: 'AranduCertificates' },
      { address: process.env.ARANDU_RESOURCES_ADDRESS, name: 'AranduResources' },
      { address: process.env.DATA_ANCHOR_ADDRESS, name: 'DataAnchor' }
    ];
    
    for (const contract of contracts) {
      if (contract.address) {
        await prisma.syncStatus.upsert({
          where: { contractAddress: contract.address.toLowerCase() },
          update: {},
          create: {
            contractAddress: contract.address.toLowerCase(),
            contractName: contract.name,
            lastSyncedBlock: BigInt(0),
            isHealthy: true
          }
        });
        console.log(`✅ Initialized sync status for ${contract.name}`);
      } else {
        console.log(`⚠️ Skipping ${contract.name} - address not configured`);
      }
    }
    
    // 3. Create initial system metrics
    console.log('📊 Creating initial system metrics...');
    await prisma.systemMetrics.create({
      data: {
        totalUsers: 0,
        activeUsers24h: 0,
        totalActivities: 0,
        totalTokensDistributed: '0',
        totalBadgesEarned: 0,
        totalCertificatesIssued: 0
      }
    });
    
    console.log('✅ Blockchain integration migration completed');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateToBlockchainIntegration()
  .then(() => {
    console.log('🎉 Migration successful');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  });
