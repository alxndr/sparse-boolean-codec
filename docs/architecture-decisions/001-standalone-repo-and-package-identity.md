# 001 — standalone repo, package name, and license

**Date:** 2026-08-13

**Status:** Implemented


### Context

The boolean-array codec originated as `src/lib/helpers/encoding.ts` inside almost-dead-dot-net, a SvelteKit fan site. It has no dependency on anything specific to that app -- no SvelteKit imports, no app-specific types -- beyond a single small string-reversal helper imported from a neighboring app helper file.

Two options for extracting it:

* **Subdirectory / npm workspace inside almost-dead-dot-net** -- simpler to set up, shares that repo's tooling (lint config, CI runner, etc.), but ties the package's lifecycle (versioning, issues, releases) to an unrelated fan site's repo, and makes it harder to reuse elsewhere or hand off independently.
* **New standalone repo** -- more setup (its own `package.json`, CI, publish pipeline), but a clean, independently versioned, independently publishable package with no coupling to the app it came from.

A package name needed to be available on the npm registry, and a license needed to be picked.


### Decision

Standalone repo, not a workspace/subdirectory. The codec is generic enough (any boolean array, not specific to concert attendance) that decoupling its lifecycle from almost-dead-dot-net outweighs the extra setup cost.

Package name: `sparse-boolean-codec` (confirmed available on the npm registry before committing to it).

License: MIT.
