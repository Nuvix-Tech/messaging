import { Push as PushAdapter } from '../Push';
import { JWT } from '../../helpers/jwt';
import { Push as PushMessage } from '../../messages/Push';
import { Priority } from '../../adapter';
import { Response } from '../../response';

export class APNS extends PushAdapter {
    protected static readonly NAME = 'APNS';

    constructor(
        private authKey: string,
        private authKeyId: string,
        private teamId: string,
        private bundleId: string,
        private sandbox: boolean = false
    ) {
        super();
    }

    getName(): string {
        return APNS.NAME;
    }

    getMaxMessagesPerRequest(): number {
        return 5000;
    }

    async process(message: PushMessage) {
        const payload: any = {};

        if (message.getTitle() !== null) {
            payload.aps = payload.aps || {};
            payload.aps.alert = payload.aps.alert || {};
            payload.aps.alert.title = message.getTitle();
        }
        if (message.getBody() !== null) {
            payload.aps = payload.aps || {};
            payload.aps.alert = payload.aps.alert || {};
            payload.aps.alert.body = message.getBody();
        }
        if (message.getData() !== null) {
            payload.aps = payload.aps || {};
            payload.aps.data = message.getData();
        }
        if (message.getAction() !== null) {
            payload.aps = payload.aps || {};
            payload.aps.category = message.getAction();
        }
        if (message.getCritical() !== null) {
            payload.aps = payload.aps || {};
            payload.aps.sound = {
                critical: 1,
                name: 'default',
                volume: 1.0
            };
        }
        if (message.getSound() !== null) {
            payload.aps = payload.aps || {};
            if (message.getCritical() !== null) {
                payload.aps.sound = payload.aps.sound || {};
                payload.aps.sound.name = message.getSound();
            } else {
                payload.aps.sound = message.getSound();
            }
        }
        if (message.getBadge() !== null) {
            payload.aps = payload.aps || {};
            payload.aps.badge = message.getBadge();
        }
        if (message.getContentAvailable() !== null) {
            payload.aps = payload.aps || {};
            payload.aps['content-available'] = message.getContentAvailable() ? 1 : 0;
        }

        const headers: { [key: string]: string } = {
            'Content-Type': 'application/json',
            'apns-topic': this.bundleId,
            'apns-push-type': 'alert'
        };

        if (message.getPriority() !== null) {
            headers['apns-priority'] = message.getPriority() === Priority.HIGH ? '10' : '5';
        }

        const claims = {
            iss: this.teamId,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 3600
        };

        const jwt = JWT.encode(claims, this.authKey, 'ES256', this.authKeyId);
        headers.Authorization = `Bearer ${jwt}`;

        const endpoint = this.sandbox
            ? 'https://api.development.push.apple.com'
            : 'https://api.push.apple.com';

        const urls = message.getTo().map(token => `${endpoint}/3/device/${token}`);

        const results = await this.requestMulti({
            method: 'POST',
            urls,
            headers: Object.entries(headers).map(([key, value]) => `${key}: ${value}`),
            bodies: [payload]
        });

        const response = new Response(this.getType());

        for (const result of results) {
            const device = result.url.split('/').pop() || '';
            const statusCode = result.statusCode;

            switch (statusCode) {
                case 200:
                    response.incrementDeliveredTo();
                    response.addResult(device);
                    break;
                default:
                    const error = (result.response?.reason === 'ExpiredToken' || result.response?.reason === 'BadDeviceToken')
                        ? this.getExpiredErrorMessage()
                        : result.response?.reason;

                    response.addResult(device, error);
                    break;
            }
        }

        return response.toObject();
    }
}