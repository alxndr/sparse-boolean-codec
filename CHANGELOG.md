# changelog

All notable changes to this project are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/);
versioning follows [SemVer](https://semver.org/).

## [Unreleased]

## [1.0.0] - 2026-08-14

### Added

- Architecture Decision Records in `docs/architecture-decisions/`, and a
  `CLAUDE.md` tying them into how AI coding agents should work in this repo.

### Changed

- Promoted from `1.0.0-alpha` to a stable release. No functional code
  changes since the alpha -- this release exists to confirm the npm
  Trusted Publishing (OIDC) pipeline end to end and to give the package a
  stable, non-prerelease version other projects can depend on.

## [1.0.0-alpha] - 2026-08-14

### Added

- Initial extraction from [the original implementation](https://gitlab.com/alxndr/almost-dead-dot-net/-/blob/0a3715ac5a7c3c7df4a7b859911dc6a96a362690/src/lib/helpers/encoding.ts), with the original file's git history preserved via `git filter-repo`.
- Full API: `booleanArrayToEncodedAndCompressedString` / `compressedAndEncodedStringToBooleanArray` as the primary encode/decode pair, plus the individual boolean-array/binary/base-64/compression layer functions exported on their own.
- README, PUBLISHING.md, MIT license, GitHub Actions CI (typecheck/test/build on every push and PR), and a publish workflow using npm Trusted Publishing (OIDC).

### Fixed (vs. [the original implementation](https://gitlab.com/alxndr/almost-dead-dot-net/-/blob/0a3715ac5a7c3c7df4a7b859911dc6a96a362690/src/lib/helpers/encoding.ts))

- `b64ToDecimal`'s invalid-character error message used to always report the
  literal value `-1` instead of the actual bad character.
- Removed an unreachable debug `console.error` inside `expandCompression`.

### Known limitations

- `expandCompression` does not validate malformed compressed input -- see
  the README's "gotchas" section and `PLAN.md`'s "Gotcha-fixes" plan for
  what's coming here.
- The `{`/`}` compression markers are outside RFC 3986's
  unreserved/sub-delims character classes -- "URL-friendly," not strictly
  "URL-safe." Also documented in the README.

[Unreleased]: https://github.com/alxndr/sparse-boolean-codec/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/alxndr/sparse-boolean-codec/compare/v1.0.0-alpha...v1.0.0
[1.0.0-alpha]: https://github.com/alxndr/sparse-boolean-codec/releases/tag/v1.0.0-alpha
