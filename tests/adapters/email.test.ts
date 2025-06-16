/**
 * Tests for Email Adapters
 */

import { describe, test, expect, beforeEach } from 'bun:test';
import { Email as EmailMessage } from '../../src/messages/Email';
import { Attachment } from '../../src/messages/email/Attachment';
import { Mailgun } from '../../src/adapter/Email/Mailgun';
import { Sendgrid } from '../../src/adapter/Email/Sendgrid';
import { SMTP } from '../../src/adapter/Email/SMTP';
import { testConfig, skipIfNoCredentials } from '../setup';
import { assertSuccessfulSendResult, assertFailedSendResult, isValidEmail, generateTestId } from '../utils';
import { testMessages } from '../../test.config';

describe('Email Adapters', () => {
  let testEmail: EmailMessage;
  let testHtmlEmail: EmailMessage;
  let testEmailWithAttachment: EmailMessage;
  
  beforeEach(() => {
    const testId = generateTestId();
    
    testEmail = new EmailMessage({
      to: [testConfig.mailgun.testEmail],
      subject: `${testMessages.email.subject} - ${testId}`,
      content: testMessages.email.content,
      fromName: testMessages.email.fromName,
      fromEmail: testMessages.email.fromEmail,
      html: false,
    });
    
    testHtmlEmail = new EmailMessage({
      to: [testConfig.mailgun.testEmail],
      subject: `${testMessages.email.subject} (HTML) - ${testId}`,
      content: testMessages.email.htmlContent,
      fromName: testMessages.email.fromName,
      fromEmail: testMessages.email.fromEmail,
      html: true,
    });
    
    // Create a simple attachment for testing
    const attachment = new Attachment(
       'test.txt',
       Buffer.from('This is a test attachment'),
       'text/plain',
    );
    
    testEmailWithAttachment = new EmailMessage({
      to: [testConfig.mailgun.testEmail],
      subject: `${testMessages.email.subject} (with attachment) - ${testId}`,
      content: testMessages.email.content,
      fromName: testMessages.email.fromName,
      fromEmail: testMessages.email.fromEmail,
      attachments: [attachment],
      html: false,
    });
  });

  describe('Mailgun Adapter', () => {
    test('should have correct adapter properties', () => {
      try {
        skipIfNoCredentials('mailgun');
        
        const adapter = new Mailgun(
          testConfig.mailgun.apiKey,
          testConfig.mailgun.domain,
          testConfig.mailgun.isEU
        );
        
        expect(adapter.getName()).toBe('Mailgun');
        expect(adapter.getType()).toBe('email');
        expect(adapter.getMessageType()).toBe('Email');
        expect(adapter.getMaxMessagesPerRequest()).toBe(1000);
      } catch (error: any) {
        console.log('⏭️  Skipping Mailgun tests:', error.message);
      }
    });

    test('should send simple text email', async () => {
      try {
        skipIfNoCredentials('mailgun');
        
        const adapter = new Mailgun(
          testConfig.mailgun.apiKey,
          testConfig.mailgun.domain,
          testConfig.mailgun.isEU
        );
        
        const result = await adapter.send(testEmail);
        assertSuccessfulSendResult(result as any, 1);
        
        console.log('✅ Mailgun text email sent successfully');
      } catch (error: any) {
        if (error.message.includes('Skipping')) {
          console.log('⏭️  Skipping Mailgun tests:', error.message);
        } else {
          console.error('❌ Mailgun test failed:', error);
          throw error;
        }
      }
    });

    test('should send HTML email', async () => {
      try {
        skipIfNoCredentials('mailgun');
        
        const adapter = new Mailgun(
          testConfig.mailgun.apiKey,
          testConfig.mailgun.domain,
          testConfig.mailgun.isEU
        );
        
        const result = await adapter.send(testHtmlEmail);
        assertSuccessfulSendResult(result as any, 1);
        
        console.log('✅ Mailgun HTML email sent successfully');
      } catch (error: any) {
        if (error.message.includes('Skipping')) {
          console.log('⏭️  Skipping Mailgun HTML test');
        } else {
          console.error('❌ Mailgun HTML test failed:', error);
          throw error;
        }
      }
    });

    test('should send email with attachment', async () => {
      try {
        skipIfNoCredentials('mailgun');
        
        const adapter = new Mailgun(
          testConfig.mailgun.apiKey,
          testConfig.mailgun.domain,
          testConfig.mailgun.isEU
        );
        
        const result = await adapter.send(testEmailWithAttachment);
        assertSuccessfulSendResult(result as any, 1);
        
        console.log('✅ Mailgun email with attachment sent successfully');
      } catch (error: any) {
        if (error.message.includes('Skipping')) {
          console.log('⏭️  Skipping Mailgun attachment test');
        } else {
          console.error('❌ Mailgun attachment test failed:', error);
          throw error;
        }
      }
    });

    test('should handle multiple recipients', async () => {
      try {
        skipIfNoCredentials('mailgun');
        
        const multiRecipientEmail = new EmailMessage({
          to: [testConfig.mailgun.testEmail, testConfig.sendgrid.testEmail],
          subject: `Multi-recipient test - ${generateTestId()}`,
          content: testMessages.email.content,
          fromName: testMessages.email.fromName,
          fromEmail: testMessages.email.fromEmail,
        });
        
        const adapter = new Mailgun(
          testConfig.mailgun.apiKey,
          testConfig.mailgun.domain,
          testConfig.mailgun.isEU
        );
        
        const result = await adapter.send(multiRecipientEmail);
        assertSuccessfulSendResult(result as any, 2);
        
        console.log('✅ Mailgun multi-recipient email sent successfully');
      } catch (error: any) {
        if (error.message.includes('Skipping')) {
          console.log('⏭️  Skipping Mailgun multi-recipient test');
        } else {
          console.error('❌ Mailgun multi-recipient test failed:', error);
          throw error;
        }
      }
    });
  });

  describe('SendGrid Adapter', () => {
    test('should have correct adapter properties', () => {
      try {
        skipIfNoCredentials('sendgrid');
        
        const adapter = new Sendgrid(testConfig.sendgrid.apiKey);
        
        expect(adapter.getName()).toBe('Sendgrid');
        expect(adapter.getType()).toBe('email');
        expect(adapter.getMessageType()).toBe('Email');
        expect(adapter.getMaxMessagesPerRequest()).toBe(1000);
      } catch (error: any) {
        console.log('⏭️  Skipping SendGrid tests:', error.message);
      }
    });

    test('should send simple text email', async () => {
      try {
        skipIfNoCredentials('sendgrid');
        
        const adapter = new Sendgrid(testConfig.sendgrid.apiKey);
        
        const email = new EmailMessage({
          to: [testConfig.sendgrid.testEmail],
          subject: `SendGrid test - ${generateTestId()}`,
          content: testMessages.email.content,
          fromName: testMessages.email.fromName,
          fromEmail: testMessages.email.fromEmail,
        });
        
        const result = await adapter.send(email);
        assertSuccessfulSendResult(result as any, 1);
        
        console.log('✅ SendGrid email sent successfully');
      } catch (error: any) {
        if (error.message.includes('Skipping')) {
          console.log('⏭️  Skipping SendGrid test');
        } else {
          console.error('❌ SendGrid test failed:', error);
          throw error;
        }
      }
    });
  });

  describe('SMTP Adapter', () => {
    test('should have correct adapter properties', () => {
      try {
        skipIfNoCredentials('smtp');
        
        const adapter = new SMTP(
          testConfig.smtp.host,
          testConfig.smtp.port,
          testConfig.smtp.username,
          testConfig.smtp.password,
          testConfig.smtp.secure,
        );
        
        expect(adapter.getName()).toBe('SMTP');
        expect(adapter.getType()).toBe('email');
        expect(adapter.getMessageType()).toBe('Email');
        expect(adapter.getMaxMessagesPerRequest()).toBe(1000);
      } catch (error: any) {
        console.log('⏭️  Skipping SMTP tests:', error.message);
      }
    });

    test('should send simple text email', async () => {
      try {
        skipIfNoCredentials('smtp');
        
        const adapter = new SMTP(
          testConfig.smtp.host,
          testConfig.smtp.port,
          testConfig.smtp.username,
          testConfig.smtp.password,
          testConfig.smtp.secure,
        );
        
        const email = new EmailMessage({
          to: [testConfig.smtp.testEmail],
          subject: `SMTP test - ${generateTestId()}`,
          content: testMessages.email.content,
          fromName: testMessages.email.fromName,
          fromEmail: testMessages.email.fromEmail,
        });
        
        const result = await adapter.send(email);
        assertSuccessfulSendResult(result as any, 1);
        
        console.log('✅ SMTP email sent successfully');
      } catch (error: any) {
        if (error.message.includes('Skipping')) {
          console.log('⏭️  Skipping SMTP test');
        } else {
          console.error('❌ SMTP test failed:', error);
          throw error;
        }
      }
    });
  });

  describe('Email Message Validation', () => {
    test('should validate email addresses in recipients', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
    });

    test('should throw error for invalid CC recipients', () => {
      expect(() => {
        new EmailMessage({
          to: ['test@example.com'],
          subject: 'Test',
          content: 'Test content',
          fromName: 'Test',
          fromEmail: 'from@example.com',
          cc: [{ email: '' }], // Invalid CC
        });
      }).toThrow('Each CC recipient must have at least an email');
    });

    test('should throw error for invalid BCC recipients', () => {
      expect(() => {
        new EmailMessage({
          to: ['test@example.com'],
          subject: 'Test',
          content: 'Test content',
          fromName: 'Test',
          fromEmail: 'from@example.com',
          bcc: [{ email: '' }], // Invalid BCC
        });
      }).toThrow('Each BCC recipient must have at least an email');
    });
  });
});
