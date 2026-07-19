---
"@azmr/ai": patch
"@azmr/cli": patch
"@azmr/core": patch
"@azmr/db": patch
"@azmr/security": patch
"@azmr/ui": patch
---

Fix package metadata: mojibake in the description field (encoding
mismatch, was showing garbled text on npm), missing LICENSE file in
the published tarball despite being listed in `files`, and `@azmr/ai`
missing `homepage`/`repository`/`author`/`keywords` entirely.
