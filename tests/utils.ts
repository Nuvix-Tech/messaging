/**
 * Test utilities for adapter testing
 */

import { expect } from 'bun:test';
import type { SendResult } from '../src/types';

/**
 * Common assertions for all adapter test results
 */
export function assertSuccessfulSendResult(result: SendResult, expectedRecipientCount: number) {
  expect(result).toBeDefined();
  expect(result.deliveredTo).toBe(expectedRecipientCount);
  expect(result.type).toBeDefined();
  expect(result.results).toBeDefined();
  expect(result.results.length).toBeGreaterThanOrEqual(expectedRecipientCount);
  
  // Check that all results have the required structure
  result.results.forEach(resultItem => {
    expect(resultItem).toBeDefined();
    expect(resultItem.recipient).toBeDefined();
    expect(resultItem.status).toBeDefined();
    expect(['success', 'failure']).toContain(resultItem.status);
  });
}

/**
 * Assert that the result indicates failure
 */
export function assertFailedSendResult(result: SendResult, expectedRecipientCount: number) {
  expect(result).toBeDefined();
  expect(result.deliveredTo).toBe(0);
  expect(result.type).toBeDefined();
  expect(result.results).toBeDefined();
  expect(result.results.length).toBeGreaterThanOrEqual(expectedRecipientCount);
  
  // Check that all results indicate failure
  result.results.forEach(resultItem => {
    expect(resultItem.status).toBe('failure');
    expect(resultItem.error).toBeDefined();
    expect(resultItem.error.length).toBeGreaterThan(0);
  });
}

/**
 * Create a mock HTTP response for testing
 */
export function createMockResponse(statusCode: number, response: any) {
  return {
    url: 'https://test.example.com',
    statusCode,
    response,
    error: null,
  };
}

/**
 * Create a mock error response for testing
 */
export function createMockErrorResponse(error: string) {
  return {
    url: 'https://test.example.com',
    statusCode: 0,
    response: null,
    error,
  };
}

/**
 * Validate email address format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format (basic check)
 */
export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ''));
}

/**
 * Generate a unique test identifier
 */
export function generateTestId(): string {
  return `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Sleep for testing async operations
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Mock adapter for testing base functionality
 */
export class MockAdapter {
  private responses: Map<string, any> = new Map();
  
  setMockResponse(url: string, response: any) {
    this.responses.set(url, response);
  }
  
  getMockResponse(url: string) {
    return this.responses.get(url);
  }
  
  clearMockResponses() {
    this.responses.clear();
  }
}
