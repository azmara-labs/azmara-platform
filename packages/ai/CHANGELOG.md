# Changelog

All notable changes to this project will be documented in this file.

## [0.1.0] - 2026-07-19
### Added
- Static source analysis (`analyzeSource`, `formatReport`) - severity-ranked
  findings for common risk patterns (unsafe file access, SQL string
  concatenation, etc.)
- `runSandbox` - unified sandbox entry point, tries isolated-vm first and
  falls back to Node's `vm` module when it's unavailable (no native build
  toolchain), instead of hard-failing
- HTTP model adapter (`createHttpAdapter`)

### Fixed
- `isolated-vm` moved to `optionalDependencies` - a failed native build no
  longer fails the whole package install
- Fixed missing README/LICENSE in the published package, and missing
  `homepage`/`repository`/`author`/`keywords` in package.json

## [0.0.1] - 2026-06-21
### Added
- Initial release of AI auto-fix system
- AI-powered code analysis running inside true V8 isolate sandbox via isolated-vm
- Secure code execution and analysis (not using deprecated vm2)
- Safe code transformation capabilities