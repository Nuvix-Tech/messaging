import { Adapter } from '../adapter';
import { SMS as SMSMessage } from '../messages/SMS';

export abstract class SMS extends Adapter {
    protected static readonly TYPE = 'sms';
    protected static readonly MESSAGE_TYPE = SMSMessage.name;

    public getType(): string {
        return SMS.TYPE;
    }

    public getMessageType() {
        return SMS.MESSAGE_TYPE;
    }

    /**
     * Send an SMS message.
     *
     * @param message Message to send.
     * @returns Promise resolving to delivery results
     * @throws Error if the message fails.
     */
    protected abstract process(message: SMSMessage): Promise<{
        deliveredTo: number;
        type: string;
        results: Array<Record<string, any>>;
    }>;
}