import type { SMS as SMSMessage } from "../../messages/SMS";
import { Response } from "../../response";
import { SMS as SMSAdapter } from "../SMS";

export class TextMagic extends SMSAdapter {
	protected static readonly NAME = "Textmagic";

	/**
	 * @param username Textmagic account username
	 * @param apiKey Textmagic account API key
	 * @param from Optional sender phone number
	 */
	constructor(
		private username: string,
		private apiKey: string,
		private from?: string,
	) {
		super();
	}

	public getName(): string {
		return TextMagic.NAME;
	}

	public getMaxMessagesPerRequest(): number {
		return 1000;
	}

	protected async process(message: SMSMessage) {
		const to = message.getTo().map((recipient) => recipient.replace(/^\+/, ""));

		const response = new Response(this.getType());
		const result = await this.request({
			method: "POST",
			url: "https://rest.textmagic.com/api/v2/messages",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				"X-TM-Username": this.username,
				"X-TM-Key": this.apiKey,
			},
			body: {
				text: message.getContent(),
				from: (this.from ?? message.getFrom()!).replace(/^\+/, ""),
				phones: to.join(","),
			},
		});

		if (result.statusCode >= 200 && result.statusCode < 300) {
			response.setDeliveredTo(message.getTo().length);
			message.getTo().forEach((recipient) => {
				response.addResult(recipient);
			});
		} else {
			message.getTo().forEach((recipient) => {
				const errorMessage = result.response?.message ?? "Unknown error";
				response.addResult(recipient, errorMessage);
			});
		}

		return response.toObject();
	}
}
