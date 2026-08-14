# publishing

Releases go out via GitHub Actions, using npm's Trusted Publishing (OIDC) --
see `.github/workflows/publish.yml`. No npm token lives in this repo or on
anyone's laptop; each publish is authenticated per CI run and tied to this
exact repo + workflow file.

## normal release

1. Land your changes on `main` -- `.github/workflows/ci.yml` runs
   typecheck/test/build on every push and PR, so `main` should always be in
   a publishable state.
2. Bump the version and tag it in one step:
   ```sh
   npm version patch   # or: minor / major / prerelease --preid=alpha / 1.2.3
   ```
   This edits `package.json`'s `version`, commits it (`vX.Y.Z`), and creates
   a matching git tag -- all locally, nothing pushed yet.
3. Push the commit and the tag:
   ```sh
   git push && git push --tags
   ```
4. The `vX.Y.Z` tag push triggers `publish.yml`, which typechecks, tests,
   builds, and publishes -- watch it at
   https://github.com/alxndr/sparse-boolean-codec/actions.
5. Confirm it's live: `npm view sparse-boolean-codec version`, or check
   https://www.npmjs.com/package/sparse-boolean-codec.

## prerelease versions

```sh
npm version prerelease --preid=alpha   # 1.0.0-alpha.0 -> 1.0.0-alpha.1
git push && git push --tags
```

`publish.yml` reads the dist-tag off the version string itself: anything
with a `-` in it (`1.0.0-alpha.0`, `2.0.0-rc.1`, ...) publishes under that
prerelease identifier as the npm dist-tag (`alpha`, `rc`, ...) instead of
`latest`. So `npm install sparse-boolean-codec` still gets the last
non-prerelease version; only `npm install sparse-boolean-codec@alpha` picks
up a prerelease.

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
