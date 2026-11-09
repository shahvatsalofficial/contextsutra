# IDE compatibility and activation levels

Documented project skill locations (verify current host release before claiming interoperability):

| Host | Project skill directory | Starter support | Model inference |
|---|---|---|---|
| Claude Code | `.claude/skills/` | Portable SKILL.md copy + render, not host-tested | Uses the host's own authenticated AI session |
| Cursor | `.cursor/skills/` or `.agents/skills/` | Portable SKILL.md copy + render, not host-tested | Host-owned |
| OpenAI Codex | `.agents/skills/` | Portable SKILL.md copy + render, not host-tested | Host-owned |
| Gemini CLI | `.gemini/skills/` or `.agents/skills/` | Portable SKILL.md copy + render, not host-tested | Host-owned |
| GitHub Copilot | `.github/skills/` | Portable SKILL.md copy + render, not host-tested | Host-owned |
| Any other IDE | Generic manual Markdown import | Render only; no guaranteed activation | Host-owned |
| Local LLM / Ollama | Future inference adapter | No inference implementation | Local model/download required |
| Server / CI | Optional capsule HTTP read endpoint | Local-only authenticated read; no job orchestration | Optional APIs require compliant auth |

The installer copies files. `doctor` detects directories. Neither verifies host loading or tool access. Host compatibility claims require manual/automated integration tests that invoke the actual skill and inspect its output.

Official docs:
- Agent Skills: https://agentskills.io/specification
- Claude: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview
- Cursor: https://cursor.com/docs/skills
- Codex: https://learn.chatgpt.com/docs/build-skills
- Gemini CLI: https://geminicli.com/docs/cli/skills/
- VS Code/Copilot: https://code.visualstudio.com/docs/agent-customization/agent-skills
