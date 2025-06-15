import type { Message, MultiRequestResponse, RequestResponse, SendResult } from "./types";
import parsePhoneNumber from 'libphonenumber-js'

export enum Priority {
    NORMAL = 0,
    HIGH = 1,
}

export abstract class Adapter {
    /**
     * Get the name of the adapter.
     */
    abstract getName(): string;

    /**
     * Get the type of the adapter.
     */
    abstract getType(): string;

    /**
     * Get the type of the message the adapter can send.
     */
    abstract getMessageType(): string;

    /**
     * Get the maximum number of messages that can be sent in a single request.
     */
    abstract getMaxMessagesPerRequest(): number;

    /**
     * Process the message (to be implemented by subclasses).
     */
    protected abstract process(message: Message): Promise<SendResult | Record<string, SendResult>>;

    /**
     * Send a message.
     */
    async send(message: Message): Promise<SendResult | Record<string, SendResult>> {
        if (message.getTo && message.getTo().length > this.getMaxMessagesPerRequest()) {
            throw new Error(`${this.getName()} can only send ${this.getMaxMessagesPerRequest()} messages per request.`);
        }

        return await this.process(message);
    }

    /**
     * Send a single HTTP request.
     */
    protected async request(
        method: string,
        url: string,
        headers: string[] = [],
        body: Record<string, any> | null = null,
        timeout: number = 30
    ): Promise<RequestResponse> {
        const requestHeaders: Record<string, string> = {};
        let requestBody: string | undefined;

        // Process headers
        headers.forEach(header => {
            const [key, value] = header.split(': ');
            if (key && value) {
                requestHeaders[key] = value;
            }
        });

        // Process body based on content type
        if (body) {
            const contentType = headers.find(h => h.includes('application/json'));
            const formType = headers.find(h => h.includes('application/x-www-form-urlencoded'));

            if (contentType) {
                requestBody = JSON.stringify(body);
                requestHeaders['Content-Type'] = 'application/json';
            } else if (formType) {
                requestBody = new URLSearchParams(body as Record<string, string>).toString();
                requestHeaders['Content-Type'] = 'application/x-www-form-urlencoded';
            }
        }

        requestHeaders['User-Agent'] = `Appwrite ${this.getName()} Message Sender`;

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout * 1000);

            const response = await fetch(url, {
                method,
                headers: requestHeaders,
                body: requestBody,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            let responseData: any;
            try {
                responseData = await response.json();
            } catch {
                responseData = await response.text();
            }

            return {
                url,
                statusCode: response.status,
                response: responseData,
                error: null
            };
        } catch (error) {
            return {
                url,
                statusCode: 0,
                response: null,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Send multiple concurrent HTTP requests.
     */
    protected async requestMulti(
        method: string,
        urls: string[],
        headers: string[] = [],
        bodies: Array<Record<string, any>> = [],
        timeout: number = 30
    ): Promise<MultiRequestResponse[]> {
        if (urls.length === 0) {
            throw new Error('No URLs provided. Must provide at least one URL.');
        }

        const urlCount = urls.length;
        const bodyCount = bodies.length;

        if (!(urlCount === bodyCount || urlCount === 1 || bodyCount === 1)) {
            throw new Error('URL and body counts must be equal or one must equal 1.');
        }

        // Pad arrays if needed
        const paddedUrls = urlCount < bodyCount ?
            Array(bodyCount).fill(urls[0]) : urls;
        const paddedBodies = bodyCount < urlCount ?
            Array(urlCount).fill(bodies[0] || {}) : bodies;

        const requests = paddedUrls.map(async (url, index) => {
            try {
                const result = await this.request(method, url, headers, paddedBodies[index], timeout);
                return {
                    index,
                    ...result
                };
            } catch (error) {
                return {
                    index,
                    url,
                    statusCode: 0,
                    response: null,
                    error: error instanceof Error ? error.message : 'Unknown error'
                };
            }
        });

        return Promise.all(requests);
    }

    /**
     * Get country code from phone number.
     */
    getCountryCode(phone: string): number | null {
        if (!phone) {
            throw new Error('$phone cannot be empty.');
        }

        try {
            const phoneNumber = parsePhoneNumber(phone);
            return phoneNumber?.countryCallingCode ? parseInt(phoneNumber?.countryCallingCode?.toString()) : null;
        } catch (error) {
            console.error('Error parsing phone number:', error);
        }

        return null;
    }
}