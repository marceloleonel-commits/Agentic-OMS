## Vercel publication policy (`.vercelignore`)

This repo is linked to a Vercel project (`vertical-distributed-order-management-dom`) with **Password
Protection enabled**. What goes on the air is controlled by an allowlist in
[`.vercelignore`](.vercelignore). The first non-comment line is `/*`, which
ignores everything at the root; each `!path` block opts a file or folder
back in.

**Do not remove the `/*` line. Do not replace it with narrower patterns. Do
not add patterns that re-include the whole repo (`!*`, `!/`, `!**/*`).**

The only permitted changes are:

- Adding a `!path` block to publish a new subproject.
- Removing a `!path` block to take that subproject off the air.

**Ordering matters.** Inside a chained re-include block, the order of `!path`
and `path/*` lines is significant; do not reorder them. New blocks should be
appended at the end of the file under a comment header. Validate locally
with `git check-ignore --no-index -v <path>` before opening a PR.

Source of truth (English): [`AGENTS.md`](AGENTS.md). Companion docs:
[`.claude/vercelignore.md`](.claude/vercelignore.md),
[`.cursor/rules/vercelignore.mdc`](.cursor/rules/vercelignore.mdc).
