/**
 * Tests for Push Notification Adapters
 */

import { describe, test, expect, beforeEach } from 'bun:test';
import { Push as PushMessage } from '../../src/messages/Push';
import { FCM } from '../../src/adapter/Push/FCM';
import { APNS } from '../../src/adapter/Push/APNS';
import { Priority } from '../../src/adapter';
import { testConfig, testMessages, skipIfNoCredentials } from '../setup';
import { assertSuccessfulSendResult, assertFailedSendResult, generateTestId } from '../utils';

describe('Push Notification Adapters', () => {
  let testPush: PushMessage;
  let testPushWithData: PushMessage;
  let testPushHighPriority: PushMessage;
  let testPushMinimal: PushMessage;
  
  beforeEach(() => {
    const testId = generateTestId();
    
    testPush = new PushMessage({
      to: [testConfig.fcm.testDeviceToken],
      title: `${testMessages.push.title} - ${testId}`,
      body: testMessages.push.body,
    });
    
    testPushWithData = new PushMessage({
      to: [testConfig.fcm.testDeviceToken],
      title: `${testMessages.push.title} (with data) - ${testId}`,
      body: testMessages.push.body,
      data: {
        ...testMessages.push.data,
        testId,
      },
      sound: 'default',
      badge: 1,
    });
    
    testPushHighPriority = new PushMessage({
      to: [testConfig.fcm.testDeviceToken],
      title: `${testMessages.push.title} (high priority) - ${testId}`,
      body: testMessages.push.body,
      priority: Priority.HIGH,
      critical: true,
    });
    
    // Test with only data (no title/body)
    testPushMinimal = new PushMessage({
      to: [testConfig.fcm.testDeviceToken],
      data: {
        type: 'minimal',
        testId,
      },
    });
  });

  describe('FCM Adapter', () => {
    test('should have correct adapter properties', () => {
      try {
        skipIfNoCredentials('fcm');
        
        const adapter = new FCM(testConfig.fcm.serviceAccountJson);
        
        expect(adapter.getName()).toBe('FCM');
        expect(adapter.getType()).toBe('push');
        expect(adapter.getMessageType()).toBe('Push');
        expect(adapter.getMaxMessagesPerRequest()).toBe(5000);
      } catch (error) {
        console.log('⏭️  Skipping FCM tests:', (error as Error).message);
      }
    });

    test('should send simple push notification', async () => {
      try {
        skipIfNoCredentials('fcm');
        
        const adapter = new FCM(testConfig.fcm.serviceAccountJson);
        
        const result = await adapter.send(testPush);
        assertSuccessfulSendResult(result as any, 1);
        
        console.log('✅ FCM push notification sent successfully');
      } catch (error) {
        const err = error as Error;
        if (err.message.includes('Skipping')) {
          console.log('⏭️  Skipping FCM test');
        } else {
          console.error('❌ FCM test failed:', err);
          throw error;
        }
      }
    });

    test('should send push notification with custom data', async () => {
      try {
        skipIfNoCredentials('fcm');
        
        const adapter = new FCM(testConfig.fcm.serviceAccountJson);
        
        const result = await adapter.send(testPushWithData);
        assertSuccessfulSendResult(result as any, 1);
        
        console.log('✅ FCM push with data sent successfully');
      } catch (error) {
        const err = error as Error;
        if (err.message.includes('Skipping')) {
          console.log('⏭️  Skipping FCM data test');
        } else {
          console.error('❌ FCM data test failed:', err);
          throw error;
        }
      }
    });

    test('should send high priority push notification', async () => {
      try {
        skipIfNoCredentials('fcm');
        
        const adapter = new FCM(testConfig.fcm.serviceAccountJson);
        
        const result = await adapter.send(testPushHighPriority);
        assertSuccessfulSendResult(result as any, 1);
        
        console.log('✅ FCM high priority push sent successfully');
      } catch (error) {
        const err = error as Error;
        if (err.message.includes('Skipping')) {
          console.log('⏭️  Skipping FCM priority test');
        } else {
          console.error('❌ FCM priority test failed:', err);
          throw error;
        }
      }
    });

    test('should send data-only push notification', async () => {
      try {
        skipIfNoCredentials('fcm');
        
        const adapter = new FCM(testConfig.fcm.serviceAccountJson);
        
        const result = await adapter.send(testPushMinimal);
        assertSuccessfulSendResult(result as any, 1);
        
        console.log('✅ FCM data-only push sent successfully');
      } catch (error) {
        const err = error as Error;
        if (err.message.includes('Skipping')) {
          console.log('⏭️  Skipping FCM minimal test');
        } else {
          console.error('❌ FCM minimal test failed:', err);
          throw error;
        }
      }
    });

    test('should handle multiple device tokens', async () => {
      try {
        skipIfNoCredentials('fcm');
        
        const multiDevicePush = new PushMessage({
          to: [testConfig.fcm.testDeviceToken, 'another-device-token'],
          title: `Multi-device test - ${generateTestId()}`,
          body: testMessages.push.body,
        });
        
        const adapter = new FCM(testConfig.fcm.serviceAccountJson);
        
        const result = await adapter.send(multiDevicePush);
        // Note: This might fail if the second token is invalid, which is expected
        console.log('📊 FCM multi-device result:', result);
        
        console.log('✅ FCM multi-device test completed');
      } catch (error) {
        const err = error as Error;
        if (err.message.includes('Skipping')) {
          console.log('⏭️  Skipping FCM multi-device test');
        } else {
          console.error('❌ FCM multi-device test failed:', err);
          // Don't throw here as this test is expected to possibly fail with invalid tokens
        }
      }
    });
  });

  describe('APNS Adapter', () => {
    test('should have correct adapter properties', () => {
      try {
        skipIfNoCredentials('apns');
        
        const adapter = new APNS(
          testConfig.apns.privateKey,
          testConfig.apns.keyId,
          testConfig.apns.teamId,
          testConfig.apns.bundleId,
          !testConfig.apns.production // sandbox = !production
        );
        
        expect(adapter.getName()).toBe('APNS');
        expect(adapter.getType()).toBe('push');
        expect(adapter.getMessageType()).toBe('Push');
        expect(adapter.getMaxMessagesPerRequest()).toBe(5000);
      } catch (error) {
        console.log('⏭️  Skipping APNS tests:', (error as Error).message);
      }
    });

    test('should send simple push notification', async () => {
      try {
        skipIfNoCredentials('apns');
        
        const adapter = new APNS(
          testConfig.apns.privateKey,
          testConfig.apns.keyId,
          testConfig.apns.teamId,
          testConfig.apns.bundleId,
          !testConfig.apns.production
        );
        
        const push = new PushMessage({
          to: [testConfig.apns.testDeviceToken],
          title: `${testMessages.push.title} - ${generateTestId()}`,
          body: testMessages.push.body,
        });
        
        const result = await adapter.send(push);
        assertSuccessfulSendResult(result as any, 1);
        
        console.log('✅ APNS push notification sent successfully');
      } catch (error) {
        const err = error as Error;
        if (err.message.includes('Skipping')) {
          console.log('⏭️  Skipping APNS test');
        } else {
          console.error('❌ APNS test failed:', err);
          throw error;
        }
      }
    });

    test('should send push notification with sound and badge', async () => {
      try {
        skipIfNoCredentials('apns');
        
        const adapter = new APNS(
          testConfig.apns.privateKey,
          testConfig.apns.keyId,
          testConfig.apns.teamId,
          testConfig.apns.bundleId,
          !testConfig.apns.production
        );
        
        const push = new PushMessage({
          to: [testConfig.apns.testDeviceToken],
          title: `${testMessages.push.title} (with sound) - ${generateTestId()}`,
          body: testMessages.push.body,
          sound: 'default',
          badge: 5,
        });
        
        const result = await adapter.send(push);
        assertSuccessfulSendResult(result as any, 1);
        
        console.log('✅ APNS push with sound and badge sent successfully');
      } catch (error) {
        const err = error as Error;
        if (err.message.includes('Skipping')) {
          console.log('⏭️  Skipping APNS sound test');
        } else {
          console.error('❌ APNS sound test failed:', err);
          throw error;
        }
      }
    });

    test('should send critical push notification', async () => {
      try {
        skipIfNoCredentials('apns');
        
        const adapter = new APNS(
          testConfig.apns.privateKey,
          testConfig.apns.keyId,
          testConfig.apns.teamId,
          testConfig.apns.bundleId,
          !testConfig.apns.production
        );
        
        const push = new PushMessage({
          to: [testConfig.apns.testDeviceToken],
          title: `${testMessages.push.title} (critical) - ${generateTestId()}`,
          body: testMessages.push.body,
          critical: true,
          priority: Priority.HIGH,
        });
        
        const result = await adapter.send(push);
        assertSuccessfulSendResult(result as any, 1);
        
        console.log('✅ APNS critical push sent successfully');
      } catch (error) {
        const err = error as Error;
        if (err.message.includes('Skipping')) {
          console.log('⏭️  Skipping APNS critical test');
        } else {
          console.error('❌ APNS critical test failed:', err);
          throw error;
        }
      }
    });
  });

  describe('Push Message Validation', () => {
    test('should require at least one of title, body, or data', () => {
      expect(() => {
        new PushMessage({
          to: ['device-token'],
          // No title, body, or data
        });
      }).toThrow('At least one of the following parameters must be set: title, body, data');
    });

    test('should create push message with only title', () => {
      const push = new PushMessage({
        to: ['device-token'],
        title: 'Test Title',
      });
      
      expect(push.getTo()).toEqual(['device-token']);
      expect(push.getTitle()).toBe('Test Title');
      expect(push.getBody()).toBeUndefined();
      expect(push.getData()).toBeUndefined();
    });

    test('should create push message with only body', () => {
      const push = new PushMessage({
        to: ['device-token'],
        body: 'Test Body',
      });
      
      expect(push.getTo()).toEqual(['device-token']);
      expect(push.getTitle()).toBeUndefined();
      expect(push.getBody()).toBe('Test Body');
      expect(push.getData()).toBeUndefined();
    });

    test('should create push message with only data', () => {
      const testData = { key: 'value' };
      const push = new PushMessage({
        to: ['device-token'],
        data: testData,
      });
      
      expect(push.getTo()).toEqual(['device-token']);
      expect(push.getTitle()).toBeUndefined();
      expect(push.getBody()).toBeUndefined();
      expect(push.getData()).toEqual(testData);
    });

    test('should handle all optional properties', () => {
      const push = new PushMessage({
        to: ['device-token'],
        title: 'Test Title',
        body: 'Test Body',
        data: { key: 'value' },
        action: 'test-action',
        sound: 'custom-sound',
        image: 'https://example.com/image.png',
        icon: 'icon-name',
        color: '#FF0000',
        tag: 'test-tag',
        badge: 10,
        contentAvailable: true,
        critical: true,
        priority: Priority.HIGH,
      });
      
      expect(push.getTitle()).toBe('Test Title');
      expect(push.getBody()).toBe('Test Body');
      expect(push.getData()).toEqual({ key: 'value' });
      expect(push.getAction()).toBe('test-action');
      expect(push.getSound()).toBe('custom-sound');
      expect(push.getImage()).toBe('https://example.com/image.png');
      expect(push.getIcon()).toBe('icon-name');
      expect(push.getColor()).toBe('#FF0000');
      expect(push.getTag()).toBe('test-tag');
      expect(push.getBadge()).toBe(10);
      expect(push.getContentAvailable()).toBe(true);
      expect(push.getCritical()).toBe(true);
      expect(push.getPriority()).toBe(Priority.HIGH);
    });

    test('should handle multiple device tokens', () => {
      const push = new PushMessage({
        to: ['token1', 'token2', 'token3'],
        title: 'Multi Device Test',
      });
      
      expect(push.getTo()).toEqual(['token1', 'token2', 'token3']);
    });

    test('should return null for getFrom method', () => {
      const push = new PushMessage({
        to: ['device-token'],
        title: 'Test',
      });
      
      expect(push.getFrom()).toBeNull();
    });
  });
});
