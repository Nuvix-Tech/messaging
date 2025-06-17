/**
 * Nuvix Messaging Library
 * 
 * A comprehensive messaging library supporting Email, SMS, and Push notifications
 * with multiple service provider adapters.
 */

// Message classes
export { Email } from './src/messages/Email';
export { SMS } from './src/messages/SMS';
export { Push } from './src/messages/Push';
export { Attachment } from './src/messages/email/Attachment';

// Base classes and types
export { Adapter, Priority } from './src/adapter';
export { Response } from './src/response';
export type { Message, SendResult, RequestResponse, MultiRequestResponse } from './src/types';

// Email adapters
export { Email as EmailAdapter } from './src/adapter/Email';
export { Mailgun } from './src/adapter/Email/Mailgun';
export { Sendgrid } from './src/adapter/Email/Sendgrid';
export { SMTP } from './src/adapter/Email/SMTP';

// SMS adapters
export { SMS as SMSAdapter } from './src/adapter/SMS';
export { Twilio } from './src/adapter/SMS/Twilio';
export { Vonage } from './src/adapter/SMS/Vonage';
export { Msg91 } from './src/adapter/SMS/Msg91';
export { Telesign } from './src/adapter/SMS/Telesign';
export { TextMagic } from './src/adapter/SMS/TextMagic';

// Push notification adapters
export { Push as PushAdapter } from './src/adapter/Push';
export { FCM } from './src/adapter/Push/FCM';
export { APNS } from './src/adapter/Push/APNS';

// Utilities
export { JWT } from './src/helpers/jwt';