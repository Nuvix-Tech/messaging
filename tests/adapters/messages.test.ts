/**
 * Tests for Message Classes and Base Adapter Functionality
 */

import { describe, expect, test } from "bun:test";
import { Adapter, Priority } from "../../src/adapter";
import { Email as EmailMessage } from "../../src/messages/Email";
import { Push as PushMessage } from "../../src/messages/Push";
import { SMS as SMSMessage } from "../../src/messages/SMS";
import { Attachment } from "../../src/messages/email/Attachment";
import { Response } from "../../src/response";
import type { Message, SendResult } from "../../src/types";
import { assertSuccessfulSendResult, generateTestId } from "../utils";

describe("Message Classes", () => {
	describe("Email Message", () => {
		test("should create email with required properties", () => {
			const email = new EmailMessage({
				to: ["test@example.com"],
				subject: "Test Subject",
				content: "Test content",
				fromName: "Test Sender",
				fromEmail: "sender@example.com",
			});

			expect(email.getTo()).toEqual(["test@example.com"]);
			expect(email.getSubject()).toBe("Test Subject");
			expect(email.getContent()).toBe("Test content");
			expect(email.getFromName()).toBe("Test Sender");
			expect(email.getFromEmail()).toBe("sender@example.com");
			expect(email.getReplyToName()).toBe("Test Sender"); // Should default to fromName
			expect(email.getReplyToEmail()).toBe("sender@example.com"); // Should default to fromEmail
			expect(email.isHtml()).toBe(false);
		});

		test("should create HTML email", () => {
			const email = new EmailMessage({
				to: ["test@example.com"],
				subject: "Test Subject",
				content: "<h1>Test HTML content</h1>",
				fromName: "Test Sender",
				fromEmail: "sender@example.com",
				html: true,
			});

			expect(email.isHtml()).toBe(true);
			expect(email.getContent()).toBe("<h1>Test HTML content</h1>");
		});

		test("should handle CC and BCC recipients", () => {
			const email = new EmailMessage({
				to: ["test@example.com"],
				subject: "Test Subject",
				content: "Test content",
				fromName: "Test Sender",
				fromEmail: "sender@example.com",
				cc: [{ name: "CC User", email: "cc@example.com" }],
				bcc: [{ email: "bcc@example.com" }],
			});

			expect(email.getCC()).toEqual([
				{ name: "CC User", email: "cc@example.com" },
			]);
			expect(email.getBCC()).toEqual([{ email: "bcc@example.com" }]);
		});

		test("should handle attachments", () => {
			const attachment = new Attachment(
				"test.txt",
				Buffer.from("test"),
				"text/plain",
			);
			const email = new EmailMessage({
				to: ["test@example.com"],
				subject: "Test Subject",
				content: "Test content",
				fromName: "Test Sender",
				fromEmail: "sender@example.com",
				attachments: [attachment],
			});

			expect(email.getAttachments()).toHaveLength(1);
			expect(email.getAttachments()?.[0]).toBe(attachment);
		});

		test("should validate CC recipients", () => {
			expect(() => {
				new EmailMessage({
					to: ["test@example.com"],
					subject: "Test Subject",
					content: "Test content",
					fromName: "Test Sender",
					fromEmail: "sender@example.com",
					cc: [{ name: "Invalid", email: "" }], // Empty email
				});
			}).toThrow("Each CC recipient must have at least an email");
		});

		test("should validate BCC recipients", () => {
			expect(() => {
				new EmailMessage({
					to: ["test@example.com"],
					subject: "Test Subject",
					content: "Test content",
					fromName: "Test Sender",
					fromEmail: "sender@example.com",
					bcc: [{ email: "" }], // Empty email
				});
			}).toThrow("Each BCC recipient must have at least an email");
		});
	});

	describe("SMS Message", () => {
		test("should create SMS with object constructor", () => {
			const sms = new SMSMessage({
				to: ["+1234567890"],
				content: "Test SMS content",
				from: "+0987654321",
			});

			expect(sms.getTo()).toEqual(["+1234567890"]);
			expect(sms.getContent()).toBe("Test SMS content");
			expect(sms.getFrom()).toBe("+0987654321");
		});

		test("should create SMS with array constructor", () => {
			const sms = new SMSMessage(
				["+1234567890"],
				"Test SMS content",
				"+0987654321",
			);

			expect(sms.getTo()).toEqual(["+1234567890"]);
			expect(sms.getContent()).toBe("Test SMS content");
			expect(sms.getFrom()).toBe("+0987654321");
		});

		test("should handle optional from parameter", () => {
			const sms = new SMSMessage({
				to: ["+1234567890"],
				content: "Test SMS content",
			});

			expect(sms.getFrom()).toBeUndefined();
		});

		test("should handle attachments", () => {
			const sms = new SMSMessage({
				to: ["+1234567890"],
				content: "Test SMS content",
				attachments: ["attachment1", "attachment2"],
			});

			expect(sms.getAttachments()).toEqual(["attachment1", "attachment2"]);
		});
	});

	describe("Push Message", () => {
		test("should create push notification with title and body", () => {
			const push = new PushMessage({
				to: ["device-token"],
				title: "Test Title",
				body: "Test Body",
			});

			expect(push.getTo()).toEqual(["device-token"]);
			expect(push.getTitle()).toBe("Test Title");
			expect(push.getBody()).toBe("Test Body");
			expect(push.getFrom()).toBeNull();
		});

		test("should create push notification with data only", () => {
			const testData = { key: "value", number: 42 };
			const push = new PushMessage({
				to: ["device-token"],
				data: testData,
			});

			expect(push.getData()).toEqual(testData);
			expect(push.getTitle()).toBeUndefined();
			expect(push.getBody()).toBeUndefined();
		});

		test("should handle all notification properties", () => {
			const push = new PushMessage({
				to: ["device-token"],
				title: "Title",
				body: "Body",
				data: { key: "value" },
				action: "action",
				sound: "sound",
				image: "image",
				icon: "icon",
				color: "color",
				tag: "tag",
				badge: 5,
				contentAvailable: true,
				critical: true,
				priority: Priority.HIGH,
			});

			expect(push.getAction()).toBe("action");
			expect(push.getSound()).toBe("sound");
			expect(push.getImage()).toBe("image");
			expect(push.getIcon()).toBe("icon");
			expect(push.getColor()).toBe("color");
			expect(push.getTag()).toBe("tag");
			expect(push.getBadge()).toBe(5);
			expect(push.getContentAvailable()).toBe(true);
			expect(push.getCritical()).toBe(true);
			expect(push.getPriority()).toBe(Priority.HIGH);
		});

		test("should require at least one of title, body, or data", () => {
			expect(() => {
				new PushMessage({
					to: ["device-token"],
				});
			}).toThrow(
				"At least one of the following parameters must be set: title, body, data",
			);
		});
	});

	describe("Attachment", () => {
		test("should create attachment with buffer data", async () => {
			const buffer = Buffer.from("test data");
			const attachment = new Attachment("test.txt", buffer, "text/plain");

			expect(attachment.getName()).toBe("test.txt");
			expect(attachment.getType()).toBe("text/plain");
			expect(attachment.getPath()).toBe(buffer);
			expect(await attachment.getSize()).toBe(buffer.length);
			expect(await attachment.getData()).toBe(buffer);
		});

		test("should create attachment with explicit size", async () => {
			const buffer = Buffer.from("test data");
			const attachment = new Attachment("test.txt", buffer, "text/plain", 100);

			expect(await attachment.getSize()).toBe(100);
		});
	});
});

