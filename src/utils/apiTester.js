/* eslint-disable no-console */
/**
 * API Integration Tester for MedReserve AI Frontend
 * Tests all API endpoints and validates real-time data integration
 */

import api from '../services/api';
import realTimeDataService from '../services/realTimeDataService';

class APITester {
  constructor() {
    this.results = {
      authentication: { status: 'pending', tests: [] },
      dashboard: { status: 'pending', tests: [] },
      doctors: { status: 'pending', tests: [] },
      appointments: { status: 'pending', tests: [] },
      prescriptions: { status: 'pending', tests: [] },
      reports: { status: 'pending', tests: [] },
      chatbot: { status: 'pending', tests: [] }
    };
  }

  async runAllTests() {
    console.log('🧪 Starting MedReserve AI Frontend API Integration Tests...');
    
    try {
      await this.testAuthentication();
      await this.testDashboard();
      await this.testDoctors();
      await this.testAppointments();
      await this.testPrescriptions();
      await this.testReports();
      await this.testChatbot();
      
      this.generateReport();
    } catch (error) {
      console.error('❌ Test suite failed:', error);
    }
  }

  async testAuthentication() {
    console.log('🔐 Testing Authentication APIs...');
    const tests = [];

    try {
      // Test login endpoint
      const loginTest = await this.testEndpoint(
        'Login API',
        () => api.post('/auth/login', { email: 'test@example.com', password: 'test123' }),
        false // Don't fail on 401 - expected for invalid credentials
      );
      tests.push(loginTest);

      // Test token validation
      const token = localStorage.getItem('token');
      if (token) {
        const validateTest = await this.testEndpoint(
          'Token Validation',
          () => api.get('/auth/validate'),
          true
        );
        tests.push(validateTest);
      }

      this.results.authentication = {
        status: tests.every(t => t.passed) ? 'passed' : 'partial',
        tests
      };
    } catch (error) {
      this.results.authentication = {
        status: 'failed',
        tests,
        error: error.message
      };
    }
  }

  async testDashboard() {
    console.log('📊 Testing Dashboard APIs...');
    const tests = [];

    try {
      // Test dashboard data fetching
      const dashboardTest = await this.testEndpoint(
        'Dashboard Data',
        () => realTimeDataService.fetchDashboardData(),
        true
      );
      tests.push(dashboardTest);

      // Test metrics calculation
      const metricsTest = await this.testEndpoint(
        'Dashboard Metrics',
        () => realTimeDataService.calculateMetrics(),
        true
      );
      tests.push(metricsTest);

      this.results.dashboard = {
        status: tests.every(t => t.passed) ? 'passed' : 'partial',
        tests
      };
    } catch (error) {
      this.results.dashboard = {
        status: 'failed',
        tests,
        error: error.message
      };
    }
  }

  async testDoctors() {
    console.log('👨‍⚕️ Testing Doctor APIs...');
    const tests = [];

    try {
      // Test doctors list
      const doctorsTest = await this.testEndpoint(
        'Doctors List',
        () => realTimeDataService.fetchDoctors(),
        true
      );
      tests.push(doctorsTest);

      // Test doctor specialties
      const specialtiesTest = await this.testEndpoint(
        'Doctor Specialties',
        () => api.get('/doctors/specialties'),
        false
      );
      tests.push(specialtiesTest);

      // Test doctor availability
      const availabilityTest = await this.testEndpoint(
        'Doctor Availability',
        () => api.get('/doctors/availability'),
        false
      );
      tests.push(availabilityTest);

      this.results.doctors = {
        status: tests.some(t => t.passed) ? 'passed' : 'failed',
        tests
      };
    } catch (error) {
      this.results.doctors = {
        status: 'failed',
        tests,
        error: error.message
      };
    }
  }

  async testAppointments() {
    console.log('📅 Testing Appointment APIs...');
    const tests = [];

    try {
      // Test appointments list
      const appointmentsTest = await this.testEndpoint(
        'Appointments List',
        () => realTimeDataService.fetchAppointments(),
        true
      );
      tests.push(appointmentsTest);

      // Test appointment booking
      const bookingTest = await this.testEndpoint(
        'Appointment Booking',
        () => api.post('/appointments', {
          doctorId: 1,
          date: '2025-01-15',
          time: '10:00',
          reason: 'Test appointment'
        }),
        false
      );
      tests.push(bookingTest);

      this.results.appointments = {
        status: tests.some(t => t.passed) ? 'passed' : 'failed',
        tests
      };
    } catch (error) {
      this.results.appointments = {
        status: 'failed',
        tests,
        error: error.message
      };
    }
  }

