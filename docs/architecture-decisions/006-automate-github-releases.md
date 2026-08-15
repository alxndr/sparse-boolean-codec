# 006 — automate GitHub Release creation from CHANGELOG.md

**Date:** 2026-08-15

**Status:** Implemented


### Context

Pushing a `vX.Y.Z` tag has always triggered `publish.yml` (see [ADR 004](./004-trusted-publishing.md)), which publishes to npm -- but nothing has ever created a matching GitHub Release. Git tags and GitHub Releases are separate objects; three tags existed (`v1.0.0-alpha`, `v1.0.0`, `v2.0.0-alpha`) but the Releases page showed only one entry, a hand-written draft for `v1.0.0-alpha` that was started via the GitHub web UI at some point and never published.

Two questions needed answering:

* **Where do the release notes come from?** This repo already keeps a hand-curated, Keep-a-Changelog-format `CHANGELOG.md`, with `PUBLISHING.md` requiring it to be finished before every tag. The alternative -- `gh release create --generate-notes`, a commit-log summary since the last tag -- would be zero-maintenance but disconnected from that existing source of truth, and would read very differently (raw commit subjects vs. curated, user-facing prose).
* **Does the release publish immediately, or land as a draft for review?** Immediate publish matches how `npm publish` in the same job already works -- the tag push is already the "I'm sure" moment, per `PUBLISHING.md`'s existing warning about finishing everything *before* tagging. A draft would add a second manual step (remembering to go click "Publish") without a clear benefit, given the notes are mechanically derived from a file that's already been reviewed as part of finishing the CHANGELOG.

The three existing tags were also backfilled as part of this decision (published the orphaned `v1.0.0-alpha` draft with corrected notes matching the CHANGELOG format, created the two missing releases) rather than leaving a gap in the release history.


### Decision

`publish.yml` creates the GitHub Release in the same job as the npm publish, immediately after it succeeds. `scripts/changelog-section.mjs <version>` extracts that version's section body out of `CHANGELOG.md` (everything between its `## [X.Y.Z]` heading and the next one) and that becomes the release notes verbatim, via `gh release create --notes-file`. The script exits non-zero if a version has no matching CHANGELOG section, which fails the workflow rather than publishing an empty or wrong release.

The release is marked `--prerelease` or `--latest` using the same "does the version string contain a `-`" check `publish.yml` already used to pick the npm dist-tag, so the logic only needed writing once. Requires `contents: write` in the workflow's `permissions` block (previously `contents: read`), and uses `github.token` -- no new secret or credential.

Because the CHANGELOG section is now user-facing release-note copy, not just an internal log, `PUBLISHING.md` step 2 now says as much.
