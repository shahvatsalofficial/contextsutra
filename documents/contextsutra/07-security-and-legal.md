# 07. Security and legal

This page describes engineering controls. It is not legal advice and does not claim any compliance certification.

## Security boundaries

1. No private IDE memory scraping, no chat history, no cookies, no tokens.
2. Minimum data: only an approved root; documents on an allow-list; secret files and private directories skipped; symlinks never followed.
3. Repository text is untrusted data. It is quoted, never promoted to an instruction.
4. No hidden network calls, no telemetry, no model calls.
5. No execution of repository scripts. Script names are listed only.
6. Server is loopback-only, token-protected and read-only.

## Threat analysis (STRIDE summary)

| Threat | Example | Control | Evidence |
|---|---|---|---|
| Spoofing | Another web page calls the local server | Bearer token, Host header guard | Audit V2, V4 |
| Tampering | Capsule edited after review | Canonical SHA-256 digest; `validate` | Audit D3, D4 |
| Repudiation | Who shared what | Out of scope for the local tool; no audit log | Documented limit |
| Information disclosure | Secret in README ends up in a prompt | Redaction, file deny-list, review gate | Audit P1 to P6, G2 |
| Denial of service | Huge or deep tree | File, depth and size limits | Tests |
| Elevation | README tells the AI to exfiltrate | Quarantine, untrusted-data banner, skills forbid it | Audit I1 to I3 |
| Path traversal | `../` in a source path | `isSafeRel`, `safeFile` realpath check | Audit X1, X2 |
| Supply chain | Malicious dependency | Zero dependencies, no install scripts | Audit S4, S5 |
| Cross-site scripting | Hostile heading in the HTML report | Escaping, URL scheme filter | Audit S6, tests |

## Residual risks

- Regex redaction misses secrets that do not look like known patterns, and personal data of any kind.
- A prompt-injection phrase outside the pattern list passes through as quoted data; hosts must treat it as data.
- The digest is not a signature; an attacker with write access to both capsule and digest can forge a consistent pair.
- A capsule shows state at scan time; changes after that are invisible until `verify`.
- Self-audit runs in-process and is not independent.

## Responsible disclosure

Report vulnerabilities privately through GitHub security advisories on the repository. Do not include real secrets. See `SECURITY.md`.

## Licensing

- Project license: Apache-2.0 (`LICENSE`). Copyright Vatsal Shah. `NOTICE` carries attribution.
- Dependencies: none, so there are no third-party license obligations in the package. `THIRD_PARTY_NOTICES.md` records this.
- Third-party names (Claude Code, Cursor, Codex, Gemini CLI, Copilot) are used descriptively. No affiliation or endorsement is claimed.
- Name availability: the repository and npm package names were checked for availability at release time. No trademark search has been performed; do your own before commercial use.

## Privacy

The tool processes only local files you point it at and writes only where you tell it. It collects nothing and sends nothing. If you share a capsule, you are responsible for what it contains and for your own data-protection duties (GDPR, contracts, internal policy).

## What a reviewer should still do

Read the capsule. Run the audit. Check your own repository for personal data. Decide who may receive the file.
