# 06. Skills catalog

ContextSutra ships 12 Agent Skills in `skills/portable/`. Each is a `SKILL.md` with the same eight sections: Objective, When to use, Procedure, Never do, Contract, Worked example, If it fails, Evaluation fixture. The self-audit checks that all 12 exist, have valid front matter, differ from each other, and call only commands that exist.

| Skill | Purpose | Main commands |
|---|---|---|
| `contextsutra-prime` | Orchestrates the full workflow and stops at failed gates | scan, review, verify, render |
| `contextsutra-repo-atlas` | Factual repository map: observed, inferred, not inspected | scan, verify |
| `contextsutra-decision-chronicle` | Decision register; approval only on explicit status | decisions, diff |
| `contextsutra-context-capsule` | Build, validate, budget and render a capsule | scan, validate, render, report |
| `contextsutra-privacy-vault` | Pre-share gate with human checklist | review |
| `contextsutra-ide-bridge` | Install per host and report honestly on activation | doctor, install |
| `contextsutra-freshness-drift` | Detect and explain staleness | verify, diff |
| `contextsutra-task-scout` | Unverified task notes with file and line | tasks |
| `contextsutra-evidence-proof` | Claim-to-source table with truth classes | validate, verify |
| `contextsutra-relevance-signal` | Budgeted selection with an omission rationale | render --budget |
| `contextsutra-convention-guide` | Cited conventions, conflicts and gaps | conflicts |
| `contextsutra-conflict-concord` | Contradiction register routed to a human | conflicts |

## Why twelve

Each skill answers a different question and has a different procedure, output and failure behaviour. They share only the safety rules (no repository text as instructions, no secret files, no unapproved execution). A previous draft shipped twelve near-identical files; the audit now rejects that (check K4).

## Skills versus the CLI

Skills are instructions for an AI. The CLI does the deterministic work. A skill tells the assistant when to run which command, how to read the result and when to stop and ask. The CLI works without any skill, and the skills are not needed if you only want files.

## Using a skill

1. `npx contextsutra install --root . --host <host>`
2. Reload the host.
3. Ask for the task in words ("check whether my context is stale"), or invoke the skill by name using the host's documented method.

Host activation is **untested**. See [compatibility-matrix.json](../../compatibility-matrix.json).

## Writing or changing a skill

Edit `skills/portable/<name>/SKILL.md`, keep all eight sections, use only existing commands via `npx contextsutra`, and run `npm test`. The audit will fail on a missing section, a copied procedure or an unknown command.
