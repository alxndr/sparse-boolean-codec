# 004 — publish via GitHub Actions and npm Trusted Publishing (OIDC)

**Date:** 2026-08-13

**Status:** Implemented


### Context

The package needed a release path to the npm registry. The traditional CI approach is a long-lived npm access token stored as a CI secret, used by a workflow step to run `npm publish`.

Options considered:

* **Local `npm publish` from a developer machine** -- no CI integration at all, publishes happen manually whenever someone runs the command.
* **CI publish with a stored npm token** -- automated, but the token is a standing credential: if it leaks (compromised CI runner, misconfigured log output, a dependency in the build with a supply-chain compromise, etc.) it can publish under this package's name until someone notices and revokes it.
* **npm Trusted Publishing (OIDC)** -- GitHub Actions exchanges a short-lived OIDC token for npm publish authorization, scoped to a specific repo + workflow file, with no persisted secret anywhere. npm also attaches provenance automatically.

A real constraint surfaced during research: npm requires a package to already exist on the registry before Trusted Publishing can be configured for it. There's no equivalent to PyPI's "pending publisher" for a brand-new package name. So the very first release has to be a manual, locally-authenticated `npm publish`, regardless of which publishing strategy gets used afterward.

Given that bootstrap constraint, publishing `1.0.0` as the very first release felt presumptuous for a pipeline that hadn't been proven end-to-end yet.


### Decision

Publish via GitHub Actions, using npm Trusted Publishing (OIDC), triggered on `v*` tag pushes (`.github/workflows/publish.yml`). No npm token lives in this repo or on any developer machine for routine releases.

The first release, `1.0.0-alpha`, was published manually (`npm publish --tag alpha`) to bootstrap the package's existence on the registry, satisfying the constraint above and giving a low-stakes way to validate consumption from almost-dead-dot-net before committing to a `1.0.0`. `publish.yml` computes its npm dist-tag from the version string itself -- any version containing a `-` publishes under that prerelease identifier instead of `latest`, so a prerelease pushed through the automated path later can't become the default install target by accident.

On npmjs.com, the package's Trusted Publisher is scoped to this exact repo and workflow filename, with `npm publish` allowed and 2FA required with bypass-2FA tokens disallowed for any publish that doesn't go through that OIDC path -- npm's own guidance is that this stricter token setting is fully compatible with, and recommended alongside, Trusted Publishing.
