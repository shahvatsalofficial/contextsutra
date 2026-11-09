# 11. FAQ and glossary

## FAQ

**Does it need an API key or internet?** No. It runs offline and never calls a model.

**Does it send my code anywhere?** No. It reads files you point it at and writes files you name. The optional server binds to loopback only.

**Is it safe to share a capsule?** It reduces risk but cannot promise safety. Read the report first; regex redaction is best effort.

**Does it work with Cursor, Claude Code, Codex, Gemini CLI and Copilot?** It writes skills to each tool's documented project directory and renders a Markdown hand-off any tool can read. Whether a given tool loads the skills has not been tested; the matrix says so.

**How is this different from an AGENTS.md or CLAUDE.md file?** Those are hand-written instructions. A capsule is generated from your repository, carries hashes and line references, can be checked for staleness, and separates observed facts from assumptions.

**Why not just paste the README?** You get no freshness check, no redaction, no quarantine of planted instructions and no record of what was shared.

**Can it read my AI chat history or IDE memory?** No, by design.

**Does it understand my code?** No. It captures documentation, decisions, tasks and manifest metadata. It does not parse source code bodies.

**Is the digest a signature?** No. It is a checksum. See [Security and legal](07-security-and-legal.md).

**Can I use it commercially?** Yes, under Apache-2.0. Keep the notices.

**Where is the proof it works?** [evidence/README.md](evidence/README.md) and the audit report.

## Glossary

| Term | Meaning |
|---|---|
| Capsule | JSON file of captured sources, hashes and metadata |
| Source | One captured document with a SHA-256 hash |
| Digest | SHA-256 of the canonical capsule; a checksum |
| Redaction | Replacing a secret-looking line with a placeholder |
| Quarantine | Withholding an instruction-like line; only its number is kept |
| Drift | Difference between capsule and repository now |
| Gate | The `review` verdict: `BLOCK` or `HUMAN_REVIEW_REQUIRED` |
| ADR | Architecture decision record |
| Host | The AI tool that will read the context |
| Skill | A `SKILL.md` instruction file for an AI assistant |
| Untrusted data | Text from the repository, treated as quotes, never as commands |
