# Architecture and contracts

## Layers

1. **Discovery:** bounded walk of explicitly approved repository root; skip secret paths and symlinks.
2. **Normalization:** safe manifest metadata; selected project documents; source line references and hashes.
3. **Privacy filter:** line-level regex redaction; no private chats; no automatic remote transmission.
4. **Capsule:** versioned JSON with source digests, observed data, trust labels, integrity digest.
5. **Verification:** check full capsule digest then compare recorded source hashes; diff two capsules.
6. **Presentation:** create untrusted-data-marked Markdown that can be pasted into an AI IDE.
7. **Adapters:** copy canonical Agent Skills to documented project locations. Actual invocation stays with the host AI.
8. **Server:** optional localhost-only HTTP read endpoint requiring bearer authentication for `/capsule`.

## Important distinction
The core generates context **data**. It does not connect to proprietary IDE memory or AI model internals. The `render` command creates text; the `install` command copies skills. Neither operation guarantees IDE activation or accurate AI inference. All host claims must have executed test evidence.

## Capsule v1

See `schemas/capsule.schema.json`. Each source record includes path, SHA-256, file size, headings, short sanitized excerpts, possible task notes and redaction count. The `integrity.digest` is a self-consistency checksum, **not a signature**. A malicious editor can recompute it; trust requires independently verified provenance or signed artifacts (future).

## Proposed future architecture

- CLI/core/runtime in TypeScript with explicit plugin/adapter contracts.
- Local search: SQLite FTS5 + optional Tree-sitter and opt-in local embeddings.
- IDE adapters: each publishes a support level, tested version, required permissions, invocation path and known limitations.
- MCP/A2A integrations: schema-validated, permission-scoped, authenticated, sandboxed; external discovery must be opt-in.
- Enterprise server: isolated per-tenant encrypted context and evidence stores, OIDC/role policies, audit trail, retention/deletion and bounded workers.
- Conflict detector and relevance planner: deterministic findings first, AI suggestions second and always sourced.

## Data flow

`Approved root -> Allowlist discovery -> Manifest/doc extractors -> Privacy review -> Capsule(JSON) -> Verify/Diff -> Render -> Host IDE`.

Optional path: `Verified capsule -> Authorized localhost /capsule` (current); future `Verified capsule -> Authenticated enterprise API`.
