/**
 * Browser-safe entry point — no Node.js built-ins.
 *
 * createJWT is deliberately NOT re-exported here: it uses node:crypto's
 * synchronous HMAC/timingSafeEqual APIs, which have no browser equivalent.
 * A browser-safe version would need to move to the async Web Crypto API
 * (crypto.subtle), which changes sign()/verify() from sync to async - a
 * breaking change to the existing API, not something to do silently as
 * part of splitting entry points. Track separately if client-side JWT
 * verification is actually needed.
 *
 * createAuditLogger is excluded for the same reason as always - it uses
 * node:fs/node:path/node:crypto to write to disk.
 */
export type { RateLimiter, RateLimitOptions, RateLimitResult } from "./rateLimit.js";
export { createRateLimiter } from "./rateLimit.js";
export { assertSafeIdentifier, sanitiseForLog } from "./sanitise.js";
export { validate, validateEnv, z } from "./validate.js";
