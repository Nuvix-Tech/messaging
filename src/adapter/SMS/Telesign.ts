import { SMS as SMSAdapter } from '../SMS';
import { SMS as SMSMessage } from '../../messages/SMS';
import { Response } from '../../response';

// Reference Material
// https://developer.telesign.com/enterprise/reference/sendbulksms

export class Telesign extends SMSAdapter {
    protected static readonly NAME = 'Telesign';

    /**
     * @param customerId Telesign customer ID
     * @param apiKey Telesign API key
     */
    constructor(
        private customerId: string,
        private apiKey: string
    ) {
        super();
    }

    public getName(): string {
        return Telesign.NAME;
    }

    public getMaxMessagesPerRequest(): number {
        return 1000;
    }

    /**
     * {@inheritdoc}
     */
    protected async process(message: SMSMessage) {
        const to = this.formatNumbers(
            message.getTo().map(recipient => recipient)
        );

        const response = new Response(this.getType());

        const result = await this.request({
            method: 'POST',
            url: 'https://rest-ww.telesign.com/v1/verify/bulk_sms',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${Buffer.from(`${this.customerId}:${this.apiKey}`).toString('base64')}`,
            },
            body: {
                template: message.getContent(),
                recipients: to,
            },
        });

        if (result.statusCode === 200) {
            response.setDeliveredTo(message.getTo().length);
            message.getTo().forEach(recipient => {
                response.addResult(recipient);
            });
        } else {
            message.getTo().forEach(recipient => {
                const errorDescription = result.response?.errors?.[0]?.description;
                if (errorDescription != null) {
                    response.addResult(recipient, errorDescription);
                } else {
                    response.addResult(recipient, 'Unknown error');
                }
            });
        }

        return response.toObject();
    }

    /**
     * @param numbers Array of phone numbers
     */
    private formatNumbers(numbers: string[]): string {
        const formatted = numbers.map(
            number => `${number}:${this.generateUniqueId()}`
        );

        return formatted.join(',');
    }

    private generateUniqueId(): string {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
}
