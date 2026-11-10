# Changelog

## 0.2.0 — 2026-11-10

### Added
- `review` privacy gate (BLOCK or HUMAN_REVIEW_REQUIRED, never "safe"), `report` (Markdown and HTML), `decisions`, `tasks`, `conflicts`, `audit` (JSON, Markdown, HTML), `demo`, `version`.
- `render --budget` with deterministic priority and an omission note.
- Prompt-injection quarantine: instruction-like repository lines are withheld and counted.
- More secret patterns (Stripe, npm, Google, SendGrid, URL credentials, bearer tokens) and block-level private key removal.
- `verify` now reports newly added documents; `diff` reports decision status changes.
- `doctor` reports installed skill count and drift per host.
- Server Host-header guard (DNS-rebinding), hash-based token compare, request timeouts.
- Documentation set in `documents/contextsutra/` (Markdown and HTML), evidence folder, compatibility matrix, `llms.txt`, `CITATION.cff`, `NOTICE`, `THIRD_PARTY_NOTICES.md`, `SUPPORT.md`.

### Changed
- **Skills rewritten.** The 12 skills were near-identical copies of one template and pointed at a repo-relative path. Each is now distinct, with eight required sections, and calls the published `npx contextsutra` commands.
- Digest uses canonical (sorted-key) JSON; capsules from 0.1.0 will not validate and must be rescanned.
- Package renamed to `contextsutra` and made publishable; CLI argument errors are explicit; install is transactional with rollback.
- CI matrix: Ubuntu and Windows × Node 20, 22, 24 plus macOS × Node 24, with audit and docs checks.

### Fixed
- Unreadable directories no longer crash a scan.
- Hostile headings are JSON-quoted in render and HTML-escaped in reports.

## 0.1.0 — Runnable development starter

- Offline scan, capsule, integrity validation, freshness checks, diff, render, local server, skills, installer, tests and CI.
