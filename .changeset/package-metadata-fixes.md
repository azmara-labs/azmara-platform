---
"@azmr/cli": patch
"@azmr/core": patch
"@azmr/db": patch
"@azmr/security": patch
"@azmr/ui": patch
---

Fix package metadata: mojibake in the description field (encoding
mismatch, was showing garbled text on npm) and a missing LICENSE file
in the published tarball despite being listed in `files`.

`@azmr/ai` got the same fixes plus missing `homepage`/`repository`/
`author`/`keywords`, but isn't included in this changeset - it's on
changesets' ignore list and doesn't take version bumps this way.
