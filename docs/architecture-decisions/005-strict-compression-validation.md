# 005 — validate repetition counts strictly rather than leniently

**Date:** 2026-08-14

**Status:** Implemented


### Context

`expandCompression` originally used a regex-based match-or-pass-through
approach that didn't validate its input at all (see ADR 002). Fixing that
meant choosing between two different designs for how strict the
replacement parser should be:

* **Lenient on repetition-count magnitude.** Reject only structurally
  malformed input (an unclosed `{`, a `.`/`:` with no preceding digit, a
  count character that isn't valid base-64) but accept any syntactically
  well-formed count -- e.g. `1.2` would still decode to `'11'`, even
  though `compressEncodedString` never emits period-notation for a count
  below 4. This follows Postel's Law ("be liberal in what you accept, be
  conservative in what you send"), a long-standing principle for robust
  protocol implementations.
* **Strict on repetition-count magnitude.** Additionally enforce the
  encoder's own invariants: a `.X` count must decode to 4-63, a `{X}`
  count must decode to >=64 -- exactly the ranges `compressEncodedString`
  itself ever produces. Anything outside those ranges throws, even if
  otherwise well-formed.

Postel's Law is best suited to independently-evolving implementations
negotiating interoperability -- e.g. two different vendors' HTTP servers
tolerating each other's minor deviations from spec. That's not this
situation: `compressEncodedString` and `expandCompression` are a single
owned encoder/decoder pair, maintained together, and the encoder never
produces a count outside its notation's canonical range. Any occurrence
of one is either adversarial input, corruption of a previously-valid
string (a single flipped character can land on an in-range-looking but
wrong count), or output from something that was never this package's
encoder in the first place. Accepting it leniently doesn't preserve
compatibility with anything -- it just produces a different, well-formed-
looking, silently wrong boolean array with no signal anything went
wrong, which is precisely the failure mode this validation work exists
to close (see the `expandCompression`/`compressedAndEncodedStringToBooleanArray`
entry in [CHANGELOG.md](../../CHANGELOG.md) for what shipped).

This tracks an argument made against Postel's Law generally: liberal
acceptance can mask corruption and erode error detection, and for a
protocol or format under active, single-owner maintenance, "virtuous
intolerance" -- generating a fatal error on anything outside spec -- is
the better default.

#### Links

* [commit cc8a9fb](https://github.com/alxndr/sparse-boolean-codec/commit/cc8a9fbd7010f6d6af1e0430f01b2193ad4cf546) -- the `expandCompression` rewrite this decision governs
* ["The Harmful Consequences of the Robustness Principle"](https://datatracker.ietf.org/doc/draft-iab-protocol-maintenance/00/) (IAB draft) -- the "virtuous intolerance" argument this decision follows


### Decision

`expandCompression` enforces the encoder's own range invariants as part
of validation, not just structural well-formedness: a `.X` repetition
count must decode to 4-63, a `{X}` repetition count must decode to >=64.
A count outside those ranges throws, even when the surrounding syntax is
otherwise well-formed (e.g. `expandCompression('1.2')` throws rather than
returning `'11'`).
