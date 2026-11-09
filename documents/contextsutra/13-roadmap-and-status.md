# 13. Roadmap and status

## Implementation matrix (v0.2.0)

| Feature | Implemented | Tested | Where | Limitation |
|---|---|---|---|---|
| Scan to capsule | Yes | Yes | CI matrix | Documents and manifests only |
| Redaction | Yes | Yes | Audit P1 to P6 | Regex best effort |
| Injection quarantine | Yes | Yes | Audit I1 to I3 | Pattern list |
| Verify and diff | Yes | Yes | Audit F1 to F5 | Captured documents only |
| Review gate | Yes | Yes | Audit G1 to G4 | Cannot certify safe |
| Render with budget | Yes | Yes | Tests | Deterministic order, not semantic |
| Human reports (MD, HTML) | Yes | Yes | Evidence | |
| Decisions, tasks, conflicts | Yes | Yes | Tests | Conflicts are heuristic |
| Install, doctor | Yes | Yes | Tests | Activation untested |
| Self-audit (MD, HTML, JSON) | Yes | Yes | CI | In-process |
| Loopback server | Yes | Yes | Audit V1 to V5 | Not for production |
| Live host activation | No | No | | Needs host runs |
| Digital signatures | No | No | | Planned |
| SQLite search, embeddings | No | No | | Planned |
| MCP server | No | No | | Planned |
| Hosted multi-tenant service | No | No | | Out of scope |

## Next

1. Record real host activation runs for Claude Code and one other tool; update the compatibility matrix with versions and evidence.
2. Signed releases with npm provenance and Sigstore.
3. Source-code symbol map using a parser, opt-in.
4. Config file for custom include and exclude lists that can never override the secret deny-list.
5. MCP read-only tool exposing `verify` and `render`.
6. Independent third-party review of the redaction and quarantine lists.

## Deliberately not planned

Reading chat history or IDE internals. Automatic upload of context. Claims of compliance or perfect privacy.
