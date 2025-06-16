import { Email as EmailAdapter } from '../Email';
import { Email as EmailMessage } from '../../messages/Email';
import { Response } from '../../response';

export class Sendgrid extends EmailAdapter {
    protected static readonly NAME = 'Sendgrid';

    /**
     * @param apiKey Your Sendgrid API key to authenticate with the API.
     */
    constructor(private apiKey: string) {
        super();
    }

    /**
     * Get adapter name.
     */
    getName(): string {
        return Sendgrid.NAME;
    }

    /**
     * Get max messages per request.
     */
    getMaxMessagesPerRequest(): number {
        return 1000;
    }

    /**
     * Uses Sendgrid's personalization recipient variables to send multiple emails at once.
     * 
     * @link https://www.twilio.com/docs/sendgrid/for-developers/sending-email/personalizations#-Sending-Two-Different-Emails-to-Two-Different-Groups-of-Recipients
     */
    protected async process(message: EmailMessage) {
        const personalizations = message.getTo().map(to => ({
            to: [{ email: to }],
            subject: message.getSubject()
        }));

        if (message.getCC()) {
            personalizations.forEach(personalization => {
                message.getCC()?.forEach(cc => {
                    const entry: any = { email: cc.email };
                    if (cc.name) {
                        entry.name = cc.name;
                    }
                    if (!(personalization as any).cc) {
                        (personalization as any).cc = [];
                    }
                    (personalization as any).cc.push(entry);
                });
            });
        }

        if (message.getBCC()) {
            personalizations.forEach(personalization => {
                message.getBCC()?.forEach(bcc => {
                    const entry: any = { email: bcc.email };
                    if (bcc.name) {
                        entry.name = bcc.name;
                    }
                    if (!(personalization as any).bcc) {
                        (personalization as any).bcc = [];
                    }
                    (personalization as any).bcc.push(entry);
                });
            });
        }

        const attachments: any[] = [];

        if (message.getAttachments()) {
            let size = 0;

            for (const attachment of message.getAttachments()!) {
                const fs = await import('fs');
                const stats = fs.statSync(attachment.getPath());
                size += stats.size;
            }

            if (size > Sendgrid.MAX_ATTACHMENT_BYTES) {
                throw new Error('Attachments size exceeds the maximum allowed size of 25MB');
            }

            const fs = await import('fs');
            for (const attachment of message.getAttachments()!) {
                const content = fs.readFileSync(attachment.getPath());
                attachments.push({
                    content: content.toString('base64'),
                    filename: attachment.getName(),
                    type: attachment.getType(),
                    disposition: 'attachment'
                });
            }
        }

        const body: any = {
            personalizations,
            reply_to: {
                name: message.getReplyToName(),
                email: message.getReplyToEmail()
            },
            from: {
                name: message.getFromName(),
                email: message.getFromEmail()
            },
            content: [
                {
                    type: message.isHtml() ? 'text/html' : 'text/plain',
                    value: message.getContent()
                }
            ]
        };

        if (attachments.length > 0) {
            body.attachments = attachments;
        }

        const response = new Response(this.getType());
        const result = await this.request({
            method: 'POST',
            url: 'https://api.sendgrid.com/v3/mail/send',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            },
            body
        });

        const statusCode = result.statusCode;

        if (statusCode === 202) {
            response.setDeliveredTo(message.getTo().length);
            message.getTo().forEach(to => {
                response.addResult(to);
            });
        } else {
            message.getTo().forEach(to => {
                if (typeof result.response === 'string') {
                    response.addResult(to, result.response);
                } else if (result.response?.errors?.[0]?.message) {
                    response.addResult(to, result.response.errors[0].message);
                } else {
                    response.addResult(to, 'Unknown error');
                }
            });
        }

        return response.toObject();
    }
}