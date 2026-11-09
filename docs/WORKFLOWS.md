# Operational workflows

## First-time repository context
1. Obtain permission to inspect a specific repository.
2. Run `scan` locally into `.contextsutra/` (ignored in version control).
3. Review capsule JSON, redaction count and selected sources.
4. Run `verify` and check no source files are stale.
5. Render for target IDE and paste/select via that IDE's documented workflow.
6. Mark host model inference and actual adoption as separate from render success.

## New developer onboarding
1. Inspect only approved docs and manifests.
2. Review architecture/conventions with provenance.
3. Flag contradictory guidelines and unverified TODO items.
4. Create onboarding questions; never invent decisions.
5. Verify capsule against repository before sharing.

## Session handoff
1. Re-scan after the latest changes.
2. Use `diff` against an earlier capsule to identify changed source records.
3. Record only approved decisions and status in repository docs; do not scrape private chats.
4. Render a fresh capsule with clearly marked untrusted excerpts.

## Privacy review
1. Examine recorded sources and redaction counts.
2. Manually inspect output for personal data/secrets and sensitive architecture.
3. If risk is present, delete/withhold the capsule; adjust source scope and re-scan.
4. Require approval before sharing with third-party AI providers.

## Server share (local demo only)
1. Verify capsule and set a sufficiently long random bearer token as environment variable.
2. Bind on 127.0.0.1 and retrieve via `/capsule` with authorization.
3. Disable service after use; do not expose port to public networks.
