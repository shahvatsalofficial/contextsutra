# Default policy (documented behavior)

Repository scan is opt-in and read-only. Excludes common credentials/hidden state and skips symlinks. Only a narrow set of Markdown docs and dependency manifest metadata are summarized. The server is local read-only. Source text is untrusted and model calls are not executed. Restrictions are enforced to the degree shown in `packages/core/guards.mjs`, not through a complete policy engine.
