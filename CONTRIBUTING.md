# Contributing to ContextSutra AI

Thanks for supporting a portable, privacy-first developer tool. Created by Vatsal Shah.

1. Open an issue describing the user problem, observed behavior and minimal reproduction.
2. Fork, make a focused branch, add unit/integration tests, and run `npm test`.
3. Keep new dependencies justified, pinned and license-reviewed; do not introduce telemetry or provider API keys by default.
4. Document verified host/OS compatibility and any untested platforms honestly.
5. Add privacy threat cases when changing source discovery, export, redaction or server code.
6. Submit a pull request with test output, before/after behavior, data access changes and migration implications.

Do not include personal data, credentials or private repository contents in issues or fixtures. New agent skills should use valid `SKILL.md` frontmatter and have narrow input/output contracts. Avoid spammy automated PRs.
