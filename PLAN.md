# PLAN: sparse-boolean-codec

Working list of what's still in progress.
Durable project docs live elsewhere: README.md (usage/API/gotchas), PUBLISHING.md (release process), CHANGELOG.md (release history), and `docs/architecture-decisions/` (why things are the way they are).
Once nothing's left below, this file goes away.

- [x] Review docs/comments for accuracy against the current implementation.
- [x] Split `src/index.ts` into separate files along natural seams (`binary.ts`, `base64.ts`, `compression.ts`; `index.ts` re-exports the public API and defines the two primary encode/decode functions).
- [ ] publish `2.0.0-alpha`, then verify that it works with a partner project
- [ ] publish `2.0.0` once satisfied, following `PUBLISHING.md`
