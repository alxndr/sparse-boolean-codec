# sparse-boolean-codec

[![CI](https://github.com/alxndr/sparse-boolean-codec/actions/workflows/ci.yml/badge.svg)](https://github.com/alxndr/sparse-boolean-codec/actions/workflows/ci.yml)

Hand-rolled base-64-plus encoding for a boolean array, with run-length compression.

Interesting features:
* appending more `false`s to the end of the array doesn't change the encoded string
* tuned for longer sequences of `false`s
* *mostly* URL-friendly (see the "gotchas" section below)

Characters used: 0–9, a–z, A–Z, at-sign `@`, dollar-sign `$`, hyphen `-`, underscore `_`, colon `:`, period `.`, curly braces `{}` (70 characters total).

The core functionality was hand-written; Claude Code has been used to extract it to a dedicated NPM package (it originally lived in [this webapp](https://gitlab.com/alxndr/almost-dead-dot-net/)).


## usage

```ts
import {
  booleanArrayToEncodedAndCompressedString,
  compressedAndEncodedStringToBooleanArray,
} from 'sparse-boolean-codec'

const initialValues = [true, false, false, true, true, false, false, false]
const code = booleanArrayToEncodedAndCompressedString(initialValues)
// 'p'

compressedAndEncodedStringToBooleanArray(code)
// [true, false, false, true, true, false]
// note the trailing falses don't come back -- decoding only goes up to the
// last `true` (or `[]` if there were none). pad it yourself if you need a
// fixed length.

// six months later, three more shows have happened and you didn't go:
const later = [...initialValues, false, false, false]
booleanArrayToEncodedAndCompressedString(later)
// 'p' -- same as before
```


## why the growable prefix works

Some of the intermediate representations are backwards from the order of the input array on purpose.
The first boolean becomes the *last* bit of the binary string, not the first, so appending to the end of the array means tacking on high-order zero bits to the binary representation.
Leading zeroes above the highest set bit don't change a binary number's value, and the base-64 + compression passes preserve that:
`booleansToEncodedString` just strips the now-redundant trailing zero characters with a `.replace(/0+$/, '')`.
Decoding un-reverses everything back.

Doesn't hold for appending `true`, or for changing an existing value.


## how it works

Three passes for encoding (decoding does the same thing in reverse):

1. boolean array → binary string (`booleansToBinary`)
2. binary string → base-64 (`binaryToEncodedString` / `booleansToEncodedString`), chunked 6 bits at a time through a 64-character alphabet (`0-9a-zA-Z@$` -- ordinary base-64, just not the RFC 4648 alphabet)
3. run-length compression on the base-64 string (`compressEncodedString`):
   - two zeroes in a row → `-`
   - three zeroes in a row → `_` (zeroes get their own shortcuts because for this use case -- an ever-growing list where most entries are still `false` -- short runs of zero are by far the most common thing to compress)
   - exactly 3 of any digit `X` → `X:`
   - 4-63 of any digit `X` → `X.N` (`N` is the count, itself base-64'd)
   - 64+ of any digit `X` → `X{N}`

`expandCompression`, `encodedStringToBinary`, and `binaryToBooleanArray` undo steps 3, 2, and 1, in that order.

## API

The two you actually want:

- `booleanArrayToEncodedAndCompressedString(bools: boolean[]): string` — encode
- `compressedAndEncodedStringToBooleanArray(encoded: string): boolean[]` — decode

Everything else used internally is exported too, in case you want one layer without the others (`booleansToEncodedString`/`encodedStringToBooleanArray` for base-64 without compression, `booleansToBinary`/`binaryToBooleanArray` for the raw binary string, `compressEncodedString`/`expandCompression` for just the compression pass, `decimalToB64`/`b64ToDecimal` for the base-64 digit conversion on its own).
Check the JSDoc on each for specifics.


## gotchas

- **`expandCompression` doesn't validate its input.** It assumes whatever
  you feed it actually came out of `compressEncodedString`. Give it
  something malformed -- an unclosed `{`, a stray `.` with nothing before
  it, a double period -- and depending on exactly how it's malformed, you
  might get the input back unchanged, or a wrong-but-plausible-looking
  expansion, instead of an error. `b64ToDecimal` does throw on a single bad
  character, but that's the only validation anywhere in the decode path. If
  you're decoding something from outside your control (a URL param, say),
  wrap it in a `try`/`catch` and don't trust it just because nothing threw.
  Writing a real parser for the compression grammar would fix this, but I
  haven't done it -- this extraction is meant to match the behavior of the
  code that's actually running in production, not improve on it.
- **It's URL-friendly, not URL-safe.** `{` and `}` (the 64+-repeat marker)
  aren't in RFC 3986's unreserved or sub-delims sets. Browsers don't care
  and pass them through a query string unencoded just fine -- that's why
  this has worked fine so far -- but some chat apps stop auto-linkifying a
  URL right at an unexpected `{`, and some CDN/WAF rules flag raw `{}` as
  template-injection-ish and block the request. If you need it to survive
  that kind of thing, `encodeURIComponent()` it before putting it in a URL.
  Decoding doesn't need any change either way, since `URLSearchParams.get()`
  already decodes percent-encoding for you.


## development

```sh
npm install
npm run typecheck
npm test
npm run build
```

See [PUBLISHING.md](./PUBLISHING.md) for how releases go out, and
[CHANGELOG.md](./CHANGELOG.md) for what's changed between versions.


## license

MIT — see [LICENSE](./LICENSE).
