# 003 — preserve git history through the extraction

**Date:** 2026-08-13

**Status:** Implemented


### Context

`encoding.ts` and `encoding.spec.ts` had a real commit history in almost-dead-dot-net going back to the original commit that introduced the encoding, through several rounds of feature work and bug fixes. Starting this repo with a single "initial commit" containing the ported files would discard that provenance.

Options considered:

* **Fresh repo, no imported history** -- simplest, but loses the record of how the encoding evolved (e.g. the compression scheme was added well after the base-64 encoding itself, in a separate round of commits).
* **`git filter-branch`** -- the traditional tool for this, but git's own documentation discourages it in favor of `git filter-repo`, citing performance and correctness issues.
* **`git filter-repo`** -- the actively maintained, git-project-recommended replacement for `filter-branch`, with built-in support for filtering to specific paths and renaming them.


### Decision

Use `git filter-repo` on a disposable `--no-local` clone of almost-dead-dot-net, filtered to only `src/lib/helpers/encoding.ts` and `src/lib/helpers/encoding.spec.ts`, with `--path-rename` to `src/index.ts` and `src/index.spec.ts` to match this repo's intended layout. That produced a clean, filtered history (11 commits, from the original "initial commit" through the last commit that touched either file).

That filtered history was grafted onto this repo's `main` branch by fetching the filtered clone as a temporary git remote and running `git checkout -B main history-import/main`. All subsequent extraction/adaptation work continues as new commits on top of that imported history, rather than a separate, disconnected commit graph.

`git filter-repo` requires a genuinely fresh clone to run against (`--no-local` matters for a same-machine clone, otherwise it refuses to run) -- it's designed to be pointed at a disposable copy of a repo, not run in place against a repo anyone is actively working in.
