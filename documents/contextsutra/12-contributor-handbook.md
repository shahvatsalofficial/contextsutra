# 12. Contributor handbook

## Setup

```bash
git clone https://github.com/shahvatsalofficial/contextsutra
cd contextsutra
npm test
```

Node.js 20 or newer. There is nothing to install.

## Layout

| Path | Contents |
|---|---|
| `packages/core` | Guards, capsule logic, analysis (pure where possible) |
| `packages/cli` | Argument parsing and I/O |
| `packages/reporters` | Theme, Markdown to HTML, report |
| `packages/audit` | Self-audit |
| `packages/server` | Loopback server |
| `skills/portable` | The 12 skills |
| `tests` | Node test files |
| `scripts` | `build-docs.mjs`, `build-evidence.mjs`, installers |
| `documents/contextsutra` | These docs; `html/` and `evidence/` are generated |

## Rules

1. **No dependencies.** If you think you need one, open an issue first.
2. **No network, no process spawning, no dynamic code** in `packages/`. The audit enforces this.
3. **Tests first for safety behaviour.** Add a failing test or audit row, then the fix.
4. **Honest claims.** Do not write guarantees, percentage-perfect claims or universal-support claims. Untested means untested.
5. **Never log or print secrets**, including test values; build fake secrets from parts.
6. **Docs are code.** After editing `documents/contextsutra/*.md`, run `npm run docs` and commit the HTML; CI checks it.

## Workflow

1. Branch from `main`.
2. Change code and tests.
3. `npm test && npm run audit && npm run docs`.
4. Open a pull request using the template. Describe risk and evidence.

## Adding a redaction or injection pattern

Add it to `guards.mjs`, add a positive row and a harmless row to `KNOWN` or `INJECT` in `audit.mjs`, and a unit test. A pattern with no false-positive row will be asked for one.

## Adding a command

Parse in `packages/cli/index.mjs`, keep the logic in `packages/core`, add it to the help text and the skill command allow-list in the audit (check K5), document it in the technical reference.

## Code of conduct and licensing

Be kind. See `CODE_OF_CONDUCT.md`. By contributing you agree your work is licensed under Apache-2.0.
