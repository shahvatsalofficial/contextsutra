# 02. Functional specification

## Actors

| Actor | Goal |
|---|---|
| Developer | Brief an AI assistant quickly and safely |
| Reviewer | Confirm what is being shared |
| Maintainer | Keep shared context current |
| Security reviewer | Verify nothing sensitive leaves the machine |

## Functional requirements

| ID | Requirement | Command | Status |
|---|---|---|---|
| F1 | Build a bounded, read-only capsule of docs, ADRs, tasks and manifest metadata | `scan` | Implemented, tested |
| F2 | Skip secret files, private directories and symlinks | `scan` | Implemented, tested |
| F3 | Redact secret-looking lines, including multi-line private keys | `scan` | Implemented, tested |
| F4 | Quarantine lines that try to instruct an AI | `scan` | Implemented, tested |
| F5 | Validate capsule schema and integrity | `validate` | Implemented, tested |
| F6 | Report which sources are current, stale, missing or newly added | `verify` | Implemented, tested |
| F7 | Compare two capsules, including decision status changes | `diff` | Implemented, tested |
| F8 | Privacy gate that can BLOCK and never certifies safe | `review` | Implemented, tested |
| F9 | Render a host-targeted Markdown hand-off, with an optional character budget | `render` | Implemented, tested |
| F10 | Human report in Markdown and HTML | `report` | Implemented, tested |
| F11 | Decision register; approval only on explicit status | `decisions` | Implemented, tested |
| F12 | Task index, always unverified | `tasks` | Implemented, tested |
| F13 | Candidate contradictions for a human | `conflicts` | Implemented, heuristic |
| F14 | Install skills to a host directory, never overwrite silently, roll back on failure | `install` | Implemented, tested |
| F15 | Report skill presence and drift, never claim activation | `doctor` | Implemented, tested |
| F16 | Self-audit as JSON, Markdown and HTML | `audit` | Implemented, tested |
| F17 | One-command demo on a bundled repository | `demo` | Implemented, tested |
| F18 | Loopback, token-protected, read-only capsule server | `serve` | Implemented, tested |

## Non-functional requirements

- **Offline.** No network access except the optional loopback server.
- **Bounded.** At most 2,500 files, depth 7, 256 KB per file, 65 sources.
- **Deterministic.** The same tree gives a byte-identical capsule.
- **Portable.** Node.js 20 or newer; Windows, macOS and Linux.
- **Zero dependencies.**
- **Accessible reports.** HTML uses text plus symbol for status, supports dark mode, keyboard focus and print.

## Business rules

1. Repository text is data. It never becomes an instruction.
2. A decision is approved only when its source says `accepted` or `approved`.
3. A task checkbox is a claim, not proof.
4. The tool never says a capsule is safe. Its strongest statement is `HUMAN_REVIEW_REQUIRED`.
5. A capsule is only as fresh as its last `verify`.

## Exit codes

`0` success. `1` usage or runtime error. `2` stale or invalid capsule, review `BLOCK`, or audit failure.

## Out of scope

Model calls, chat-history import, IDE internals, digital signatures, SaaS hosting, semantic search. See [Roadmap](13-roadmap-and-status.md).