  async testPrescriptions() {
    console.log('💊 Testing Prescription APIs...');
    const tests = [];

    try {
      // Test prescriptions list
      const prescriptionsTest = await this.testEndpoint(
        'Prescriptions List',
        () => realTimeDataService.fetchPrescriptions(),
        true
      );
      tests.push(prescriptionsTest);

      // Test prescription details
      const detailsTest = await this.testEndpoint(
        'Prescription Details',
        () => api.get('/prescriptions/1'),
        false
      );
      tests.push(detailsTest);

      this.results.prescriptions = {
        status: tests.some(t => t.passed) ? 'passed' : 'failed',
        tests
      };
    } catch (error) {
      this.results.prescriptions = {
        status: 'failed',
        tests,
        error: error.message
      };
    }
  }

  async testReports() {
    console.log('📋 Testing Medical Reports APIs...');
    const tests = [];

    try {
      // Test reports list
      const reportsTest = await this.testEndpoint(
        'Medical Reports List',
        () => realTimeDataService.fetchMedicalReports(),
        true
      );
      tests.push(reportsTest);

      // Test report upload
      const uploadTest = await this.testEndpoint(
        'Report Upload',
        () => api.post('/reports/upload', new FormData()),
        false
      );
      tests.push(uploadTest);

      this.results.reports = {
        status: tests.some(t => t.passed) ? 'passed' : 'failed',
        tests
      };
    } catch (error) {
      this.results.reports = {
        status: 'failed',
        tests,
        error: error.message
      };
    }
  }

  async testChatbot() {
    console.log('🤖 Testing Chatbot APIs...');
    const tests = [];

    try {
      // Test chatbot message
      const chatTest = await this.testEndpoint(
        'Chatbot Message',
        () => api.post('/chatbot/message', {
          message: 'Hello, I need help',
          userId: 'test-user'
        }),
        false
      );
      tests.push(chatTest);

      // Test chatbot health
      const healthTest = await this.testEndpoint(
        'Chatbot Health',
        () => fetch(`${import.meta.env.VITE_CHATBOT_SERVICE_URL}/health`),
        false
      );
      tests.push(healthTest);

      this.results.chatbot = {
        status: tests.some(t => t.passed) ? 'passed' : 'failed',
        tests
      };
    } catch (error) {
      this.results.chatbot = {
        status: 'failed',
        tests,
        error: error.message
      };
    }
  }

  async testEndpoint(name, testFunction, required = true) {
    const startTime = Date.now();
    
    try {
      const result = await testFunction();
      const responseTime = Date.now() - startTime;
      
      return {
        name,
        passed: true,
        required,
        responseTime,
        status: result?.status || 'success',
        data: result?.data ? 'Data received' : 'No data'
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        name,
        passed: false,
        required,
        responseTime,
        error: error.message,
        status: error.response?.status || 'network_error'
      };
    }
  }

  generateReport() {
    console.log('\n📊 API Integration Test Report');
    console.log('================================');
    
    let totalTests = 0;
    let passedTests = 0;
    let requiredTests = 0;
    let passedRequiredTests = 0;

    Object.entries(this.results).forEach(([category, result]) => {
      console.log(`\n${this.getCategoryIcon(category)} ${category.toUpperCase()}: ${result.status.toUpperCase()}`);
      
      if (result.tests) {
        result.tests.forEach(test => {
          const icon = test.passed ? '✅' : '❌';
          const required = test.required ? '[REQUIRED]' : '[OPTIONAL]';
          console.log(`  ${icon} ${test.name} ${required} (${test.responseTime}ms)`);
          
          totalTests++;
          if (test.passed) passedTests++;
          if (test.required) {
            requiredTests++;
            if (test.passed) passedRequiredTests++;
          }
        });
      }
      
      if (result.error) {
        console.log(`  ⚠️ Error: ${result.error}`);
      }
    });

    console.log('\n📈 Summary');
    console.log('===========');
    console.log(`Total Tests: ${passedTests}/${totalTests} (${Math.round(passedTests/totalTests*100)}%)`);
    console.log(`Required Tests: ${passedRequiredTests}/${requiredTests} (${Math.round(passedRequiredTests/requiredTests*100)}%)`);
    
    const overallStatus = passedRequiredTests === requiredTests ? 'PASSED' : 'FAILED';
    console.log(`Overall Status: ${overallStatus}`);

    // Store results for UI display
    window.apiTestResults = {
      summary: {
        total: totalTests,
        passed: passedTests,
        required: requiredTests,
        passedRequired: passedRequiredTests,
        status: overallStatus
      },
      details: this.results
    };

    return this.results;
  }

  getCategoryIcon(category) {
    const icons = {
      authentication: '🔐',
      dashboard: '📊',
      doctors: '👨‍⚕️',
      appointments: '📅',
      prescriptions: '💊',
      reports: '📋',
      chatbot: '🤖'
    };
    return icons[category] || '📋';
  }
}

// Export for use in components
export const apiTester = new APITester();

// Auto-run tests in development mode
if (import.meta.env.DEV) {
  // Run tests after a delay to allow app initialization
  setTimeout(() => {
    if (window.location.search.includes('test-api')) {
      apiTester.runAllTests();
    }
  }, 3000);
}
