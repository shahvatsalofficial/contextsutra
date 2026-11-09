# ContextSutra self-audit report

**Verdict: PASS** — 47/47 checks passed, 0 failed.  
Tool: `contextsutra@0.2.0` · Node v24.15.0 · win32

> Self-audit of the ContextSutra package: redaction, injection quarantine, integrity, drift, server, supply chain, skills and legal files. It audits the tool, not your repository.

## Summary by category

| Category | Passed |
|---|---|
| Redaction accuracy | 6/6 |
| Prompt injection | 3/3 |
| Integrity | 6/6 |
| Freshness | 5/5 |
| Path safety | 2/2 |
| Review gate | 4/4 |
| Server | 5/5 |
| Supply chain | 6/6 |
| Skills | 5/5 |
| Legal | 5/5 |

## All checks

| ID | Category | Check | Expected | Observed | Result |
|---|---|---|---|---|---|
| P1 | Redaction accuracy | Known-answer table (21 lines) | 0 wrong | 0 wrong | PASS |
| P2 | Redaction accuracy | Missed secrets (false negatives) | 0 | 0 | PASS |
| P3 | Redaction accuracy | Wrongly redacted prose (false positives) | 0 | 0 | PASS |
| P4 | Redaction accuracy | Multi-line private key body is dropped, text after it kept | no key body, "After key text." kept | ok | PASS |
| P5 | Redaction accuracy | Secret files and private directories never enter a capsule | no marker, 1 file seen | clean, 1 file | PASS |
| P6 | Redaction accuracy | Sensitive file-name rules | all blocked | checked | PASS |
| I1 | Prompt injection | Injection-phrase table (5 lines) | 0 wrong | 0 | PASS |
| I2 | Prompt injection | Instruction-like repository line is quarantined, not rendered | absent from capsule and render; counted | absent, 1 quarantined | PASS |
| I3 | Prompt injection | Rendered context carries the untrusted-data boundary | SECURITY BOUNDARY present | present | PASS |
| D1 | Integrity | Two scans of the same tree are byte-identical | equal | equal | PASS |
| D2 | Integrity | Capsule validates | valid | valid | PASS |
| D3 | Integrity | Tampering with any field is detected | invalid | invalid | PASS |
| D4 | Integrity | Digest ignores JSON key order | equal | equal | PASS |
| D5 | Integrity | Integrity block states it is not a signature | signed:false | signed:false | PASS |
| D6 | Integrity | Malformed inputs are rejected without crashing | all invalid | all invalid | PASS |
| F1 | Freshness | Untouched tree is CURRENT | CURRENT | CURRENT | PASS |
| F2 | Freshness | Edited source is STALE | STALE | STALE | PASS |
| F3 | Freshness | Removed source is MISSING_OR_BLOCKED | MISSING_OR_BLOCKED | MISSING_OR_BLOCKED | PASS |
| F4 | Freshness | Newly added document is reported as drift | AGENTS.md listed | AGENTS.md | PASS |
| F5 | Freshness | diff reports added, removed and changed exactly | added AGENTS.md; removed TODO.md; changed README.md | added AGENTS.md; removed TODO.md; changed README.md | PASS |
| X1 | Path safety | Traversal and absolute paths are refused | all refused | checked | PASS |
| X2 | Path safety | Symlinked source is refused | blocked (or skipped where symlinks are not permitted) | skipped (symlink creation not permitted) | PASS |
| G1 | Review gate | Gate never certifies a capsule safe | HUMAN_REVIEW_REQUIRED or BLOCK | HUMAN_REVIEW_REQUIRED | PASS |
| G2 | Review gate | Residual secret in a capsule triggers BLOCK | BLOCK | BLOCK | PASS |
| G3 | Review gate | Conflicting package managers are surfaced for a human | package-manager conflict | package-manager | PASS |
| G4 | Review gate | Approval claimed only for explicit accepted status | only 0002 approved | 0002-y.md | PASS |
| V1 | Server | Binds to loopback only | 127.0.0.1 | 127.0.0.1 | PASS |
| V2 | Server | Capsule needs a bearer token | 401 without, 200 with | 401, 200 | PASS |
| V3 | Server | Non-GET methods are refused | 405 | 405 | PASS |
| V4 | Server | Foreign Host header is refused (DNS-rebinding guard) | 403 | 403 | PASS |
| V5 | Server | Short tokens are rejected at start-up | rejected | rejected | PASS |
| S1 | Supply chain | Secret scan over 106 text files (code only; docs and fixtures excluded) | 0 files | 0 | PASS |
| S2 | Supply chain | No outbound-network, process-spawn or dynamic-code APIs in 8 source files | 0 hits | 0 | PASS |
| S3 | Supply chain | Only the loopback server touches node:http; no client requests in product code | 0 client calls | 0 | PASS |
| S4 | Supply chain | Zero runtime dependencies | 0 | 0 | PASS |
| S5 | Supply chain | No install-time lifecycle scripts | 0 | 0 | PASS |
| S6 | Supply chain | HTML report escapes hostile repository text | no raw <img | escaped | PASS |
| K1 | Skills | Twelve specialist skills present | 12 | 12 | PASS |
| K2 | Skills | Valid frontmatter (name = folder, description present) | 0 invalid | 0 | PASS |
| K3 | Skills | Each skill has objective, trigger, procedure, prohibitions, contract, worked example, failure and fixture sections | 0 missing | 0 | PASS |
| K4 | Skills | Every skill has a distinct procedure (no copied template) | 12 distinct | 12 | PASS |
| K5 | Skills | Skills call only commands that exist, via the published `contextsutra` CLI | 0 bad | 0 | PASS |
| L1 | Legal | Apache-2.0 LICENSE text present | Apache License, Version 2.0 | yes | PASS |
| L2 | Legal | package.json license is Apache-2.0 | Apache-2.0 | Apache-2.0 | PASS |
| L3 | Legal | NOTICE and THIRD_PARTY_NOTICES present | both | true/true | PASS |
| L4 | Legal | SECURITY, CONTRIBUTING, CODE_OF_CONDUCT, CHANGELOG, SUPPORT present | all | checked | PASS |
| L5 | Legal | No forbidden marketing claims (guarantees, universal support, certification) | 0 files | 0 | PASS |

## Limits of this audit

- Runs in-process with the code it audits, so it is a regression and integrity check, not an independent third-party attestation.
- Known-answer tables are finite; they prove listed behaviours only. Regex redaction can miss secrets that look unlike the listed patterns.
- Does not test live IDEs or live models; host activation stays untested (see compatibility-matrix.json). Other operating systems are covered by CI, not by this run.
- Does not provide legal advice or any compliance certification.

## Reproduce

```bash
npx contextsutra audit --out audit
```
