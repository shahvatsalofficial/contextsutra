# Security policy

## Reporting a vulnerability

Use GitHub **private vulnerability reporting**: repository → Security → Report a vulnerability. Do not open a public issue and never include real credentials or private files. Expect an acknowledgement within a reasonable time; this is a volunteer project with no service-level agreement.

## Supported versions

The latest published minor version receives fixes.

## What the tool does and does not guarantee

By default ContextSutra reads only an approved root, skips secret files, private directories and symlinks, makes no network calls and calls no model. Redaction is best effort and may miss secrets or personal data; a human must review a capsule before sharing it. The integrity digest is a checksum, not a signature. The `serve` command is a loopback demo endpoint, not a production service. See [documents/contextsutra/07-security-and-legal.md](documents/contextsutra/07-security-and-legal.md) and `docs/THREAT_MODEL.md`.

## In scope

Redaction or quarantine bypasses, path traversal, symlink escapes, installer overwrites, report HTML injection, server authentication bypass, and any outbound network behaviour.

## Out of scope

Behaviour of third-party IDEs, secrets formats not in the documented pattern list (report them as enhancement requests), and issues requiring an already-compromised machine.
