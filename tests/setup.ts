/**
 * Test setup and configuration
 */

import { beforeAll, afterAll } from 'bun:test';
import { testConfig, skipIfNoCredentials } from '../test.config';

// Global test setup
beforeAll(() => {
  console.log('🧪 Starting Nuvix Messaging Adapter Tests');
  console.log('📊 Test Configuration Summary:');
  
  // Check which services have valid credentials
  const services = Object.keys(testConfig) as Array<keyof typeof testConfig>;
  const configuredServices: string[] = [];
  const unconfiguredServices: string[] = [];
  
  services.forEach(service => {
    try {
      skipIfNoCredentials(service);
      configuredServices.push(service);
    } catch {
      unconfiguredServices.push(service);
    }
  });
  
  if (configuredServices.length > 0) {
    console.log(`✅ Configured services: ${configuredServices.join(', ')}`);
  }
  
  if (unconfiguredServices.length > 0) {
    console.log(`⚠️  Unconfigured services (will be skipped): ${unconfiguredServices.join(', ')}`);
    console.log('💡 To test these services, configure credentials in test.config.ts or environment variables');
  }
  
  console.log('');
});

afterAll(() => {
  console.log('✨ All tests completed');
});

// Export commonly used test helpers
export { testConfig, testMessages, skipIfNoCredentials } from '../test.config';
export * from './utils';
