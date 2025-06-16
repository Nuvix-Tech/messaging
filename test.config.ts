/**
 * Test Configuration for Messaging Adapters
 * 
 * This file contains all the configuration needed for testing real adapters.
 * You should set up actual credentials for each service you want to test.
 * 
 * For security, consider using environment variables:
 * - Set the environment variables in your shell or CI/CD
 * - Each adapter will use the credentials provided here
 */

export interface TestConfig {
  // Email Adapters
  mailgun: {
    apiKey: string;
    domain: string;
    isEU: boolean;
    testEmail: string;
  };
  
  sendgrid: {
    apiKey: string;
    testEmail: string;
  };
  
  smtp: {
    host: string;
    port: number;
    secure: boolean;
    username: string;
    password: string;
    testEmail: string;
  };
  
  // SMS Adapters
  twilio: {
    accountSid: string;
    authToken: string;
    from: string;
    testPhoneNumber: string;
  };
  
  vonage: {
    apiKey: string;
    apiSecret: string;
    from: string;
    testPhoneNumber: string;
  };
  
  msg91: {
    senderId: string;
    authKey: string;
    testPhoneNumber: string;
  };
  
  telesign: {
    customerId: string;
    apiKey: string;
    testPhoneNumber: string;
  };
  
  textmagic: {
    username: string;
    apiKey: string;
    from: string;
    testPhoneNumber: string;
  };
  
  // Push Notification Adapters
  fcm: {
    serviceAccountJson: string;
    testDeviceToken: string;
  };
  
  apns: {
    keyId: string;
    teamId: string;
    bundleId: string;
    privateKey: string;
    production: boolean;
    testDeviceToken: string;
  };
}

/**
 * Default test configuration
 * Replace with your actual credentials or use environment variables
 */
export const testConfig: TestConfig = {
  mailgun: {
    apiKey: process.env.MAILGUN_API_KEY || 'your-mailgun-api-key',
    domain: process.env.MAILGUN_DOMAIN || 'your-domain.com',
    isEU: process.env.MAILGUN_IS_EU === 'true' || false,
    testEmail: process.env.TEST_EMAIL || 'test@example.com',
  },
  
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY || 'your-sendgrid-api-key',
    testEmail: process.env.TEST_EMAIL || 'test@example.com',
  },
  
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true' || false,
    username: process.env.SMTP_USERNAME || 'your-email@gmail.com',
    password: process.env.SMTP_PASSWORD || 'your-app-password',
    testEmail: process.env.TEST_EMAIL || 'test@example.com',
  },
  
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || 'your-twilio-account-sid',
    authToken: process.env.TWILIO_AUTH_TOKEN || 'your-twilio-auth-token',
    from: process.env.TWILIO_FROM || '+1234567890',
    testPhoneNumber: process.env.TEST_PHONE_NUMBER || '+1987654321',
  },
  
  vonage: {
    apiKey: process.env.VONAGE_API_KEY || 'your-vonage-api-key',
    apiSecret: process.env.VONAGE_API_SECRET || 'your-vonage-api-secret',
    from: process.env.VONAGE_FROM || 'YourApp',
    testPhoneNumber: process.env.TEST_PHONE_NUMBER || '+1987654321',
  },
  
  msg91: {
    senderId: process.env.MSG91_SENDER_ID || 'MSGIND',
    authKey: process.env.MSG91_AUTH_KEY || 'your-msg91-auth-key',
    testPhoneNumber: process.env.TEST_PHONE_NUMBER || '+919876543210',
  },
  
  telesign: {
    customerId: process.env.TELESIGN_CUSTOMER_ID || 'your-customer-id',
    apiKey: process.env.TELESIGN_API_KEY || 'your-telesign-api-key',
    testPhoneNumber: process.env.TEST_PHONE_NUMBER || '+1987654321',
  },
  
  textmagic: {
    username: process.env.TEXTMAGIC_USERNAME || 'your-username',
    apiKey: process.env.TEXTMAGIC_API_KEY || 'your-textmagic-api-key',
    from: process.env.TEXTMAGIC_FROM || 'YourApp',
    testPhoneNumber: process.env.TEST_PHONE_NUMBER || '+1987654321',
  },
  
  fcm: {
    serviceAccountJson: process.env.FCM_SERVICE_ACCOUNT_JSON || '{}',
    testDeviceToken: process.env.FCM_TEST_DEVICE_TOKEN || 'test-device-token',
  },
  
  apns: {
    keyId: process.env.APNS_KEY_ID || 'your-key-id',
    teamId: process.env.APNS_TEAM_ID || 'your-team-id',
    bundleId: process.env.APNS_BUNDLE_ID || 'com.yourapp.bundle',
    privateKey: process.env.APNS_PRIVATE_KEY || 'your-private-key',
    production: process.env.APNS_PRODUCTION === 'true' || false,
    testDeviceToken: process.env.APNS_TEST_DEVICE_TOKEN || 'test-device-token',
  },
};

/**
 * Test message templates
 */
export const testMessages = {
  email: {
    subject: 'Test Email from Nuvix Messaging',
    content: 'This is a test email sent via the Nuvix messaging library.',
    htmlContent: '<h1>Test Email</h1><p>This is a test email sent via the <strong>Nuvix messaging library</strong>.</p>',
    fromName: 'Nuvix Test',
    fromEmail: 'noreply@test.com',
  },
  
  sms: {
    content: 'This is a test SMS sent via the Nuvix messaging library.',
  },
  
  push: {
    title: 'Test Push Notification',
    body: 'This is a test push notification sent via the Nuvix messaging library.',
    data: {
      testKey: 'testValue',
      timestamp: new Date().toISOString(),
    },
  },
};

/**
 * Helper function to check if credentials are configured
 */
export function hasValidCredentials(service: keyof TestConfig): boolean {
  const config = testConfig[service] as any;
  
  // Check if any value contains placeholder text
  for (const [key, value] of Object.entries(config)) {
    if (typeof value === 'string' && value.startsWith('your-')) {
      return false;
    }
  }
  
  return true;
}

/**
 * Helper function to skip tests if credentials are not configured
 */
export function skipIfNoCredentials(service: keyof TestConfig) {
  if (!hasValidCredentials(service)) {
    throw new Error(`Skipping ${service} tests - credentials not configured. Please set environment variables or update test.config.ts`);
  }
}
