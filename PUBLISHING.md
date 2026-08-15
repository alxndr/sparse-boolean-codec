# publishing

Releases go out via GitHub Actions, using npm's Trusted Publishing (OIDC) -- see `.github/workflows/publish.yml`.
No npm token lives in this repo or on anyone's laptop; each publish is authenticated per CI run and tied to this exact repo + workflow file.

## normal release

1. Land your changes on `main` -- `.github/workflows/ci.yml` runs
   typecheck/test/build on every push and PR, so `main` should always be in
   a publishable state.
2. Move the `[Unreleased]` entries in `CHANGELOG.md` into a new
   `[X.Y.Z] - YYYY-MM-DD` section (leave `[Unreleased]` empty at the top
   for whatever comes next). **This section's body becomes the GitHub
   Release notes verbatim** (`scripts/changelog-section.mjs` extracts it in
   step 5 below) -- write it for that audience, not just as an internal
   log.
3. Bump the version and tag it in one step:
   ```sh
   npm version patch   # or: minor / major / prerelease --preid=alpha / 1.2.3
   ```
   This edits `package.json`'s `version`, commits it (`vX.Y.Z`), and creates
   a matching git tag -- all locally, nothing pushed yet.

   **A git tag is a fixed pointer to one commit -- it does not move if you
   later amend that commit.** So finish everything for the release (the
   `CHANGELOG.md` update from step 2 included) *before* running
   `npm version`/`git tag`, not after. If something does need fixing
   afterward and nothing's pushed yet: `git commit --amend`, then
   re-create the tag (`git tag -d vX.Y.Z && git tag vX.Y.Z`) so it points
   at the amended commit -- don't just amend and assume the tag followed
   along. Sanity check before pushing:
   ```sh
   git rev-parse HEAD vX.Y.Z   # these two SHAs must match
   ```
4. Push the commit and the tag:
   ```sh
   git push && git push --tags
   ```
   Always use the `v` prefix -- `publish.yml` only triggers on tags
   matching `v*`. A tag created without it (including via GitHub's web UI,
   which doesn't enforce the prefix) won't trigger a publish.
5. The `vX.Y.Z` tag push triggers `publish.yml`, which typechecks, tests,
   builds, publishes to npm, and creates the matching GitHub Release (title
   and tag both `vX.Y.Z`, notes pulled straight from that version's
   `CHANGELOG.md` section, marked prerelease/latest based on whether the
   version string has a `-` in it -- see [ADR 006](./docs/architecture-decisions/006-automate-github-releases.md))
   -- watch it at https://github.com/alxndr/sparse-boolean-codec/actions.
6. Confirm it's live: `npm view sparse-boolean-codec version`, or check
   https://www.npmjs.com/package/sparse-boolean-codec and
   https://github.com/alxndr/sparse-boolean-codec/releases.

## prerelease versions

So far (`1.0.0-alpha`), a single unnumbered prerelease per target version
has been enough: publish it, get it consumed/verified by a real
downstream project, then promote to the real release.

```sh
npm version X.Y.Z-alpha --no-git-tag-version   # hand-set the exact version
# ...finish CHANGELOG.md, commit everything together, then tag (see step 3 above)
git push && git push --tags
```

If a target version needs more than one round -- something's found wrong
with the first alpha and it needs a follow-up before promotion -- number
them instead of overwriting: `npm version prerelease --preid=alpha` bumps
`X.Y.Z-alpha.N` iteratively (`.0` -> `.1` -> ...) rather than hand-setting
the string each time.

`publish.yml` reads the dist-tag off the version string itself: anything
with a `-` in it (`1.0.0-alpha`, `2.0.0-alpha.1`, ...) publishes under
that prerelease identifier as the npm dist-tag (`alpha`, `rc`, ...)
instead of `latest`. So `npm install sparse-boolean-codec` still gets the
last non-prerelease version; only `npm install sparse-boolean-codec@alpha`
picks up a prerelease.

## one-time bootstrap (already done for this package)

npm's Trusted Publishing requires a package to already exist on the
registry before you can configure OIDC for it -- there's no PyPI-style
"pending publisher" for a brand-new name. So the very first version had to
be published manually, from a local, already-`npm login`'d machine:

```sh
npm publish --dry-run --tag alpha   # sanity-check the tarball contents first
npm publish --tag alpha
```

Then, on npmjs.com: package page → Settings → Trusted Publisher → Add a
GitHub Actions publisher, with:

- Organization or user: `alxndr`
- Repository: `sparse-boolean-codec`
- Workflow filename: `publish.yml`
- Environment name: (left blank -- not used)

After that, every release goes through the tag-push flow above; `npm
publish` shouldn't need to run from a laptop again.
