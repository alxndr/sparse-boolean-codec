# 002 — preserve encode/decode/compression behavior during extraction

**Date:** 2026-08-13

**Status:** Implemented


### Context

While reviewing `encoding.ts` for extraction, a real gap turned up: `expandCompression` doesn't validate malformed compressed input. Most malformed input happens to throw eventually anyway (from the wrong place, with a confusing message), but some inputs -- specifically, compression codes with a count value the encoder would never itself produce -- decode silently into a different, well-formed-looking, wrong result with no error raised anywhere. Full analysis in the "Gotcha-fixes" section of [PLAN.md, as recorded when this decision was made](https://github.com/alxndr/sparse-boolean-codec/blob/278799145aada218600834d34adc0a3b9d08b6a2/PLAN.md).

Two options once this was found:

* **Fix it as part of the extraction** -- ship a hardened `expandCompression` from the start.
* **Preserve current behavior, fix it later as a deliberate, separate change.**

The code being extracted is live in almost-dead-dot-net's production `stats` page. Changing decode behavior during the same change that also changes the file's location, module system, and build tooling would make it hard to tell, if something broke, whether the break came from the extraction itself or from the behavior change.


### Decision

Preserve current encode/decode/compression behavior during extraction. The only changes made were non-behavioral:

* `b64ToDecimal`'s invalid-character error message used to always report the literal value `-1` instead of the actual bad character -- fixed, since this only touched an error message string, not control flow.
* An unreachable debug `console.error` inside `expandCompression` was removed.

The malformed-input gap itself is documented (in the README's "gotchas" section and in JSDoc on `expandCompression`) rather than fixed, with a concrete plan for fixing it as a separate, later, deliberately-versioned change -- see the README for current status.
