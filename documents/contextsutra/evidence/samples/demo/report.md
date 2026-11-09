# ContextSutra report — demo-repo

**Privacy gate: HUMAN_REVIEW_REQUIRED** · Freshness: **CURRENT** · Digest: `b795ca65097d4ca3…`

> All quoted text below comes from the scanned repository and is untrusted data. The integrity digest is a checksum, not a signature. Redaction is best effort and needs human review.

## Overview

| Item | Value |
|---|---|
| Tool | contextsutra 0.2.0 |
| Files seen (bounded) | 6 |
| Sources captured | 4 |
| Ignored entries | 0 |
| Symlinks skipped | 0 |
| Limit reached | false |
| Lines redacted | 0 |
| Lines quarantined (instruction-like) | 0 |
| External model calls | 0 |

## Repository atlas

- Top-level directories: `docs`, `src`
- Manifests: `package.json`
- Languages by extension: `.md` ×4, `.json` ×1, `.js` ×1
- Dependency names: `zod`
- Script names (never executed): `test`

## Sources

| Path | SHA-256 | Lines | Redacted | Quarantined |
|---|---|---|---|---|
| `AGENTS.md` | `1eb1b88bf01f…` | 5 | 0 | 0 |
| `README.md` | `9adbd1d05c1d…` | 18 | 0 | 0 |
| `TASKS.md` | `eb4e006da66f…` | 5 | 0 | 0 |
| `docs/adr/0001-local-storage.md` | `2699a087b069…` | 6 | 0 | 0 |

## Decisions

| Source | Declared status | Approved? | Needs attention |
|---|---|---|---|
| `docs/adr/0001-local-storage.md` | accepted | yes (explicit status) | no |

## Tasks (unverified)

| Source | Line | Done? | Note |
|---|---|---|---|
| `README.md` | 14 | open | `- [ ] Add source-backed error handling rules.` |
| `README.md` | 15 | open | `- [ ] Review default configuration values before deploying to a public environment.` |
| `TASKS.md` | 2 | open | `- [ ] Investigate a structured event log format.` |
| `TASKS.md` | 3 | open | `- [ ] Document API timeout handling.` |
| `TASKS.md` | 4 | claimed | `- [x] Adopt the initial ADR template.` |

## Possible conflicts

No conflicts detected by the heuristics. This does not prove there are none.

## Freshness

| Source | Status |
|---|---|
| `AGENTS.md` | CURRENT |
| `README.md` | CURRENT |
| `TASKS.md` | CURRENT |
| `docs/adr/0001-local-storage.md` | CURRENT |

## Privacy review checklist

- [ ] Open the capsule JSON and read every excerpt.
- [ ] Confirm no customer data, personal data or internal URLs appear.
- [ ] Confirm redaction counts match what you expect.
- [ ] Share only with tools and people you are authorised to share with.

_Regex redaction is best effort. This gate can block, but it never certifies a capsule as safe._
