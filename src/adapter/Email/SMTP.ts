import * as nodemailer from 'nodemailer';
import { Email as EmailAdapter } from '../Email';
import { Email as EmailMessage } from '../../messages/Email';
import { Response } from '../../response';

export class SMTP extends EmailAdapter {
    protected static readonly NAME = 'SMTP';

    private transporter: nodemailer.Transporter;

    /**
     * @param host SMTP hosts. Either a single hostname or multiple semicolon-delimited hostnames.
     * @param port The default SMTP server port.
     * @param username Authentication username.
     * @param password Authentication password.
     * @param secure True for 465, false for other ports
     * @param smtpSecure SMTP Secure prefix. Can be '', 'ssl' or 'tls'
     * @param xMailer The value to use for the X-Mailer header.
     */
    constructor(
        private host: string,
        private port: number = 25,
        private username: string = '',
        private password: string = '',
        private secure: boolean = false,
        private smtpSecure: string = '',
        private xMailer: string = ''
    ) {
        super();

        if (!['', 'ssl', 'tls'].includes(this.smtpSecure)) {
            throw new Error('Invalid SMTP secure prefix. Must be "", "ssl" or "tls"');
        }

        this.transporter = nodemailer.createTransport({
            host: this.host,
            port: this.port,
            secure: this.secure,
            auth: this.username && this.password ? {
                user: this.username,
                pass: this.password
            } : undefined,
            tls: this.smtpSecure === 'tls' ? { rejectUnauthorized: false } : undefined,
            debug: true, // Enable debug output for testing
            logger: true // Enable logging for debugging
        });
    }

    getName(): string {
        return SMTP.NAME;
    }

    getMaxMessagesPerRequest(): number {
        return 1000;
    }

    protected async process(message: EmailMessage) {
        const response = new Response(this.getType());

        const mailOptions: nodemailer.SendMailOptions = {
            from: `${message.getFromName()} <${message.getFromEmail()}>`,
            replyTo: `${message.getReplyToName()} <${message.getReplyToEmail()}>`,
            subject: message.getSubject(),
            html: message.isHtml() ? message.getContent() : undefined,
            text: !message.isHtml() ? message.getContent() : message.getContent().replace(/<style\b[^>]*>(.*?)<\/style>/gis, '').replace(/<[^>]*>/g, '').trim(),
            headers: this.xMailer ? { 'X-Mailer': this.xMailer } : undefined
        };

        // Handle recipients
        if (message.getTo().length === 0) {
            if (message.getBCC() && message.getBCC()!.length === 0 && !message.getDefaultRecipient()) {
                throw new Error('Email requires either "to" recipients or both BCC and a default recipient configurations');
            }
            mailOptions.to = message.getDefaultRecipient();
        } else {
            mailOptions.to = message.getTo();
        }

        if (message.getCC()) {
            mailOptions.cc = message.getCC()?.map(cc => `${cc.name || ''} <${cc.email}>`);
        }

        if (message.getBCC()) {
            mailOptions.bcc = message.getBCC()?.map(bcc => `${bcc.name || ''} <${bcc.email}>`);
        }

        // Handle attachments
        if (message.getAttachments() && message.getAttachments()!.length > 0) {
            let size = 0;
            for (const attachment of message.getAttachments()!) {
                size += await attachment.getSize();
            }

            if (size > SMTP.MAX_ATTACHMENT_BYTES) {
                throw new Error('Attachments size exceeds the maximum allowed size of 25MB');
            }

            mailOptions.attachments = await Promise.all(
                message.getAttachments()!.map(async attachment => ({
                    filename: attachment.getName(),
                    content: await attachment.getData(),
                    contentType: attachment.getType()
                }))
            );
        }

        try {
            const info = await this.transporter.sendMail(mailOptions);

            const totalDelivered = message.getTo().length + message.getCC()!.length + message.getBCC()!.length;
            response.setDeliveredTo(totalDelivered);

            // Add results for each recipient
            message.getTo().forEach(to => response.addResult(to, ''));
            message.getCC()!.forEach(cc => response.addResult(cc.email, ''));
            message.getBCC()!.forEach(bcc => response.addResult(bcc.email, ''));

            return response.toObject();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';

            message.getTo().forEach(to => response.addResult(to, errorMessage));
            message.getCC()!.forEach(cc => response.addResult(cc.email, errorMessage));
            message.getBCC()!.forEach(bcc => response.addResult(bcc.email, errorMessage));

            return response.toObject();
        }
    }
}