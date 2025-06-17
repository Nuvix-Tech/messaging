import type {
  Message,
  MultiRequestResponse,
  RequestResponse,
  SendResult,
} from "./types";
import parsePhoneNumber from "libphonenumber-js";

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
  protected abstract process(
    message: Message,
  ): Promise<SendResult | Record<string, SendResult>>;

  /**
   * Send a message.
   */
  async send(
    message: Message,
  ): Promise<SendResult | Record<string, SendResult>> {
    if (
      message.getTo &&
      message.getTo().length > this.getMaxMessagesPerRequest()
    ) {
      throw new Error(
        `${this.getName()} can only send ${this.getMaxMessagesPerRequest()} messages per request.`,
      );
    }

    return await this.process(message);
  }

  /**
   * Send a single HTTP request.
   */
  protected async request(
    method: string,
    url: string,
    headers?: string[] | Record<string, string>,
    body?: Record<string, any> | null,
    timeout?: number,
  ): Promise<RequestResponse>;
  protected async request(options: {
    method: string;
    url: string;
    headers?: string[] | Record<string, string>;
    body?: Record<string, any> | null;
    timeout?: number;
  }): Promise<RequestResponse>;
  protected async request(
    methodOrOptions:
      | string
      | {
          method: string;
          url: string;
          headers?: string[] | Record<string, string>;
          body?: Record<string, any> | null;
          timeout?: number;
        },
    url?: string,
    headers: string[] | Record<string, string> = {},
    body: Record<string, any> | null = null,
    timeout: number = 30,
  ): Promise<RequestResponse> {
    let method: string;
    let finalUrl: string;
    let finalHeaders: string[] | Record<string, string>;
    let finalBody: Record<string, any> | null;
    let finalTimeout: number;

    if (typeof methodOrOptions === "string") {
      method = methodOrOptions;
      finalUrl = url!;
      finalHeaders = headers;
      finalBody = body;
      finalTimeout = timeout;
    } else {
      method = methodOrOptions.method;
      finalUrl = methodOrOptions.url;
      finalHeaders = methodOrOptions.headers || {};
      finalBody = methodOrOptions.body || null;
      finalTimeout = methodOrOptions.timeout || 30;
    }

    const requestHeaders: Record<string, string> = {};
    let requestBody: string | undefined;

    // Process headers
    if (Array.isArray(finalHeaders)) {
      finalHeaders.forEach((header) => {
        if (header.includes(": ")) {
          const [key, ...valueParts] = header.split(": ");
          if (key && valueParts.length > 0) {
            requestHeaders[key.trim()] = valueParts.join(": ").trim();
          }
        }
      });
    } else {
      Object.entries(finalHeaders).forEach(([key, value]) => {
        requestHeaders[key.trim()] = value.trim();
      });
    }

    // Process body based on content type
    if (finalBody) {
      const contentType =
        requestHeaders["Content-Type"] || requestHeaders["content-type"];

      if (contentType?.includes("application/json") || !contentType) {
        requestBody = JSON.stringify(finalBody);
        requestHeaders["Content-Type"] = "application/json";
      } else if (contentType?.includes("application/x-www-form-urlencoded")) {
        requestBody = new URLSearchParams(
          finalBody as Record<string, string>,
        ).toString();
      } else {
        requestBody = JSON.stringify(finalBody);
      }
    }

    requestHeaders["User-Agent"] = `Nuvix ${this.getName()} Message Sender`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        finalTimeout * 1000,
      );

      const response = await fetch(finalUrl, {
        method: method.toUpperCase(),
        headers: requestHeaders,
        body: requestBody,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      let responseData: any;
      const responseText = await response.text();

      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = responseText;
      }
      console.log(`Response from ${finalUrl}:`, responseData); // #debug
      return {
        url: finalUrl,
        statusCode: response.status,
        response: responseData,
        error: response.ok
          ? null
          : `HTTP ${response.status}: ${response.statusText}`,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error(`Error during request to ${finalUrl}:`, errorMessage); // #debug
      return {
        url: finalUrl,
        statusCode: 0,
        response: null,
        error: errorMessage,
      };
    }
  }

  /**
   * Send multiple concurrent HTTP requests.
   */
  protected async requestMulti(
    method: string,
    urls: string[],
    headers?: string[] | Record<string, string>,
    bodies?: Array<Record<string, any>>,
    timeout?: number,
  ): Promise<MultiRequestResponse[]>;
  protected async requestMulti(options: {
    method: string;
    urls: string[];
    headers?: string[] | Record<string, string>;
    bodies?: Array<Record<string, any>>;
    timeout?: number;
  }): Promise<MultiRequestResponse[]>;
  protected async requestMulti(
    methodOrOptions:
      | string
      | {
          method: string;
          urls: string[];
          headers?: string[] | Record<string, string>;
          bodies?: Array<Record<string, any>>;
          timeout?: number;
        },
    urls?: string[],
    headers: string[] | Record<string, string> = {},
    bodies: Array<Record<string, any>> = [],
    timeout: number = 30,
  ): Promise<MultiRequestResponse[]> {
    let method: string;
    let finalUrls: string[];
    let finalHeaders: string[] | Record<string, string>;
    let finalBodies: Array<Record<string, any>>;
    let finalTimeout: number;

    if (typeof methodOrOptions === "string") {
      method = methodOrOptions;
      finalUrls = urls!;
      finalHeaders = headers;
      finalBodies = bodies;
      finalTimeout = timeout;
    } else {
      method = methodOrOptions.method;
      finalUrls = methodOrOptions.urls;
      finalHeaders = methodOrOptions.headers || {};
      finalBodies = methodOrOptions.bodies || [];
      finalTimeout = methodOrOptions.timeout || 30;
    }

    if (finalUrls.length === 0) {
      throw new Error("No URLs provided. Must provide at least one URL.");
    }

    const urlCount = finalUrls.length;
    const bodyCount = finalBodies.length;

    if (
      bodyCount > 0 &&
      urlCount !== bodyCount &&
      urlCount !== 1 &&
      bodyCount !== 1
    ) {
      throw new Error(
        "URL and body counts must be equal, or one must equal 1, or bodies can be empty.",
      );
    }

    const requests = finalUrls.map(async (url, index) => {
      try {
        let requestBody: Record<string, any> | null = null;

        if (finalBodies.length > 0) {
          if (bodyCount === 1) {
            requestBody = finalBodies[0]!;
          } else if (bodyCount === urlCount) {
            requestBody = finalBodies[index]!;
          }
        }

        const result = await this.request(
          method,
          url,
          finalHeaders,
          requestBody,
          finalTimeout,
        );
        return {
          index,
          ...result,
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        return {
          index,
          url,
          statusCode: 0,
          response: null,
          error: errorMessage,
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
      throw new Error("$phone cannot be empty.");
    }

    try {
      const phoneNumber = parsePhoneNumber(phone);
      return phoneNumber?.countryCallingCode
        ? parseInt(phoneNumber?.countryCallingCode?.toString())
        : null;
    } catch (error) {
      console.error("Error parsing phone number:", error);
    }

    return null;
  }
}
