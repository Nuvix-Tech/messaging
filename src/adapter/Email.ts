import { Adapter } from "../adapter";
import { Email as EmailMessage } from "../messages/Email";

export abstract class Email extends Adapter {
  protected static readonly TYPE = "email";
  protected static readonly MESSAGE_TYPE = EmailMessage.name;

  protected static readonly MAX_ATTACHMENT_BYTES = 25 * 1024 * 1024; // 25MB

  public getType(): string {
    return (this.constructor as typeof Email).TYPE;
  }

  public getMessageType() {
    return (this.constructor as typeof Email).MESSAGE_TYPE;
  }

  /**
   * Process an email message.
   *
   * @returns Object containing deliveredTo count, type, and results array
   * @throws Error
   */
  protected abstract process(message: EmailMessage): Promise<{
    deliveredTo: number;
    type: string;
    results: Array<Record<string, any>>;
  }>;
}
