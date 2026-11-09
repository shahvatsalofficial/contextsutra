# 14. Architecture decisions

Each record: context, decision, trade-offs, alternatives, status. All are **accepted** by the maintainer as of v0.2.0.

## ADR-1. Canonical capsule schema

**Context.** Context must move between tools and be checkable. **Decision.** One JSON schema, `contextsutra.capsule.v1`, with sorted-key canonical form and an additive-field policy. **Trade-offs.** Simple and diffable; larger than a bare summary. **Alternatives.** Free Markdown only (no verification); a database (not portable). 

## ADR-2. Local-first, no network

**Context.** Source repositories are sensitive. **Decision.** The CLI has no network code; the audit scans for it. **Trade-offs.** No cloud features; the user moves files themselves. **Alternatives.** Hosted indexing (rejected: trust and data residency).

## ADR-3. JavaScript on Node.js, zero dependencies

**Context.** Needs to run anywhere developers already have a toolchain. **Decision.** ES modules on Node 20+, standard library only. **Trade-offs.** No type checker at build time; JSDoc and tests carry the load. **Alternatives.** TypeScript (build step, dependencies), Python (second runtime for most users).

## ADR-4. Host adapters are file copies

**Context.** Host skill loading is undocumented or changing. **Decision.** `install` copies files to documented directories and `doctor` reports presence and drift only. **Trade-offs.** No activation guarantee. **Alternatives.** Reaching into IDE state (rejected: unsafe, unsupported).

## ADR-5. Trust labelling

**Context.** Repository text can contain planted instructions. **Decision.** Every source is `untrusted-source-text`; instruction-like lines are quarantined; renders open with a boundary banner. **Trade-offs.** Pattern list can miss phrasing. **Alternatives.** Model-based detection (needs a model call).

## ADR-6. Privacy by default

**Context.** Redaction can never be perfect. **Decision.** Allow-list documents, deny-list names, redact, then gate with a review that never says safe. **Trade-offs.** Some benign lines get redacted. **Alternatives.** Opt-in redaction (rejected).

## ADR-7. Checksum now, signatures later

**Context.** A self-contained digest is forgeable. **Decision.** Ship the digest, label `signed: false`, document the limit, plan Sigstore. **Trade-offs.** No proof of origin yet. **Alternatives.** Home-made signing (rejected).

## ADR-8. File-based storage; no index yet

**Context.** Fast start, no daemon. **Decision.** JSON files only. **Trade-offs.** No search over large repos. **Alternatives.** SQLite FTS5 (planned, opt-in).

## ADR-9. Server is loopback and read-only

**Context.** A demo endpoint must not become a production service by accident. **Decision.** Bind 127.0.0.1, bearer token, Host guard, GET only. **Trade-offs.** Not usable remotely. **Alternatives.** Hardened remote service (needs TLS, identity, audit logging; not built).
