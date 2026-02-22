// ============================================================
// Axon — R2 — Retry utility for fire-and-forget operations
//
// Retries a promise-returning function up to `maxRetries` times
// with exponential backoff. Designed for background persistence
// (review saves, FSRS state upserts) where silent failure is
// acceptable but we want at least a few attempts.
// ============================================================

import { logger } from '@/app/lib/logger';

interface RetryOptions {
  maxRetries?: number;
  baseDelayMs?: number;
  label?: string;
}

/**
 * Retry an async function with exponential backoff.
 * @returns The result of `fn`, or throws after all retries are exhausted.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const { maxRetries = 2, baseDelayMs = 500, label = 'operation' } = options;

  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries) {
        const delay = baseDelayMs * Math.pow(2, attempt);
        logger.warn(`[Retry] ${label} attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  logger.error(`[Retry] ${label} failed after ${maxRetries + 1} attempts`);
  throw lastError;
}
