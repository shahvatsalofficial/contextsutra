# Host adapter contracts

Skill packaging and Markdown rendering are provided in v0.1.0. Host invocation adapters are **not yet implemented**. Add an adapter only with a documented host API and a test of actual activation/permissions. Never access private IDE credentials or scrape chat histories.

Future `HostAdapter` contract: `{ id, versionRange, skillPath, requiredPermissions, capabilities, install(), selfTest(), render(), status() }`.

The current installer copies canonical `SKILL.md` files into the project locations listed in `docs/IDE_COMPATIBILITY.md`. Its copy result does not prove runtime compatibility.
