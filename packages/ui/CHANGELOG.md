# Changelog

## 0.1.0

### Minor Changes

- d70fccb: Upgrade workspace dependencies across the monorepo (pnpm 10 -> 11 tooling
  migration): React 18.3 -> 19.2 (`@azmr/ui`), Zod 3.24 -> 4.4 (`@azmr/security`),
  better-sqlite3 11.7 -> 12.11 (`@azmr/db`), plus vitest, tsup, and `@types/node`
  bumped to latest across all packages. `typescript` stays pinned at `^5.7.3`
  (TypeScript 7 currently breaks `tsup`'s `.d.ts` bundling via
  `rollup-plugin-dts`).

### Patch Changes

- 5bf56bb: Fix package metadata: mojibake in the description field (encoding
  mismatch, was showing garbled text on npm) and a missing LICENSE file
  in the published tarball despite being listed in `files`.

  `@azmr/ai` got the same fixes plus missing `homepage`/`repository`/
  `author`/`keywords`, but isn't included in this changeset - it's on
  changesets' ignore list and doesn't take version bumps this way.

- Updated dependencies [5bf56bb]
- Updated dependencies [d70fccb]
  - @azmr/core@0.0.2

All notable changes to this project will be documented in this file.

## [0.0.1] - 2026-06-21

### Added

- Initial release of React UI components wired to reactive Signals
- XSS-safe Grid component
- useSignal hook for automatic re-renders
- Zero boilerplate reactive UI development
