import { Adapter } from "../adapter";
import { Push as PushMessage } from "../messages/Push";

export abstract class Push extends Adapter {
  protected static readonly TYPE = "push";
  protected static readonly MESSAGE_TYPE = PushMessage.name;
  protected static readonly EXPIRED_MESSAGE = "Expired device token";

  public getType(): string {
    return Push.TYPE;
  }

  public getMessageType() {
    return Push.MESSAGE_TYPE;
  }

  protected getExpiredErrorMessage(): string {
    return Push.EXPIRED_MESSAGE;
  }

  /**
   * Send a push message.
   *
   * @returns Object containing deliveredTo count, type, and results array
   * @throws Error
   */
  protected abstract process(message: PushMessage): Promise<{
    deliveredTo: number;
    type: string;
    results: Array<Record<string, any>>;
  }>;
}
