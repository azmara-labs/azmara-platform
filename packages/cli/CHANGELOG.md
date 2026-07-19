# @azmr/cli

## 0.1.1

### Patch Changes

- d70fccb: Upgrade workspace dependencies across the monorepo (pnpm 10 -> 11 tooling
  migration): React 18.3 -> 19.2 (`@azmr/ui`), Zod 3.24 -> 4.4 (`@azmr/security`),
  better-sqlite3 11.7 -> 12.11 (`@azmr/db`), plus vitest, tsup, and `@types/node`
  bumped to latest across all packages. `typescript` stays pinned at `^5.7.3`
  (TypeScript 7 currently breaks `tsup`'s `.d.ts` bundling via
  `rollup-plugin-dts`).
- Updated dependencies [d70fccb]
- Updated dependencies [8b4512b]
  - @azmr/security@0.2.0
  - @azmr/db@0.2.0
  - @azmr/core@0.0.2

## 0.1.0

### Minor Changes

- 0a51a60: Phase 3 security hardening

  - `@azmr/security`: add `createRateLimiter` — sliding-window in-memory rate limiter with per-key tracking
  - `@azmr/security`: add `createJWT` — HMAC-SHA256 JWT using Node built-in crypto, timing-safe verification, 15-min default expiry
  - `@azmr/db`: add `createColumnEncryption` — AES-256-GCM column-level encryption with scrypt key derivation and GCM auth tag tamper detection
  - `@azmr/cli`: add `audit:verify` command — recomputes SHA-256 hashes and validates prevHash chain integrity of audit log files

### Patch Changes

- Updated dependencies [0a51a60]
  - @azmr/security@0.1.0
  - @azmr/db@0.1.0
