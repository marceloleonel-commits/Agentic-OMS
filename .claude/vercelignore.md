# Policy: `.vercelignore` (wildcard + allowlist)

This repository is linked to a Vercel project with Password Protection. The
publishable surface is controlled by `.vercelignore` at the repo root.

## File shape

```
/*
!path-to-publish-1
!path-to-publish-2
```

`/*` ignores everything at the root. Each `!path` block opts a file or
folder back in. Nested paths require chained re-includes of each
intermediate directory.

## Rules for Claude (and any agent)

- **Do not remove the `/*` line.** It exists to prevent the entire repo from
  being served as a static site (which would leak source code, agent
  prompts in `.claude/`, configuration files, internal docs).
- **Do not replace `/*` with narrower patterns** (e.g. `/docs/`, `*.md`).
- **Do not add patterns that open the whole repo** (e.g. `!*`, `!/`,
  `!**/*`).

## What you can change

- Add a `!path` block to publish a new subproject. Ask the user which
  subproject this is for before editing.
- Remove a `!path` block to take that path off the air.

**Ordering is significant.** Do not reorder lines inside a chained
re-include block; the order of `!path` and `path/*` lines matters. New
blocks should be appended at the end of the file under a comment header.

## Nested paths

`.vercelignore` follows `.gitignore` semantics, so a single `!a/b/c/d` line
will not work if `a`, `a/b`, or `a/b/c` are still ignored by an earlier
rule. You must re-include each intermediate directory.

Template for `modules/X/Y/prototype/`:

```
!modules
modules/*
!modules/X
modules/X/*
!modules/X/Y
modules/X/Y/*
!modules/X/Y/prototype
!modules/X/Y/prototype/**
```

If the same intermediate directories are already unblocked earlier in the
file, reuse them; do not duplicate. Always add a comment header naming the
prototype being added.

## Workflow

1. Read `.vercelignore`. Confirm `/*` is the first non-comment line.
2. Apply only the requested change (one `!path` block to add or remove).
3. Validate with `git check-ignore --no-index -v <path>` after temporarily
   swapping `.vercelignore` into `.gitignore`.
4. In the commit / PR, name which subproject is being added or removed.

See also: `AGENTS.md`, `CLAUDE.md`, `.cursor/rules/vercelignore.mdc`.
