/**
 * Tests for SMS Adapters
 */

import { beforeEach, describe, expect, test } from "bun:test";
import { Msg91 } from "../../src/adapter/SMS/Msg91";
import { Telesign } from "../../src/adapter/SMS/Telesign";
import { TextMagic } from "../../src/adapter/SMS/TextMagic";
import { Twilio } from "../../src/adapter/SMS/Twilio";
import { Vonage } from "../../src/adapter/SMS/Vonage";
import { SMS as SMSMessage } from "../../src/messages/SMS";
import { skipIfNoCredentials, testConfig, testMessages } from "../setup";
import {
	assertFailedSendResult,
	assertSuccessfulSendResult,
	generateTestId,
	isValidPhoneNumber,
} from "../utils";

describe("SMS Adapters", () => {
	let testSMS: SMSMessage;
	let testSMSWithFrom: SMSMessage;
	let testSMSMultipleRecipients: SMSMessage;

	beforeEach(() => {
		const testId = generateTestId();

		testSMS = new SMSMessage({
			to: [testConfig.twilio.testPhoneNumber],
			content: `${testMessages.sms.content} - ${testId}`,
		});

		testSMSWithFrom = new SMSMessage({
			to: [testConfig.twilio.testPhoneNumber],
			content: `${testMessages.sms.content} (with from) - ${testId}`,
			from: testConfig.twilio.from,
		});

		testSMSMultipleRecipients = new SMSMessage({
			to: [
				testConfig.twilio.testPhoneNumber,
				testConfig.vonage.testPhoneNumber,
			],
			content: `${testMessages.sms.content} (multi) - ${testId}`,
		});
	});

	describe("Twilio Adapter", () => {
		test("should have correct adapter properties", () => {
			try {
				skipIfNoCredentials("twilio");

				const adapter = new Twilio(
					testConfig.twilio.accountSid,
					testConfig.twilio.authToken,
					testConfig.twilio.from,
				);

				expect(adapter.getName()).toBe("Twilio");
				expect(adapter.getType()).toBe("sms");
				expect(adapter.getMessageType()).toBe("SMS");
				expect(adapter.getMaxMessagesPerRequest()).toBe(1);
			} catch (error) {
				console.log("⏭️  Skipping Twilio tests:", (error as Error).message);
			}
		});

		test("should send SMS message", async () => {
			try {
				skipIfNoCredentials("twilio");

				const adapter = new Twilio(
					testConfig.twilio.accountSid,
					testConfig.twilio.authToken,
					testConfig.twilio.from,
				);

				const result = await adapter.send(testSMS);
				assertSuccessfulSendResult(result as any, 1);

				console.log("✅ Twilio SMS sent successfully");
			} catch (error) {
				const err = error as Error;
				if (err.message.includes("Skipping")) {
					console.log("⏭️  Skipping Twilio test");
				} else {
					console.error("❌ Twilio test failed:", err);
					throw error;
				}
			}
		});

		test("should send SMS with custom from number", async () => {
			try {
				skipIfNoCredentials("twilio");

				const adapter = new Twilio(
					testConfig.twilio.accountSid,
					testConfig.twilio.authToken,
				);

				const result = await adapter.send(testSMSWithFrom);
				assertSuccessfulSendResult(result as any, 1);

				console.log("✅ Twilio SMS with custom from sent successfully");
			} catch (error) {
				const err = error as Error;
				if (err.message.includes("Skipping")) {
					console.log("⏭️  Skipping Twilio custom from test");
				} else {
					console.error("❌ Twilio custom from test failed:", err);
					throw error;
				}
			}
		});
	});

	describe("Vonage Adapter", () => {
		test("should have correct adapter properties", () => {
			try {
				skipIfNoCredentials("vonage");

				const adapter = new Vonage(
					testConfig.vonage.apiKey,
					testConfig.vonage.apiSecret,
				);

				expect(adapter.getName()).toBe("Vonage");
				expect(adapter.getType()).toBe("sms");
				expect(adapter.getMessageType()).toBe("SMS");
				expect(adapter.getMaxMessagesPerRequest()).toBe(1000);
			} catch (error) {
				console.log("⏭️  Skipping Vonage tests:", (error as Error).message);
			}
		});

		test("should send SMS message", async () => {
			try {
				skipIfNoCredentials("vonage");

				const adapter = new Vonage(
					testConfig.vonage.apiKey,
					testConfig.vonage.apiSecret,
				);

				const sms = new SMSMessage({
					to: [testConfig.vonage.testPhoneNumber],
					content: `${testMessages.sms.content} - ${generateTestId()}`,
					from: testConfig.vonage.from,
				});

				const result = await adapter.send(sms);
				assertSuccessfulSendResult(result as any, 1);

				console.log("✅ Vonage SMS sent successfully");
			} catch (error) {
				const err = error as Error;
				if (err.message.includes("Skipping")) {
					console.log("⏭️  Skipping Vonage test");
				} else {
					console.error("❌ Vonage test failed:", err);
					throw error;
				}
			}
		});
	});

	describe("Msg91 Adapter", () => {
		test("should have correct adapter properties", () => {
			try {
				skipIfNoCredentials("msg91");

				const adapter = new Msg91(
					testConfig.msg91.senderId,
					testConfig.msg91.authKey,
					"template_id_123", // Template ID required for Msg91
				);

				expect(adapter.getName()).toBe("Msg91");
				expect(adapter.getType()).toBe("sms");
				expect(adapter.getMessageType()).toBe("SMS");
				expect(adapter.getMaxMessagesPerRequest()).toBe(100);
			} catch (error) {
				console.log("⏭️  Skipping Msg91 tests:", (error as Error).message);
			}
		});

		test("should send SMS message", async () => {
			try {
				skipIfNoCredentials("msg91");

				const adapter = new Msg91(
					testConfig.msg91.senderId,
					testConfig.msg91.authKey,
					"template_id_123", // Template ID required for Msg91
				);

				const sms = new SMSMessage({
					to: [testConfig.msg91.testPhoneNumber],
					content: `${testMessages.sms.content} - ${generateTestId()}`,
				});

				const result = await adapter.send(sms);
				assertSuccessfulSendResult(result as any, 1);

				console.log("✅ Msg91 SMS sent successfully");
			} catch (error) {
				const err = error as Error;
				if (err.message.includes("Skipping")) {
					console.log("⏭️  Skipping Msg91 test");
				} else {
					console.error("❌ Msg91 test failed:", err);
					throw error;
				}
			}
		});
	});

	describe("Telesign Adapter", () => {
		test("should have correct adapter properties", () => {
			try {
				skipIfNoCredentials("telesign");

				const adapter = new Telesign(
					testConfig.telesign.customerId,
					testConfig.telesign.apiKey,
				);

				expect(adapter.getName()).toBe("Telesign");
				expect(adapter.getType()).toBe("sms");
				expect(adapter.getMessageType()).toBe("SMS");
				expect(adapter.getMaxMessagesPerRequest()).toBe(1);
			} catch (error) {
				console.log("⏭️  Skipping Telesign tests:", (error as Error).message);
			}
		});

		test("should send SMS message", async () => {
			try {
				skipIfNoCredentials("telesign");

				const adapter = new Telesign(
					testConfig.telesign.customerId,
					testConfig.telesign.apiKey,
				);

				const sms = new SMSMessage({
					to: [testConfig.telesign.testPhoneNumber],
					content: `${testMessages.sms.content} - ${generateTestId()}`,
				});

				const result = await adapter.send(sms);
				assertSuccessfulSendResult(result as any, 1);

				console.log("✅ Telesign SMS sent successfully");
			} catch (error) {
				const err = error as Error;
				if (err.message.includes("Skipping")) {
					console.log("⏭️  Skipping Telesign test");
				} else {
					console.error("❌ Telesign test failed:", err);
					throw error;
				}
			}
		});
	});

	describe("TextMagic Adapter", () => {
		test("should have correct adapter properties", () => {
			try {
				skipIfNoCredentials("textmagic");

				const adapter = new TextMagic(
					testConfig.textmagic.username,
					testConfig.textmagic.apiKey,
				);

				expect(adapter.getName()).toBe("TextMagic");
				expect(adapter.getType()).toBe("sms");
				expect(adapter.getMessageType()).toBe("SMS");
				expect(adapter.getMaxMessagesPerRequest()).toBe(1000);
			} catch (error) {
				console.log("⏭️  Skipping TextMagic tests:", (error as Error).message);
			}
		});

		test("should send SMS message", async () => {
			try {
				skipIfNoCredentials("textmagic");

				const adapter = new TextMagic(
					testConfig.textmagic.username,
					testConfig.textmagic.apiKey,
				);

				const sms = new SMSMessage({
					to: [testConfig.textmagic.testPhoneNumber],
					content: `${testMessages.sms.content} - ${generateTestId()}`,
					from: testConfig.textmagic.from,
				});

				const result = await adapter.send(sms);
				assertSuccessfulSendResult(result as any, 1);

				console.log("✅ TextMagic SMS sent successfully");
			} catch (error) {
				const err = error as Error;
				if (err.message.includes("Skipping")) {
					console.log("⏭️  Skipping TextMagic test");
				} else {
					console.error("❌ TextMagic test failed:", err);
					throw error;
				}
			}
		});
	});

	describe("SMS Message Validation", () => {
		test("should validate phone number format", () => {
			expect(isValidPhoneNumber("+1234567890")).toBe(true);
			expect(isValidPhoneNumber("1234567890")).toBe(true);
			expect(isValidPhoneNumber("+44 20 7946 0958")).toBe(true);
			expect(isValidPhoneNumber("invalid-phone")).toBe(false);
			expect(isValidPhoneNumber("123")).toBe(false);
		});

		test("should create SMS with object constructor", () => {
			const sms = new SMSMessage({
				to: ["+1234567890"],
				content: "Test message",
				from: "+0987654321",
			});

			expect(sms.getTo()).toEqual(["+1234567890"]);
			expect(sms.getContent()).toBe("Test message");
			expect(sms.getFrom()).toBe("+0987654321");
		});

		test("should create SMS with array constructor", () => {
			const sms = new SMSMessage(
				["+1234567890"],
				"Test message",
				"+0987654321",
			);

			expect(sms.getTo()).toEqual(["+1234567890"]);
			expect(sms.getContent()).toBe("Test message");
			expect(sms.getFrom()).toBe("+0987654321");
		});

		test("should handle multiple recipients", () => {
			const sms = new SMSMessage({
				to: ["+1234567890", "+0987654321"],
				content: "Test message",
			});

			expect(sms.getTo()).toEqual(["+1234567890", "+0987654321"]);
			expect(sms.getContent()).toBe("Test message");
		});
	});
});
