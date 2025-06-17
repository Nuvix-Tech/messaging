# Nuvix Messaging Library

A comprehensive messaging library for Email, SMS, and Push notifications with support for multiple service providers.

## Features

### Email Adapters
- **Mailgun** - Email delivery service
- **SendGrid** - Email delivery platform
- **SMTP** - Generic SMTP support

### SMS Adapters
- **Twilio** - SMS and communication APIs
- **Vonage** (formerly Nexmo) - Global communications platform
- **Msg91** - SMS and communication platform
- **Telesign** - Customer verification platform
- **TextMagic** - SMS marketing platform

### Push Notification Adapters
- **FCM** (Firebase Cloud Messaging) - Google's messaging solution
- **APNS** (Apple Push Notification Service) - Apple's push notification service

## Installation

```bash
bun install
```

## Testing

This library includes comprehensive tests for all adapters using real API credentials. Tests are designed to work with actual services to ensure reliability.

### Test Configuration

1. **Copy the example environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Configure your credentials in `.env`:**
   ```bash
   # Example for Mailgun
   MAILGUN_API_KEY=key-1234567890abcdef
   MAILGUN_DOMAIN=mg.yourdomain.com
   MAILGUN_IS_EU=false
   
   # Example for Twilio
   TWILIO_ACCOUNT_SID=AC1234567890abcdef
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_FROM=+1234567890
   
   # Add other service credentials as needed
   ```

3. **Alternatively, configure credentials in `test.config.ts`:**
   ```typescript
   export const testConfig: TestConfig = {
     mailgun: {
       apiKey: 'your-actual-api-key',
       domain: 'your-domain.com',
       isEU: false,
       testEmail: 'test@yourdomain.com',
     },
     // ... other configurations
   };
   ```

### Running Tests

```bash
# Run all tests
bun test

# Run tests with coverage
bun test --coverage

# Run tests in watch mode
bun test --watch

# Run specific test files
bun test tests/adapters/email.test.ts
bun test tests/adapters/sms.test.ts
bun test tests/adapters/push.test.ts
```

### Test Behavior

- **Configured Services**: Tests will run with real API calls for services with valid credentials
- **Unconfigured Services**: Tests will be automatically skipped with helpful messages
- **Real API Calls**: Tests use actual service APIs to ensure reliability
- **Test Messages**: All test messages are clearly marked and include unique identifiers

### Example Test Output

```
🧪 Starting Nuvix Messaging Adapter Tests
📊 Test Configuration Summary:
✅ Configured services: mailgun, twilio, fcm
⚠️  Unconfigured services (will be skipped): sendgrid, vonage, msg91, telesign, textmagic, apns
💡 To test these services, configure credentials in test.config.ts or environment variables

✅ Mailgun text email sent successfully
✅ Twilio SMS sent successfully
✅ FCM push notification sent successfully
⏭️  Skipping SendGrid tests: credentials not configured
```

## Usage Examples

### Email

```typescript
import { Mailgun } from '@nuvix/messaging/adapter/Email/Mailgun';
import { Email } from '@nuvix/messaging/messages/Email';

const adapter = new Mailgun('api-key', 'domain.com');
const email = new Email({
  to: ['user@example.com'],
  subject: 'Hello World',
  content: 'This is a test email',
  fromName: 'Your App',
  fromEmail: 'noreply@yourdomain.com',
});

const result = await adapter.send(email);
console.log(`Delivered to ${result.deliveredTo} recipients`);
```

### SMS

```typescript
import { Twilio } from '@nuvix/messaging/adapter/SMS/Twilio';
import { SMS } from '@nuvix/messaging/messages/SMS';

const adapter = new Twilio('account-sid', 'auth-token', '+1234567890');
const sms = new SMS({
  to: ['+1987654321'],
  content: 'Hello from your app!',
});

const result = await adapter.send(sms);
```

### Push Notifications

```typescript
import { FCM } from '@nuvix/messaging/adapter/Push/FCM';
import { Push } from '@nuvix/messaging/messages/Push';

const adapter = new FCM('service-account-json');
const push = new Push({
  to: ['device-token'],
  title: 'New Message',
  body: 'You have a new notification',
  data: { type: 'message', id: '123' },
});

const result = await adapter.send(push);
```

## Development

### Project Structure

```
src/
├── adapter.ts              # Base adapter class
├── response.ts             # Response handling
├── types.ts                # Type definitions
├── adapter/                # Adapter implementations
│   ├── Email.ts            # Email base class
│   ├── SMS.ts              # SMS base class
│   ├── Push.ts             # Push base class
│   ├── Email/              # Email adapters
│   ├── SMS/                # SMS adapters
│   └── Push/               # Push adapters
├── messages/               # Message classes
│   ├── Email.ts
│   ├── SMS.ts
│   └── Push.ts
└── helpers/                # Utility functions

tests/
├── setup.ts                # Test configuration
├── utils.ts                # Test utilities
└── adapters/               # Adapter tests
    ├── email.test.ts
    ├── sms.test.ts
    ├── push.test.ts
    └── messages.test.ts
```

### Building

```bash
bun run build
```

### Linting

```bash
bun run lint
bun run lint:fix
```

## License

This project is licensed under the MIT License.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for any new functionality
4. Ensure all tests pass with real credentials
5. Submit a pull request

## Service Provider Documentation

- [Mailgun API](https://documentation.mailgun.com/)
- [SendGrid API](https://docs.sendgrid.com/)
- [Twilio SMS API](https://www.twilio.com/docs/sms)
- [Vonage SMS API](https://developer.vonage.com/messaging/sms/overview)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Apple Push Notification Service](https://developer.apple.com/documentation/usernotifications)
