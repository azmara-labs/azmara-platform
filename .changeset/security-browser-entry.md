---
"@azmr/security": minor
---

Add a browser-safe entry point (`@azmr/security/browser`) exporting
`createRateLimiter`, `assertSafeIdentifier`, `sanitiseForLog`, `validate`,
and `validateEnv` - none of which touch Node.js built-ins. Fixes #10.

`assertSafePath` moved out of `sanitise.ts` into its own `path-safety.ts`
(it uses `node:path`, so it stays Node-only and isn't part of the browser
entry). `createJWT` is intentionally not included in the browser entry:
it uses `node:crypto`'s synchronous HMAC/timingSafeEqual APIs, which have
no browser equivalent - making it browser-safe would mean moving to the
async Web Crypto API, a breaking change to `sign()`/`verify()` that's out
of scope here and tracked separately.

Verified by actually building `apps/docs-next` (Next.js/Turbopack) with a
client component importing from `@azmr/security/browser` - confirms the
fix works against a real bundler, not just static analysis.
