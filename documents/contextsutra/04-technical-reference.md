# 04. Technical reference

## Install and run

```bash
npx contextsutra help
npm install -g contextsutra     # optional global install
```

Requires Node.js 20 or newer. No other dependency.

## Commands

| Command | Arguments | Output | Exit |
|---|---|---|---|
| `scan` | `--root <dir>` `[--out <file>]` | JSON summary; writes capsule (default `.contextsutra/capsule.json`) | 0 / 1 |
| `verify` | `--root <dir> --capsule <file>` | JSON freshness result | 0 current, 2 stale or invalid |
| `validate` | `--capsule <file>` | `{valid, errors}` | 0 / 2 |
| `diff` | `--old <file> --new <file>` | added, removed, changed, decisionStatusChanges | 0 |
| `review` | `--capsule <file>` | gate, counts, per-source list, checklist | 0 / 2 on BLOCK |
| `render` | `--capsule <file>` `[--host h]` `[--budget n]` `[--out f]` | Markdown hand-off | 0 / 1 |
| `report` | `--capsule <file>` `[--root dir]` `--out <dir>` | `report.md`, `report.html` | 0 / 1 |
| `decisions` | `--capsule <file>` | decision register JSON | 0 |
| `tasks` | `--capsule <file>` | unverified task list JSON | 0 |
| `conflicts` | `--capsule <file>` | candidate contradictions JSON | 0 |
| `install` | `--root <dir> --host h` `[--force]` | installed paths | 0 / 1 |
| `doctor` | `--root <dir>` | skill presence, drift, capsule status | 0 |
| `audit` | `[--out <dir>]` | verdict; writes `audit.json/.md/.html` | 0 pass / 2 fail |
| `demo` | `[--out <dir>]` | writes sample capsule, hand-off and report | 0 |
| `serve` | `--capsule <file> [--token-env VAR] [--port n]` | listens on loopback | runs |
| `version` | | version string | 0 |

Hosts for `render`: `generic`, `claude`, `cursor`, `codex`, `gemini`, `copilot`. Hosts for `install` use the same names.

## Skill directories used by `install`

| Host | Directory |
|---|---|
| claude | `.claude/skills` |
| cursor | `.cursor/skills` |
| codex, generic | `.agents/skills` |
| gemini | `.gemini/skills` |
| copilot | `.github/skills` |

## Capsule fields

| Field | Meaning |
|---|---|
| `schema` | `contextsutra.capsule.v1` |
| `tool` | `{name, version}` of the producer |
| `project` | name, manifests, languages by extension, package names, script names (never executed) |
| `scan` | file count, ignored entries, symlinks skipped, unreadable directories, `limitReached`, top directories |
| `sources[]` | per document: `path`, `sha256`, `bytes`, `lineCount`, `headings`, `excerpts`, `tasks`, `decisions`, `adrStatus`, `redactions`, `quarantinedLines`, `tooling.packageManagers`, `trust`, `extraction` |
| `privacy` | redacted and quarantined counts, scope, `externalModelCalls: 0` |
| `trust` | `sourceTextIsInstructions: false`, evidence level, `hostCompatibility: not-tested` |
| `integrity` | `{algorithm, canonicalization, digest, signed: false}` |

## Limits

`maxFiles` 2500, `maxDepth` 7, `maxFileBytes` 262144, `maxSources` 65. Per source: 8 excerpts, 15 tasks, 8 decision lines, 24 headings.

## Redaction patterns

AWS access keys, GitHub tokens, OpenAI-style keys, Stripe keys, Slack tokens, npm tokens, Google API keys, SendGrid keys, JWTs, URLs with embedded credentials, bearer tokens, `password`/`api_key`/`secret` assignments, and private key blocks (header, body and footer). The authoritative list is `SECRET_PATTERNS` in `packages/core/guards.mjs`. Patterns outside this list are not detected.

## Quarantine patterns

Phrases such as "ignore previous instructions", pseudo system tags, instructions to send credentials elsewhere, and `curl | sh`. See `INJECTION_PATTERNS`. A quarantined line is withheld from excerpts and tasks; only its line number is kept.

## Server API

| Request | Result |
|---|---|
| `GET /health` | `200 {"status":"ok"}` |
| `GET /capsule` + `Authorization: Bearer <token>` | `200` capsule JSON; `401` otherwise |
| Other methods | `405` |
| Foreign `Host` header | `403` |

Token must be 16 or more characters and is read from an environment variable, not an argument.

## Programmatic use

The modules in `packages/core` are ES modules with no side effects at import: `buildCapsule`, `validateCapsule`, `checkFreshness`, `compareCapsules`, `renderCapsule`, `decisions`, `tasks`, `conflicts`, `review`.
