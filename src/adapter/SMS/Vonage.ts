import { SMS as SMSAdapter } from '../SMS';
import { SMS as SMSMessage } from '../../messages/SMS';
import { Response } from '../../response';

export class Vonage extends SMSAdapter {
    protected static readonly NAME = 'Vonage';

    /**
     * @param apiKey Vonage API Key
     * @param apiSecret Vonage API Secret
     * @param from Optional sender ID
     */
    constructor(
        private apiKey: string,
        private apiSecret: string,
        private from?: string
    ) {
        super();
    }

    public getName(): string {
        return Vonage.NAME;
    }

    public getMaxMessagesPerRequest(): number {
        return 1;
    }

    protected async process(message: SMSMessage) {
        const to = message.getTo().map(recipient => 
            recipient.startsWith('+') ? recipient.substring(1) : recipient
        );

        const response = new Response(this.getType());
        
        const result = await this.request({
            method: 'POST',
            url: 'https://rest.nexmo.com/sms/json',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: {
                text: message.getContent(),
                from: this.from ?? message.getFrom(),
                to: to[0],
                api_key: this.apiKey,
                api_secret: this.apiSecret,
            },
        });

        if (result?.response?.messages?.[0]?.status === '0') {
            response.setDeliveredTo(1);
            response.addResult(result.response.messages[0].to);
        } else {
            const errorText = result?.response?.messages?.[0]?.['error-text'] || 'Unknown error';
            response.addResult(message.getTo()[0]!, errorText);
        }

        return response.toObject();
    }
}
