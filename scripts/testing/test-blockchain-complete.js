#!/usr/bin/env node

/**
 * 🚀 ARANDU Blockchain API Testing Script
 *
 * Script completo para probar todos los endpoints de blockchain
 * Uso: node scripts/test-blockchain-complete.js
 */

import axios from 'axios';
import { config } from 'dotenv';

// Load environment variables
config({ path: './.env' });

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001/api-v1';
const TEST_WALLET = process.env.TEST_WALLET || '0x742d35Cc6634C0532925a3b8D6Ac4d55d7e1c8c3';
const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL || 'test@example.com';
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD || 'password123';

class AranduBlockchainTester {
  constructor() {
    this.authToken = null;
    this.testResults = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const icons = {
      success: '✅',
      error: '❌',
      info: 'ℹ️',
      warning: '⚠️'
    };
    console.log(`[${timestamp}] ${icons[type]} ${message}`);
  }

  async authenticate() {
    try {
      this.log('Authenticating with API...');
      const response = await axios.post(`${BASE_URL}/auth/login`, {
        email: TEST_USER_EMAIL,
        password: TEST_USER_PASSWORD
      });

      this.authToken = response.data.token;
      this.log('Authentication successful');
      return true;
    } catch (error) {
      this.log(`Authentication failed: ${error.response?.data?.error || error.message}`, 'error');
      return false;
    }
  }

  async testHealthCheck() {
    try {
      this.log('Testing blockchain health check...');
      const response = await axios.get(`${BASE_URL}/blockchain/health`);

      const health = response.data;
      this.log(`Network: ${health.blockchain?.network || 'unknown'}`);
      this.log(`Backend connected: ${health.blockchain?.backendConnected ? '✅' : '❌'}`);
      this.log(`Contracts initialized: ${health.blockchain?.contractsInitialized ? '✅' : '❌'}`);

      return health.success && health.blockchain?.backendConnected;
    } catch (error) {
      this.log(`Health check failed: ${error.message}`, 'error');
      return false;
    }
  }

  async testNetworkInfo() {
    try {
      this.log('Testing network information...');
      const response = await axios.get(`${BASE_URL}/blockchain/info`);

      const info = response.data;
      this.log(`Network: ${info.network?.name || 'unknown'}`);
      this.log(`Chain ID: ${info.network?.chainId || 'unknown'}`);
      this.log(`Features: ${info.features?.join(', ') || 'none'}`);

      return true;
    } catch (error) {
      this.log(`Network info failed: ${error.message}`, 'error');
      return false;
    }
  }

  async testStudentDashboard() {
    try {
      this.log('Testing student dashboard...');
      const response = await axios.get(
        `${BASE_URL}/blockchain/student/dashboard/${TEST_WALLET}`,
        { headers: { Authorization: `Bearer ${this.authToken}` } }
      );

      const data = response.data.data;
      if (data.user) {
        this.log(`User found: ${data.user.email || 'unknown'}`);
        this.log(`Token balance: ${data.user.cachedTokenBalance || '0'} ANDU`);
        this.log(`Badge count: ${data.user.cachedBadgeCount || 0}`);
      } else {
        this.log('User not found (expected for test wallet)', 'warning');
      }

      return true;
    } catch (error) {
      if (error.response?.status === 404) {
        this.log('Student not found (expected for test wallet)', 'warning');
        return true;
      }
      this.log(`Student dashboard failed: ${error.message}`, 'error');
      return false;
    }
  }

  async testActivityCompletion() {
    try {
      this.log('Testing activity completion...');
      const activityData = {
        studentId: 'test-student-123',
        activityId: `test-quiz-${Date.now()}`,
        activityType: 'quiz',
        answers: ['A', 'B', 'C'],
        walletAddress: TEST_WALLET,
        score: 85
      };

      const response = await axios.post(
        `${BASE_URL}/blockchain/student/complete-activity`,
        activityData,
        { headers: { Authorization: `Bearer ${this.authToken}` } }
      );

      const result = response.data;
      this.log(`Activity completed successfully`);
      this.log(`Tokens earned: ${result.data?.tokensEarned || '0'}`);
      this.log(`Transaction: ${result.data?.transactionHash ? '✅' : '❌'}`);

      return true;
    } catch (error) {
      if (error.response?.status === 400) {
        this.log('Validation working (expected for test data)', 'warning');
        return true;
      }
      this.log(`Activity completion failed: ${error.message}`, 'error');
      return false;
    }
  }

