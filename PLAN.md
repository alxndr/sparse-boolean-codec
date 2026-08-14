# PLAN: sparse-boolean-codec

## Origin

Extracted from `almost-dead-dot-net`'s `src/lib/helpers/encoding.ts` — a
hand-rolled base-64 encoding of a boolean array with a run-length-compression
pass on top, designed so a URL-safe encoded string doesn't change its prefix
when more `false` values are appended to the end of the boolean array (the
almost-dead-dot-net use case: tracking which shows a fan attended, where the
band keeps playing more shows over time).

Motivation for extracting: reuse potential outside almost-dead-dot-net, plus
a chance to document and (selectively) harden an implementation the author
wasn't fully confident in.

## Decisions made

- **New standalone repo**, not a subdirectory/workspace of almost-dead-dot-net.
- **Preserve current encode/decode/compression behavior exactly.** In
  particular, `expandCompression` does *not* validate malformed compressed
  input (see `src/index.ts` JSDoc on that function) — this is a known,
  deliberately-unfixed gap for this extraction. Only non-behavioral fixes
  were made: `b64ToDecimal`'s error message bug (see below) and removal of
  an unreachable debug `console.error`.
- **Package name:** `sparse-boolean-codec` (confirmed available on npm).
- **License:** MIT (confirmed with user).
- **Git history preserved.** Used `git filter-repo` (not `filter-branch`) on
  a disposable `--no-local` clone of almost-dead-dot-net, filtering to only
  `src/lib/helpers/encoding.ts` + `src/lib/helpers/encoding.spec.ts`, with
  `--path-rename` to `src/index.ts` + `src/index.spec.ts`. That filtered
  history (11 commits, `50f0c3d` "initial commit" through `ecf5039` "lint:
  fix how a warning is hidden") was grafted onto this repo's `main` branch
  by fetching the filtered clone as a temporary remote and
  `git checkout -B main history-import/main`. The extraction/adaptation
  work then continues as new commits on top of that imported history.
- **Publishing:** GitHub Actions + npm Trusted Publishing (OIDC), not local
  `npm publish` with a long-lived token. Reasoning: no token to store/leak,
  npm auto-attaches provenance, and publishes are tied to a specific
  CI-verified workflow run. Caveat researched and confirmed: npm requires a
  package to already exist on the registry before Trusted Publishing can be
  configured for it (unlike PyPI's "pending publisher" for brand-new
  projects) — so the *first* publish must be a manual, authenticated
  `npm publish` from a local machine; only subsequent publishes go through
  the CI/OIDC path.
- **CI:** run on every push to `main` and on every PR targeting `main`.

## Status

- [x] Repo scaffolded: `package.json`, TypeScript + `tsup` (build) +
      `vitest` (test) as devDependencies, `npm approve-scripts esbuild`
      done.
- [x] `src/index.ts` ported from `encoding.ts`, with `flipString` import
      replaced by an inlined `reverseString` (removes the dependency on
      almost-dead-dot-net's `./string` helper module), JSDoc added to every
      export, and the two non-behavioral fixes above.
- [x] Git history import (see "Decisions made" above) — done and merged in
      as commit `3abee29` on top of the imported history.
- [x] Ported `src/index.spec.ts`: import path fixed to `./index.js`
      (NodeNext moduleResolution requires the extension). All 37 tests
      (1 pre-existing `it.skip`) pass unchanged against the ported code.
- [x] `tsconfig.json` (NodeNext/ES2022, strict). Also added
      `tsconfig.build.json` (declaration-only build) after discovering
      tsup's bundled `rollup-plugin-dts` crashes under our TypeScript
      7.0.2 (`Cannot read properties of undefined (reading
      'useCaseSensitiveFileNames')`) — `npm run build` now runs
      `tsup` for JS output and a separate `tsc --project
      tsconfig.build.json` for `.d.ts` generation instead of tsup's
      `--dts` flag.
- [x] `README.md` — thorough documentation:
      - problem statement / use case
      - algorithm walkthrough (binary → base64 chunking → RLE compression),
        including *why* several steps reverse string order (the "growable
        prefix" property)
      - full API reference for every exported function
      - "Known limitations" section: malformed-compression-input gap (link to
        the JSDoc on `expandCompression`), and a **new finding to document**:
        `{` and `}` (used for ≥64-repetition compression) are outside the
        RFC 3986 unreserved/sub-delims character set, so this encoding is
        "URL-friendly" in practice (browsers tolerate literal `{`/`}` in query
        strings) rather than strictly URL-safe — a consumer who needs strict
        RFC 3986 compliance should `encodeURIComponent()` the output before
        embedding it in a URL. (almost-dead-dot-net's own call site does not
        currently do this — out of scope to fix there as part of this
        extraction, but worth flagging back to the user separately.)
- [x] `LICENSE` (MIT).
- [x] `.github/workflows/ci.yml`: on push to `main` + PRs targeting `main`,
      run typecheck + test + build on Node 24.
- [x] `.github/workflows/publish.yml`: triggered on tag push (`v*`), uses
      `id-token: write` permission, Node 24 (npm requires CLI ≥11.5.1 +
      Node ≥22.14.0 for OIDC trusted publishing), publishes with no
      token — provenance is automatic under Trusted Publishing. Exact
      YAML shape confirmed against npm's own docs
      (docs.npmjs.com/trusted-publishers). Also computes the npm dist-tag
      from the version string (anything with a `-` publishes under that
      prerelease identifier instead of `latest`), so a prerelease pushed
      through this workflow later can't accidentally become the default
      install target.
- [x] `PUBLISHING.md`: documents the normal release flow (`npm version` +
      push + tag push triggers CI), prereleases, and the one-time bootstrap
      below. Linked from the README's "development" section.
- [x] Create the GitHub repo. (User created it via the GitHub web UI —
      `git@github.com:alxndr/sparse-boolean-codec.git` — rather than `gh
      repo create`.) Remote added, `main` pushed, CI ran and passed on the
      push (run `31769347100`).
- [x] First publish was a **prerelease**, not `1.0.0`: `sparse-boolean-codec@1.0.0-alpha`
      is live on the registry. Gotcha found in the process: npm always
      tags the *very first* version ever published to a new package name
      as `latest`, regardless of `--tag` — there's no way to avoid this
      for a package's first release, prerelease or not. Right now `latest`
      and `alpha` both point at `1.0.0-alpha`; this resolves itself once a
      real `1.0.0` is published (see "Publish 1.0.0" below).
- [x] Consumed from `almost-dead-dot-net`: installed
      `sparse-boolean-codec@^1.0.0-alpha`, swapped the import in
      `src/routes/stats/+page.svelte`, and deleted the now-redundant
      `src/lib/helpers/encoding.ts` + `encoding.spec.ts` (their history
      lives on in this repo, and in almost-dead-dot-net's own git history
      if ever needed). Verified with more than just typecheck: the actual
      published package (not the local source) round-trips correctly via
      a direct `node -e` smoke test, and `cypress/e2e/stats-page.cy.ts`
      (14 tests, real browser, covers both the checkbox→`?code=` encode
      path and the `?code=`→table decode path) passes against a dev
      server running the swapped-in import. Committed in almost-dead-dot-net
      as `56b541f` (had to `--amend` once after a `git add` mistake staged
      only the file deletions on the first attempt — worth double-checking
      `git show --stat` after any multi-path `git add` that mixes deletions
      with modifications).
- [x] `CHANGELOG.md` (Keep a Changelog format) — done, committed as `12e149a`.
- [x] Extracted the "Decisions made" above into `docs/architecture-decisions/`
      (ADRs 000-004: the framework itself, standalone-repo/name/license,
      preserving extraction behavior, preserving git history, and Trusted
      Publishing). The "Decisions made" section above is now duplicated by
      those files; not yet trimmed down here.
      - [x] look into options to avoid documentation becoming stale, or to encourage
            an agent to run checks which enforce following decisions?
- [x] Configured Trusted Publishing for the package on npmjs.com: org/user
      `alxndr`, repo `sparse-boolean-codec`, workflow filename
      `publish.yml`, "Allow `npm publish`" (not stage-publish), Publishing
      access set to "Require two-factor authentication and disallow bypass
      2FA tokens" (npmjs.com's own UI confirms this is fully compatible
      with Trusted Publishing and is the more restrictive/recommended
      pairing).
- [x] Published `1.0.0` for real: `npm version 1.0.0` (amended into the
      release commit `b5bfbc9` once, after adding CHANGELOG.md's
      comparison links -- see below), tagged `v1.0.0`, pushed. `publish.yml`
      run `31782088760` succeeded via Trusted Publishing.
      `npm dist-tag ls sparse-boolean-codec` now shows `latest -> 1.0.0`,
      `alpha -> 1.0.0-alpha` -- the "latest stuck on the alpha" gotcha
      from the bootstrap is resolved.
- [x] Verified the CI publish path end-to-end via the `v1.0.0` tag push
      above -- real OIDC-authenticated publish, provenance signed and
      logged to Sigstore's transparency log, no local `npm publish`
      involved.
- [x] Tag hygiene, discovered along the way: the alpha never got a git tag
      at bootstrap time (it was published manually, off the normal
      `npm version` flow), and when tags were added after the fact by
      hand, two were created for the same release pointing at *different*
      commits (`1.0.0-alpha` at the correct commit `0feedc7`, `v1.0.0-alpha`
      at a later, wrong one, `d89eb2c` -- code was identical between them,
      only docs differed, but the tag should point at what was actually
      published). Cleaned up to a single `v1.0.0-alpha` -> `0feedc7`.
      Repeated the same mistake once more locally with `v1.0.0` itself
      (tagged before the CHANGELOG.md links were added) and caught it
      before pushing, by amending and re-tagging. Lesson for next time:
      finish *all* file changes for a release, including CHANGELOG.md,
      before running `git tag` -- don't tag until there's nothing left to
      amend in.
      Also worth remembering: `publish.yml` only triggers on tags matching
      `v*` -- a tag created without the `v` prefix (e.g. via GitHub's web
      UI, which doesn't enforce this) silently won't trigger a publish.

Next: gotcha-fixes (below), targeting `1.1.0` or `2.0.0`.

## Publish 1.0.0

Promote the alpha to a real release once we're satisfied it's solid:

1. `npm version 1.0.0` (or hand-edit `package.json` — either works since
   there's no prior non-prerelease version to increment from).
2. Push + push tags; `publish.yml` should publish it via Trusted Publishing
   this time, *if* the npmjs.com configuration step above has been done —
   otherwise this needs to fall back to a manual `npm publish` once more.
3. Confirm `npm dist-tag ls sparse-boolean-codec` shows `latest` -> `1.0.0`
   (not the alpha anymore).
4. This is also the point where `CHANGELOG.md` gets its first real entry.

## Gotcha-fixes (post-1.0.0)

Traced through what actually happens today for each of the malformed
inputs in `src/index.spec.ts`'s skipped `describe('with an invalid
compression')` block (`1.:4`, `2{3`, `5.6.7`, `8..9`, `.foo`, `bar;baz`,
`qux.`). Two distinct failure modes, only one of which is a real problem:

- **Most malformed input already throws, just from the wrong place.**
  `expandCompression`'s regex only matches a *complete* `:`/`.X`/`{X}`
  code; anything malformed fails to match and gets passed through
  unchanged. That leftover fragment almost always still contains a
  character outside the base-64 alphabet (`.`, `{`, `;`, ...), so
  `b64ToDecimal` throws a few frames later, inside
  `compressedAndEncodedStringToBooleanArray`. Annoying (confusing message,
  wrong stack location) but not unsafe.
- **The real gap: the compression grammar is more permissive than what
  the encoder ever emits, and that silently corrupts data.**
  `compressEncodedString` only ever emits `X:` for exactly 3 repeats,
  `X.N` for 4–63, `X{N}` for 64+ -- but `expandCompression` accepts `X.N`
  for *any* N, including 0-3. `5.6.7` demonstrates this concretely: it
  decodes (wrongly, but without throwing at that step) to `555555.7`
  before *that* eventually throws downstream on the stray `.`. Worse: a
  single flipped/corrupted character in an otherwise-valid encoded string
  can land on a count value the real encoder would never produce, and
  decode into a **different, well-formed, silently-wrong boolean array
  with no error raised anywhere.** That's the actual danger -- not the
  obviously-garbled inputs, but plausible-looking corruption.

Plan (all done, on `main`, not yet released):

1. [x] Rewrote `expandCompression` as a real left-to-right parser instead
   of "regex-match-or-pass-through": at each position, either consume a
   literal base-64 digit, the `-`/`_` shorthand, or a full `:`/`.X`/`{X+}`
   code.
2. [x] Throws a clear `Error` (from `expandCompression` itself, not
   downstream) for: an unclosed `{`, an empty `{}`, a `.` or `:` with no
   preceding valid digit, and a count character/sequence that isn't
   itself valid base-64. Unconsumed trailing junk can't happen by
   construction -- the parser always either advances or throws, there's
   no separate "leftover" state to check.
3. [x] Enforces the encoder's own invariants on count *values*: `.X` must
   decode to a count in 4-63, `{X}` must decode to a count >=64 (which,
   as a side effect, means *any* single-character brace count is now
   invalid, since one base-64 character maxes out at 63).
4. [x] Un-skipped the seven original test cases, added boundary tests
   (exactly 4, exactly 63, exactly 64) and out-of-range tests for both
   notations, and fixed the handful of existing tests that had been
   relying on the old leniency (`1.2`, and four of the six
   `expandCompression('X{n}')` "works with base-64 repetition" cases
   used single-character -- therefore always <64, therefore now invalid
   -- brace counts). 41 tests, 0 skipped, all passing.
5. [x] README's "gotchas" section rewritten to describe the new
   validation instead of the old gap. CHANGELOG.md has an `[Unreleased]`
   entry.
6. [ ] Version bump + release: open question below.

## Open questions / not yet confirmed with user

- Whether the gotcha-fixes version bump should be `minor` or `major`.
