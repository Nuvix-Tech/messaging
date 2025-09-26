import type { SMS as SMSMessage } from "../../messages/SMS";
import { Response } from "../../response";
import { SMS as SMSAdapter } from "../SMS";

export class Twilio extends SMSAdapter {
	protected static readonly NAME = "Twilio";

	/**
	 * @param accountSid Twilio Account SID
	 * @param authToken Twilio Auth Token
	 */
	constructor(
		private accountSid: string,
		private authToken: string,
		private from?: string,
		private messagingServiceSid?: string,
	) {
		super();
	}

	public getName(): string {
		return Twilio.NAME;
	}

	public getMaxMessagesPerRequest(): number {
		return 1;
	}

	protected async process(message: SMSMessage) {
		const response = new Response(this.getType());

		const result = await this.request({
			method: "POST",
			url: `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`,
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				Authorization: `Basic ${Buffer.from(`${this.accountSid}:${this.authToken}`).toString("base64")}`,
			},
			body: {
				Body: message.getContent(),
				From: this.from ?? message.getFrom(),
				To: message.getTo()[0],
				...(this.messagingServiceSid
					? { MessagingServiceSid: this.messagingServiceSid ?? undefined }
					: {}),
			},
		});

		if (result.statusCode >= 200 && result.statusCode < 300) {
			response.setDeliveredTo(1);
			response.addResult(message.getTo()[0]!);
		} else {
			if (result.response?.message != null) {
				response.addResult(message.getTo()[0]!, result.response.message);
			} else {
				response.addResult(message.getTo()[0]!, "Unknown error");
			}
		}

		return response.toObject();
	}
}
