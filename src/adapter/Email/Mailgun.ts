import { Email as EmailAdapter } from "../Email";
import { Email as EmailMessage } from "../../messages/Email";
import { Response } from "../../response";

export class Mailgun extends EmailAdapter {
  protected static readonly NAME = "Mailgun";

  /**
   * @param apiKey Your Mailgun API key to authenticate with the API.
   * @param domain Your Mailgun domain to send messages from.
   * @param isEU Whether to use EU servers (defaults to false for US servers).
   */
  constructor(
    private readonly apiKey: string,
    private readonly domain: string,
    private readonly isEU: boolean = false,
  ) {
    super();
  }

  /**
   * Get adapter name.
   */
  getName(): string {
    return Mailgun.NAME;
  }

  /**
   * Get maximum messages per request.
   */
  getMaxMessagesPerRequest(): number {
    return 1000;
  }

  /**
   * Process email message using Mailgun's API.
   * Uses Mailgun's batch sending feature to send multiple emails at once.
   *
   * @link https://documentation.mailgun.com/docs/mailgun/user-manual/sending-messages/#batch-sending
   */
  protected async process(message: EmailMessage) {
    const usDomain = "api.mailgun.net";
    const euDomain = "api.eu.mailgun.net";
    const domain = this.isEU ? euDomain : usDomain;

    const body: Record<string, any> = {
      to: message.getTo().join(","),
      from: `${message.getFromName()}<${message.getFromEmail()}>`,
      subject: message.getSubject(),
      text: message.isHtml() ? null : message.getContent(),
      html: message.isHtml() ? message.getContent() : null,
      "h:Reply-To": `${message.getReplyToName()}<${message.getReplyToEmail()}>`,
    };

    if (message.getTo().length > 1) {
      const recipientVariables: Record<string, any> = {};
      message.getTo().forEach((email) => {
        recipientVariables[email] = {};
      });
      body["recipient-variables"] = JSON.stringify(recipientVariables);
    }

    if (message.getCC()) {
      const ccStrings: string[] = [];
      message.getCC()?.forEach((cc) => {
        if (cc.email) {
          const ccString = cc.name ? `${cc.name}<${cc.email}>` : cc.email;
          ccStrings.push(ccString);
        }
      });
      if (ccStrings.length > 0) {
        body.cc = ccStrings.join(",");
      }
    }

    if (message.getBCC()) {
      const bccStrings: string[] = [];
      message.getBCC()?.forEach((bcc) => {
        if (bcc.email) {
          const bccString = bcc.name ? `${bcc.name}<${bcc.email}>` : bcc.email;
          bccStrings.push(bccString);
        }
      });
      if (bccStrings.length > 0) {
        body.bcc = bccStrings.join(",");
      }
    }

    let isMultipart = false;

    if (message.getAttachments()) {
      let size = 0;
      for (const attachment of message.getAttachments()!) {
        size += await attachment.getSize();
      }

      if (size > Mailgun.MAX_ATTACHMENT_BYTES) {
        throw new Error("Attachments size exceeds the maximum allowed size");
      }

      if (message.getAttachments()!.length > 0) {
        isMultipart = true;
        for (let index = 0; index < message.getAttachments()!.length; index++) {
          const attachment = message.getAttachments()![index]!;
          body[`attachment[${index}]`] = {
            value: (await attachment.getData()).toString("base64"),
            options: {
              filename: attachment.getName(),
              contentType: attachment.getType(),
            },
          };
        }
      }
    }

    const response = new Response(this.getType());

    const headers: Record<string, string> = {
      Authorization: `Basic ${Buffer.from(`api:${this.apiKey}`).toString("base64")}`,
    };

    if (isMultipart) {
      headers["Content-Type"] = "multipart/form-data";
    } else {
      headers["Content-Type"] = "application/x-www-form-urlencoded";
    }

    const result = await this.request({
      method: "POST",
      url: `https://${domain}/v3/${this.domain}/messages`,
      headers,
      body,
    });

    const statusCode = result.statusCode;

    if (statusCode >= 200 && statusCode < 300) {
      response.setDeliveredTo(message.getTo().length);
      message.getTo().forEach((to) => {
        response.addResult(to);
      });
    } else if (statusCode >= 400 && statusCode < 500) {
      message.getTo().forEach((to) => {
        if (typeof result.response === "string") {
          response.addResult(to, result.response);
        } else if (result.response?.message) {
          response.addResult(to, result.response.message);
        } else {
          response.addResult(to, "Unknown error");
        }
      });
    }

    return response.toObject();
  }
}
