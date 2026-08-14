# sparse-boolean-codec

## Purpose

A compact, URL-friendly encoding for a boolean array, with the guarantee that appending `false` values never changes the encoded prefix. Extracted from almost-dead-dot-net; general-purpose otherwise. See README.md for the full explanation and API.

## Architecture decisions

Non-obvious project decisions are recorded in `docs/architecture-decisions/` (ADRs) -- not just narrated here or in `PLAN.md`. Before changing something an ADR governs (publishing/CI setup, the compression grammar's behavior, the choice of standalone repo, etc.), check `docs/architecture-decisions/` first.

**Once an ADR's `Status` is `Implemented` and the file has been committed, never edit its Context or Decision text.** If a decision changes, write a new ADR and set the old one's `Status` to `Superseded by 00X` instead of rewriting it in place. See ADR 000 for the full rule and rationale.

If a change would invalidate an existing ADR, say so explicitly and propose a new superseding ADR -- don't just silently diverge from documented behavior.

## Other docs

- `PLAN.md` -- working status/task list, not a durable record; expect it to change and eventually shrink as things move into ADRs
- `PUBLISHING.md` -- release process -- follow these steps when publishing a new release
- `CHANGELOG.md` -- Keep a Changelog format
- `README.md` -- user-facing docs, including a "gotchas" section on known limitations (some deliberate, per ADR 002)

## Development

- TDD preferred: this is a small, thoroughly-tested package. New behavior should come with new/updated tests in `src/index.spec.ts` before or alongside the implementation, not after.
- `npm run typecheck && npm test && npm run build` should all pass before any commit that touches `src/`.
- The "growable prefix" property (appending `false`s never changes the encoded string) is the entire reason this package exists -- don't break it, and don't change what an existing encoded string decodes to, without a major version bump.
