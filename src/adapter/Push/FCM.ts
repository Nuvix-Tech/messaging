import { Push as PushAdapter } from "../Push";
import { JWT } from "../../helpers/jwt";
import { Push as PushMessage } from "../../messages/Push";
import { Priority } from "../../adapter";
import { Response } from "../../response";

export class FCM extends PushAdapter {
  protected static readonly NAME = "FCM";
  protected static readonly DEFAULT_EXPIRY_SECONDS = 3600; // 1 hour
  protected static readonly DEFAULT_SKEW_SECONDS = 60; // 1 minute
  protected static readonly GOOGLE_TOKEN_URL =
    "https://www.googleapis.com/oauth2/v4/token";

  constructor(private serviceAccountJSON: string) {
    super();
  }

  getName(): string {
    return FCM.NAME;
  }

  getMaxMessagesPerRequest(): number {
    return 5000;
  }

  protected async process(message: PushMessage) {
    const credentials = JSON.parse(this.serviceAccountJSON);
    const now = Math.floor(Date.now() / 1000);

    const signingKey = credentials.private_key;
    const signingAlgorithm = "RS256";

    const payload = {
      iss: credentials.client_email,
      exp: now + FCM.DEFAULT_EXPIRY_SECONDS,
      iat: now - FCM.DEFAULT_SKEW_SECONDS,
      scope: "https://www.googleapis.com/auth/firebase.messaging",
      aud: FCM.GOOGLE_TOKEN_URL,
    };

    const jwt = JWT.encode(payload, signingKey, signingAlgorithm);

    const token = await this.request({
      method: "POST",
      url: FCM.GOOGLE_TOKEN_URL,
      headers: ["Content-Type: application/x-www-form-urlencoded"],
      body: {
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwt,
      },
    });

    const accessToken = token.response.access_token;
    const shared: any = {};

    if (message.getTitle() !== null) {
      shared.message = shared.message || {};
      shared.message.notification = shared.message.notification || {};
      shared.message.notification.title = message.getTitle();
    }
    if (message.getBody() !== null) {
      shared.message = shared.message || {};
      shared.message.notification = shared.message.notification || {};
      shared.message.notification.body = message.getBody();
    }
    if (message.getData() !== null) {
      shared.message = shared.message || {};
      shared.message.data = message.getData();
    }
    if (message.getAction() !== null) {
      shared.message = shared.message || {};
      shared.message.android = shared.message.android || {};
      shared.message.android.notification =
        shared.message.android.notification || {};
      shared.message.android.notification.click_action = message.getAction();

      shared.message.apns = shared.message.apns || {};
      shared.message.apns.payload = shared.message.apns.payload || {};
      shared.message.apns.payload.aps = shared.message.apns.payload.aps || {};
      shared.message.apns.payload.aps.category = message.getAction();
    }
    if (message.getImage() !== null) {
      shared.message = shared.message || {};
      shared.message.android = shared.message.android || {};
      shared.message.android.notification =
        shared.message.android.notification || {};
      shared.message.android.notification.image = message.getImage();

      shared.message.apns = shared.message.apns || {};
      shared.message.apns.payload = shared.message.apns.payload || {};
      shared.message.apns.payload.aps = shared.message.apns.payload.aps || {};
      shared.message.apns.payload.aps["mutable-content"] = 1;

      shared.message.apns.fcm_options = shared.message.apns.fcm_options || {};
      shared.message.apns.fcm_options.image = message.getImage();
    }
    if (message.getCritical() !== null) {
      shared.message = shared.message || {};
      shared.message.apns = shared.message.apns || {};
      shared.message.apns.payload = shared.message.apns.payload || {};
      shared.message.apns.payload.aps = shared.message.apns.payload.aps || {};
      shared.message.apns.payload.aps.sound =
        shared.message.apns.payload.aps.sound || {};
      shared.message.apns.payload.aps.sound.critical = 1;
    }
    if (message.getSound() !== null) {
      shared.message = shared.message || {};
      shared.message.android = shared.message.android || {};
      shared.message.android.notification =
        shared.message.android.notification || {};
      shared.message.android.notification.sound = message.getSound();

      shared.message.apns = shared.message.apns || {};
      shared.message.apns.payload = shared.message.apns.payload || {};
      shared.message.apns.payload.aps = shared.message.apns.payload.aps || {};

      if (message.getCritical() !== null) {
        shared.message.apns.payload.aps.sound =
          shared.message.apns.payload.aps.sound || {};
        shared.message.apns.payload.aps.sound.name = message.getSound();
      } else {
        shared.message.apns.payload.aps.sound = message.getSound();
      }
    }
    if (message.getIcon() !== null) {
      shared.message = shared.message || {};
      shared.message.android = shared.message.android || {};
      shared.message.android.notification =
        shared.message.android.notification || {};
      shared.message.android.notification.icon = message.getIcon();
    }
    if (message.getColor() !== null) {
      shared.message = shared.message || {};
      shared.message.android = shared.message.android || {};
      shared.message.android.notification =
        shared.message.android.notification || {};
      shared.message.android.notification.color = message.getColor();
    }
    if (message.getTag() !== null) {
      shared.message = shared.message || {};
      shared.message.android = shared.message.android || {};
      shared.message.android.notification =
        shared.message.android.notification || {};
      shared.message.android.notification.tag = message.getTag();
    }
    if (message.getBadge() !== null) {
      shared.message = shared.message || {};
      shared.message.apns = shared.message.apns || {};
      shared.message.apns.payload = shared.message.apns.payload || {};
      shared.message.apns.payload.aps = shared.message.apns.payload.aps || {};
      shared.message.apns.payload.aps.badge = message.getBadge();
    }
    if (message.getContentAvailable() !== null) {
      shared.message = shared.message || {};
      shared.message.apns = shared.message.apns || {};
      shared.message.apns.payload = shared.message.apns.payload || {};
      shared.message.apns.payload.aps = shared.message.apns.payload.aps || {};
      shared.message.apns.payload.aps["content-available"] = Number(
        message.getContentAvailable(),
      );
    }
    if (message.getPriority() !== null) {
      shared.message = shared.message || {};
      shared.message.android = shared.message.android || {};
      shared.message.android.priority =
        message.getPriority() === Priority.HIGH ? "high" : "normal";

      shared.message.apns = shared.message.apns || {};
      shared.message.apns.headers = shared.message.apns.headers || {};
      shared.message.apns.headers["apns-priority"] =
        message.getPriority() === Priority.HIGH ? "10" : "5";
    }

    const bodies = message.getTo().map((to) => ({
      ...shared,
      message: {
        ...shared.message,
        token: to,
      },
    }));

    const results = await this.requestMulti({
      method: "POST",
      urls: [
        `https://fcm.googleapis.com/v1/projects/${credentials.project_id}/messages:send`,
      ],
      headers: [
        "Content-Type: application/json",
        `Authorization: Bearer ${accessToken}`,
      ],
      bodies,
    });

    const response = new Response(this.getType());

    results.forEach((result) => {
      if (result.statusCode === 200) {
        response.incrementDeliveredTo();
        response.addResult(message.getTo?.()[result.index] as string);
      } else {
        const error =
          result.response?.error?.status === "UNREGISTERED" ||
          result.response?.error?.status === "NOT_FOUND"
            ? this.getExpiredErrorMessage()
            : (result.response?.error?.message ?? "Unknown error");

        response.addResult(message.getTo?.()[result.index] as string, error);
      }
    });

    return response.toObject();
  }
}
