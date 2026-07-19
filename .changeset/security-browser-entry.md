---
"@azmr/security": minor
---

Add a browser-safe entry point (`@azmr/security/browser`) exporting
`createRateLimiter`, `assertSafeIdentifier`, `sanitiseForLog`, and
`validate` - none of which touch Node.js built-ins. Fixes #10.

Two functions moved into their own files, both for the same reason: a
Node-only export sharing a file with browser-safe exports drags the
Node dependency into any browser bundle re-exporting from that file,
regardless of which specific export is actually used.
- `assertSafePath` (uses `node:path`) moved out of `sanitise.ts` into
  `path-safety.ts`
- `validateEnv` (reads `process.env`) moved out of `validate.ts` into
  `validate-env.ts` - this one is a Node *global* reference rather than
  an `import`, so it doesn't fail the bundler build the way a missing
  module specifier does, it throws `ReferenceError` only if actually
  called client-side. Excluded from the browser entry; its own doc
  comment already describes it as a server-startup guard.

`createJWT` is also not included in the browser entry: it uses
`node:crypto`'s synchronous HMAC/timingSafeEqual APIs, which have no
browser equivalent - making it browser-safe would mean moving to the
async Web Crypto API, a breaking change to `sign()`/`verify()` that's
out of scope here.

Verified two ways: `browser.test.ts` recursively walks the browser
entry's full transitive import graph (not just direct re-exports) and
asserts no file in it contains a Node builtin import (with or without
the `node:` prefix) or references a Node global (`process`, `Buffer`,
`__dirname`, `__filename`) - this is the regression guard for the
`validateEnv` class of bug, which a plain import-statement check can't
catch. Also manually built `apps/docs-next` (Next.js/Turbopack) with a
client component actually calling `createRateLimiter`/`validate` from
`@azmr/security/browser`, confirming the fix against a real bundler.
