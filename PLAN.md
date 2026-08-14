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
- [ ] Port `src/index.spec.ts`: still has the original `from './encoding'`
      import (needs to become `from './index'`) and otherwise needs the
      same read-through/adaptation `src/index.ts` got.
- [ ] `tsconfig.json`.
- [ ] `README.md` — thorough documentation:
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
- [ ] `LICENSE` (MIT).
- [ ] `.github/workflows/ci.yml`: on push to `main` + PRs targeting `main`,
      run typecheck + test (+ build, to catch build-only breakage) on
      Node 24.
- [ ] `.github/workflows/publish.yml`: triggered on tag push (`v*`), uses
      `id-token: write` permission, Node 24 (required by npm for OIDC
      trusted publishing), runs `npm publish` with no token — provenance is
      automatic under Trusted Publishing.
- [ ] Create the GitHub repo (`gh repo create alxndr/sparse-boolean-codec`),
      add the remote, push `main`.
- [ ] First manual publish: `npm login` (interactive, user must run this
      themselves) then `npm publish` (also user-run, or explicitly
      confirmed) to claim the package name and create v1.0.0 on the
      registry.
- [ ] Configure Trusted Publishing for the package on npmjs.com: org/user
      `alxndr`, repo `sparse-boolean-codec`, workflow filename
      `publish.yml`.
- [ ] Verify the CI publish path works (e.g. a follow-up tag push actually
      publishes via the workflow, not just locally).

## Open questions / not yet confirmed with user

- Exact publish trigger for `publish.yml` (tag push assumed; could instead
  use GitHub Releases as the trigger).
