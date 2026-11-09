# Optional tools, plugins and MCP integrations

No third-party tools are mandatory for the v0.1.0 offline CLI. Before installing plugins globally, Claude should inventory existing tools, verify origin/licensing, inspect requested permissions and ask for approval.

| Tool | Priority | Value | Requirement / caveat |
|---|---|---|---|
| ripgrep | P1 | Fast local source searching | Opt-in, respect allowlists and ignored files |
| Tree-sitter | P1 | Language-aware source maps | Select maintained parser packages |
| SQLite FTS5 | P1 | Offline full text index | Encrypt or avoid indexing confidential text |
| Gitleaks | P1 | Sensitive material detection | Offline rules must not replace review |
| JSON Schema + Ajv | P1 | Capsule contract validation | Pin dependency and test unknown fields |
| MCP Inspector | P2 | Validate MCP tool protocols | Use isolated mock endpoints |
| OpenTelemetry | P2 | Optional tracing of local/server jobs | Disable remote export by default |
| Ollama / llama.cpp | P2 | Optional no-cloud-key local AI reasoning | User must install a model/runtime; quality varies |
| Context7 (if available) | Optional | Live library documentation | Requires network/connector and permission |
| Serena (if available) | Optional | Semantic repository navigation | Review permissions and supported runtime |
| Vitest / fast-check | Optional | Property-based and unit testing | Node built-in test runner is already functional |
| Docker / Dev Containers | P2 | Isolated fixtures/benchmark execution | Optional, needs host permission |
| GitHub Actions | P0 | Multi-OS test automation | Included, run on actual GitHub CI to verify |
| OSV-Scanner / Scorecard / Cosign | P2 | Supply chain and provenance | Add after pinned dependency review |
| GitHub MCP/connector | Optional | Issues/PR context for authorized repo | Authentication and scoping required |

Avoid: silently installing global plugins; using private IDE session data; relying on undocumented SDK hooks; shipping shared cloud API keys; sending context remotely without explicit confirmation.
