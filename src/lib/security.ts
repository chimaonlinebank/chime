// Placeholder utilities for fintech compliance & security

/**
 * Input sanitization (basic XSS prevention)
 * In production, use a library like DOMPurify
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .trim();
}

/**
 * Rate limiting placeholder
 * In production, implement server-side rate limiting via API middleware
 */
const requestCounts = new Map<string, number[]>();

export function checkRateLimit(key: string, maxRequests = 10, windowMs = 60000): boolean {
  const now = Date.now();
  const requests = requestCounts.get(key) || [];

  // Clean old requests
  const filtered = requests.filter((time) => now - time < windowMs);
  if (filtered.length >= maxRequests) {
    return false; // Rate limited
  }

  filtered.push(now);
  requestCounts.set(key, filtered);
  return true;
}

/**
 * NOTE: CSRF protection is handled by server-side set-cookie with SameSite=Strict
 * Ensure all sensitive mutations use POST/PUT/DELETE with CORS restrictions
 */

/**
 * Content Security Policy (CSP) should be set via HTTP headers in production
 * Example header:
 * Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'
 */

let inMemoryToken: string | null = null;

/**
 * Secure token storage (in-memory only; use httpOnly cookies in production)
 */
export function secureStoreToken(token: string): void {
  inMemoryToken = token;
}

export function secureRetrieveToken(): string | null {
  return inMemoryToken;
}

export function secureClearToken(): void {
  inMemoryToken = null;
}