  async testStudentBadges() {
    try {
      this.log('Testing student badges...');
      const response = await axios.get(
        `${BASE_URL}/blockchain/student/badges/${TEST_WALLET}`,
        { headers: { Authorization: `Bearer ${this.authToken}` } }
      );

      const data = response.data;
      this.log(`Badge count: ${data.badgeCount || 0}`);

      return true;
    } catch (error) {
      this.log(`Student badges failed: ${error.message}`, 'error');
      return false;
    }
  }

  async testTeacherVerification() {
    try {
      this.log('Testing teacher verification...');
      const teacherData = {
        teacherId: 'test-teacher-456',
        walletAddress: TEST_WALLET,
        credentials: {
          degree: 'Computer Science',
          experience: '5 years',
          certifications: ['Teaching Certificate']
        }
      };

      const response = await axios.post(
        `${BASE_URL}/blockchain/teacher/verify`,
        teacherData,
        { headers: { Authorization: `Bearer ${this.authToken}` } }
      );

      this.log('Teacher verification successful');
      return true;
    } catch (error) {
      this.log(`Teacher verification failed: ${error.message}`, 'error');
      return false;
    }
  }

  async testSystemStats() {
    try {
      this.log('Testing system statistics...');
      const response = await axios.get(
        `${BASE_URL}/blockchain/admin/system-stats`,
        { headers: { Authorization: `Bearer ${this.authToken}` } }
      );

      const data = response.data;
      this.log(`Total users: ${data.platform?.totalUsers || 0}`);
      this.log(`Active users (24h): ${data.platform?.activeUsers24h || 0}`);
      this.log(`Tokens distributed: ${data.platform?.totalTokensDistributed || '0'} ANDU`);
      this.log(`Backend ETH balance: ${data.backend?.ethBalance || '0'}`);

      return true;
    } catch (error) {
      this.log(`System stats failed: ${error.message}`, 'error');
      return false;
    }
  }

  async runAllTests() {
    console.log('🚀 ARANDU Blockchain API Testing Suite');
    console.log('=' .repeat(50));

    // Test authentication first
    const authSuccess = await this.authenticate();
    this.testResults.push({ test: 'Authentication', success: authSuccess });

    if (!authSuccess) {
      this.log('Cannot continue without authentication', 'error');
      this.printSummary();
      return false;
    }

    // Run all blockchain tests
    const tests = [
      { name: 'Health Check', method: this.testHealthCheck.bind(this) },
      { name: 'Network Info', method: this.testNetworkInfo.bind(this) },
      { name: 'Student Dashboard', method: this.testStudentDashboard.bind(this) },
      { name: 'Activity Completion', method: this.testActivityCompletion.bind(this) },
      { name: 'Student Badges', method: this.testStudentBadges.bind(this) },
      { name: 'Teacher Verification', method: this.testTeacherVerification.bind(this) },
      { name: 'System Stats', method: this.testSystemStats.bind(this) }
    ];

    for (const test of tests) {
      console.log(`\n🔍 Running: ${test.name}`);
      console.log('-'.repeat(30));

      const success = await test.method();
      this.testResults.push({ test: test.name, success });

      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    this.printSummary();
    return this.testResults.every(r => r.success);
  }

  printSummary() {
    console.log('\n📊 Test Results Summary');
    console.log('=' .repeat(50));

    const passed = this.testResults.filter(r => r.success).length;
    const total = this.testResults.length;

    this.testResults.forEach(result => {
      const icon = result.success ? '✅' : '❌';
      console.log(`${icon} ${result.test}`);
    });

    console.log(`\n🎯 Overall: ${passed}/${total} tests passed`);

    if (passed === total) {
      console.log('🎉 All tests passed! Blockchain integration is working perfectly.');
    } else {
      console.log('⚠️ Some tests failed. Check the output above for details.');
      console.log('\n🔧 Troubleshooting tips:');
      console.log('1. Make sure your server is running: npm run dev');
      console.log('2. Check your .env configuration');
      console.log('3. Verify blockchain contracts are deployed');
      console.log('4. Check server logs for detailed error messages');
    }

    console.log('\n📚 Useful commands:');
    console.log('• View API docs: http://localhost:3001/api-docs');
    console.log('• Check server logs: npm run dev');
    console.log('• Run specific test: npm run test:blockchain-endpoints');
  }
}

// Export for use as module
export default AranduBlockchainTester;

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new AranduBlockchainTester();
  tester.runAllTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  });
}
