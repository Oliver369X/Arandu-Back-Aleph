import { config } from 'dotenv';
import PrismaAranduService from '../src/services/PrismaAranduService.js';

// Load environment variables
config({ path: './.env' });

async function testPrismaIntegration() {
  try {
    console.log('🧪 Testing Prisma ARANDU integration...\n');
    
    // Test 1: System stats
    console.log('📊 Test 1: System Statistics');
    const systemStats = await PrismaAranduService.getSystemStats();
    console.log('✅ System stats retrieved:');
    console.log('- Total Users:', systemStats.totalUsers);
    console.log('- Total Activities:', systemStats.totalActivities);
    console.log('- Total Achievements:', systemStats.totalAchievements);
    console.log('- Blockchain Processing Rate:', systemStats.blockchainProcessingRate + '%');
    console.log('');
    
    // Test 2: Generate system metrics
    console.log('📈 Test 2: System Metrics Generation');
    const metrics = await PrismaAranduService.generateSystemMetrics();
    console.log('✅ System metrics generated:');
    console.log('- Total Users:', metrics.totalUsers);
    console.log('- Active Users (24h):', metrics.activeUsers24h);
    console.log('- Total Activities:', metrics.totalActivities);
    console.log('- Total Tokens Distributed:', metrics.totalTokensDistributed, 'ANDU');
    console.log('- Total Badges Earned:', metrics.totalBadgesEarned);
    console.log('- Total Certificates Issued:', metrics.totalCertificatesIssued);
    console.log('');
    
    // Test 3: Test wallet address validation
    console.log('🔍 Test 3: Wallet Address Validation');
    const testWallet = '0x742d35cc6634c0532925a3b8d6ac4d55d7e1c8c3';
    const userByWallet = await PrismaAranduService.getUserByWallet(testWallet);
    if (userByWallet) {
      console.log('✅ User found by wallet:', userByWallet.email);
    } else {
      console.log('ℹ️ No user found for test wallet (expected for new setup)');
    }
    console.log('');
    
    // Test 4: Test blockchain event saving
    console.log('📝 Test 4: Blockchain Event Saving');
    const testEvent = {
      contractAddress: '0x1234567890123456789012345678901234567890',
      eventName: 'TestEvent',
      blockNumber: 12345,
      transactionHash: '0xtest1234567890123456789012345678901234567890',
      eventData: { test: 'data' }
    };
    
    const savedEvent = await PrismaAranduService.saveBlockchainEvent(testEvent);
    if (savedEvent) {
      console.log('✅ Blockchain event saved:', savedEvent.id);
    } else {
      console.log('ℹ️ Event was duplicate (expected behavior)');
    }
    console.log('');
    
    // Test 5: Test sync status update
    console.log('🔄 Test 5: Sync Status Update');
    await PrismaAranduService.updateSyncStatus(
      '0x1234567890123456789012345678901234567890',
      12345
    );
    console.log('✅ Sync status updated');
    console.log('');
    
    console.log('🎉 All Prisma integration tests passed!');
    
  } catch (error) {
    console.error('❌ Prisma integration test failed:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Run tests
testPrismaIntegration()
  .then(() => {
    console.log('\n✅ Prisma integration test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Prisma integration test failed:', error);
    process.exit(1);
  });
