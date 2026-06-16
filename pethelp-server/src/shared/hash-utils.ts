import * as crypto from 'crypto';

/**
 * Create a normalized SHA256 hash of a query string.
 * Used for caching AI consultation results.
 */
export function sha256Normalize(text: string): string {
  const normalized = text
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
  return crypto.createHash('sha256').update(normalized).digest('hex');
}
