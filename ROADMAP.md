# Roadmap — evidence-based releases

## P0: Secure local foundation (starter)
- [x] Source inventory and allowed-doc context capsule
- [x] Limited regex secret redaction, excluded directories, symlink skipping
- [x] Source digest + integrity check + stale comparison
- [x] Host-specific Markdown render + portable skill file installer
- [x] Local-only token-protected read server (demonstration, not production)
- [x] Automated tests on development OS
- [ ] Independent red-team review of redaction rules and source discovery

## P1: Community MVP
- [ ] Full JSON Schema validation (current validation checks core fields/digest)
- [ ] Optional gitignore + user-controlled inclusion policies with no secret opt-out by default
- [ ] Weighted context selection and token budgeting with reproducible relevance scoring
- [ ] Source-backed ADR/decision chronology and task freshness
- [ ] One real IDE-native integration end-to-end, with recorded compatibility evidence
- [ ] Windows/macOS CI evidence and installer polish

## P2: Developer trust platform
- [ ] Signed/exportable context capsules, provenance chain, integrity trust anchors
- [ ] Privacy review UI and explicit sharing workflow
- [ ] Conflict detection among ADRs, instruction files and package conventions
- [ ] Local search index/opt-in embeddings; never default to hosted vector DB
- [ ] MCP tool with permission-scoped read operations and Inspector tests

## P3: Server / enterprise
- [ ] Authenticated API with users/roles, project isolation, audit logs, encryption, rate limits and resource budgets
- [ ] Secure cloud hosting reference with TLS, backups and tenant isolation
- [ ] Optional provider adapters (OpenAI, Anthropic, Gemini), with user-supplied compliant credentials
- [ ] Signed release, SBOM, dependency scans and observability

## P4: Ecosystem
- [ ] Compatibility certification matrix based on executed tests
- [ ] Contributor marketplace and reusable approved context transforms
- [ ] Integrate with ArchSutra, VigilSutra, RachnaSutra, PramanaSutra and EvalSutra as optional consumers
