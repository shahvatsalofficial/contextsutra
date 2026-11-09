# Workflow: Safe Context Handoff

1. Consent and scope: confirm repository root and target IDE.
2. Scan: produce bounded local capsule with safe file discovery.
3. Privacy review: inspect source list, redaction notices, and export sensitivity.
4. Verification: integrity check and current source hashes.
5. Render: output Markdown with source provenance and untrusted-data boundary.
6. Transfer: manually paste or select context in a supported host (no undocumented API).
7. Follow-up: compare future versions using the capsule diff command.

Acceptance: no secrets in fixture output, no external AI calls, provenance survives handoff, host model inference remains host-owned.
