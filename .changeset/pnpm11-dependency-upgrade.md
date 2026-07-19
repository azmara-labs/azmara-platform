---
"@azmr/ui": minor
"@azmr/security": minor
"@azmr/db": minor
"@azmr/core": patch
"@azmr/query": patch
"@azmr/cli": patch
"@azmr/docs-next": patch
---

Upgrade workspace dependencies across the monorepo (pnpm 10 -> 11 tooling
migration): React 18.3 -> 19.2 (`@azmr/ui`), Zod 3.24 -> 4.4 (`@azmr/security`),
better-sqlite3 11.7 -> 12.11 (`@azmr/db`), plus vitest, tsup, and `@types/node`
bumped to latest across all packages. `typescript` stays pinned at `^5.7.3`
(TypeScript 7 currently breaks `tsup`'s `.d.ts` bundling via
`rollup-plugin-dts`).