describe("Response Class", () => {
	test("should create response with type", () => {
		const response = new Response("email");

		expect(response.getType()).toBe("email");
		expect(response.getDeliveredTo()).toBe(0);
		expect(response.getDetails()).toEqual([]);
	});

	test("should handle delivered count", () => {
		const response = new Response("email");

		response.setDeliveredTo(5);
		expect(response.getDeliveredTo()).toBe(5);

		response.incrementDeliveredTo();
		expect(response.getDeliveredTo()).toBe(6);
	});

	test("should add successful results", () => {
		const response = new Response("email");

		response.addResult("test@example.com");
		response.setDeliveredTo(1);

		const details = response.getDetails();
		expect(details).toHaveLength(1);
		expect(details[0]).toEqual({
			recipient: "test@example.com",
			status: "success",
			error: "",
		});
	});

	test("should add failed results", () => {
		const response = new Response("email");

		response.addResult("test@example.com", "Invalid email address");

		const details = response.getDetails();
		expect(details).toHaveLength(1);
		expect(details[0]).toEqual({
			recipient: "test@example.com",
			status: "failure",
			error: "Invalid email address",
		});
	});

	test("should convert to object", () => {
		const response = new Response("email");
		response.setDeliveredTo(2);
		response.addResult("test1@example.com");
		response.addResult("test2@example.com", "Failed");

		const obj = response.toObject();
		expect(obj).toEqual({
			deliveredTo: 2,
			type: "email",
			results: [
				{ recipient: "test1@example.com", status: "success", error: "" },
				{ recipient: "test2@example.com", status: "failure", error: "Failed" },
			],
		});
	});
});

describe("Base Adapter Functionality", () => {
	// Create a test adapter for testing base functionality
	class TestAdapter extends Adapter {
		constructor(private testName = "TestAdapter") {
			super();
		}

		getName(): string {
			return this.testName;
		}

		getType(): string {
			return "test";
		}

		getMessageType(): string {
			return "TestMessage";
		}

		getMaxMessagesPerRequest(): number {
			return 100;
		}

		protected async process(message: Message): Promise<SendResult> {
			return {
				deliveredTo: message.getTo?.()?.length || 0,
				type: this.getType(),
				results:
					message.getTo?.()?.map((to) => ({
						recipient: to,
						status: "success" as const,
						error: "",
					})) || [],
			};
		}

		// Expose protected methods for testing
		public async testRequest(
			method: string,
			url: string,
			headers?: Record<string, string>,
			body?: any,
		) {
			return this.request(method, url, headers, body);
		}

		public testGetCountryCode(phone: string) {
			return this.getCountryCode(phone);
		}
	}

	test("should enforce message limit per request", async () => {
		const adapter = new TestAdapter();
		adapter.getMaxMessagesPerRequest = () => 2; // Override for test

		const message = new SMSMessage({
			to: ["+1", "+2", "+3"], // 3 recipients, but limit is 2
			content: "Test",
		});

		await expect(adapter.send(message)).rejects.toThrow(
			"TestAdapter can only send 2 messages per request.",
		);
	});

	test("should get country code from phone number", () => {
		const adapter = new TestAdapter();

		expect(adapter.testGetCountryCode("+1234567890")).toBe(1);
		expect(adapter.testGetCountryCode("+44123456789")).toBe(44);
		expect(adapter.testGetCountryCode("+91987654321")).toBe(91);
	});

	test("should handle invalid phone numbers", () => {
		const adapter = new TestAdapter();

		expect(() => adapter.testGetCountryCode("")).toThrow(
			"$phone cannot be empty.",
		);
		expect(adapter.testGetCountryCode("invalid")).toBeNull();
	});

	test("should handle Priority enum", () => {
		expect(Priority.NORMAL).toBe(0);
		expect(Priority.HIGH).toBe(1);
	});
});
