# Threat model and controls

| Threat | Current defense | Residual risk |
|---|---|---|
| `.env` / secrets accidentally scanned | Skip sensitive names/dirs, selected doc extraction, regex sensitive-line redaction | Pattern misses, embedded secrets, PII, renamed secret files |
| Symlink traversal | Skip symlinks during scan and reject unsafe symlink files in freshness checks | Concurrent replacement / TOCTOU and OS-specific path behavior |
| Prompt injection in README/ADR | Source text marked as untrusted; quoted data in rendered context | An LLM might still follow malicious embedded content; test with adversarial fixtures |
| Stale decisions | SHA-256 recorded source contents and freshness checks | Unsampled source files and unknown external decisions |
| Fake evidence | Source IDs and explicit observed/unknown statuses | Capsule digest not a digital signature; provenance may be forged |
| Host adapter privilege | Copy skill instructions only; do not invoke IDE private APIs | Model permissions are owned by each host, not controlled by ContextSutra |
| Unauthenticated remote access | Server binds loopback and `/capsule` requires 16+ character bearer token | No TLS on loopback, no rotation/audit/rate limiting, not production-ready |
| Context overcollection | Bounded files/doc excerpts, excluded directories, no chat scraping | Users may still export more information than intended |
| Remote model data leakage | No remote model calls in core | User may paste capsule into external IDE/provider; inspect before doing so |

## Security improvement backlog
- Granular source allowlist, `.gitignore` semantics, policy config validation and taint tracking.
- Dedicated PII/secret scanner integrations (e.g. Gitleaks), adversarial prompt injection tests.
- Encrypted review queue and explicit sharing approvals.
- Signed capsule provenance; hash reproducibility and secure trust anchors.
- Independent audit of server identity, tokens, logs and backup strategy before remote deployments.

**Do not claim zero-risk security.** Redaction is a secondary mitigation, not permission to export sensitive inputs.
