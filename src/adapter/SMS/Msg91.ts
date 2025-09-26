import type { SMS as SMSMessage } from "../../messages/SMS";
import { Response } from "../../response";
import { SMS as SMSAdapter } from "../SMS";

// Reference Material
// https://docs.msg91.com/p/tf9GTextN/e/7WESqQ4RLu/MSG91

export class Msg91 extends SMSAdapter {
	protected static readonly NAME = "Msg91";

	/**
	 * @param senderId Msg91 Sender ID
	 * @param authKey Msg91 Auth Key
	 * @param templateId Msg91 Template ID
	 */
	constructor(
		private readonly senderId: string,
		private readonly authKey: string,
		private readonly templateId: string,
	) {
		super();
	}

	public getName(): string {
		return Msg91.NAME;
	}

	public getMaxMessagesPerRequest(): number {
		// TODO: Find real limit
		return 100;
	}

	protected async process(message: SMSMessage) {
		const recipients = message.getTo().map((recipient) => ({
			mobiles: recipient.startsWith("+") ? recipient.substring(1) : recipient,
			content: message.getContent(),
			otp: message.getContent(),
		}));

		const response = new Response(this.getType());
		const result = await this.request({
			method: "POST",
			url: "https://api.msg91.com/api/v5/flow/",
			headers: {
				"Content-Type": "application/json",
				Authkey: this.authKey,
			},
			body: {
				sender: this.senderId,
				template_id: this.templateId,
				recipients: recipients,
			},
		});

		if (result.statusCode === 200) {
			response.setDeliveredTo(message.getTo().length);
			message.getTo().forEach((to) => {
				response.addResult(to);
			});
		} else {
			message.getTo().forEach((to) => {
				response.addResult(to, "Unknown error");
			});
		}

		return response.toObject();
	}
}
