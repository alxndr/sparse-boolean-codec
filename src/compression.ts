// The run-length-compression pass on top of the base-64 encoding:
// * A digit repeated exactly three times can be represented by a single
//   instance of the digit, followed by a colon.
// * A digit repeated more than three times and less than 64 times can be
//   represented by a single instance of the digit, followed by a period,
//   followed by the (base-64) digit representing the total count of the
//   repetition.
// * A digit repeated 64 or more times can be represented by a single instance
//   of the digit, followed by an open-brace `{`, followed by the (base-64)
//   digits representing the total count of the repetition, followed by a
//   close-brace `}`.
// * Two zeroes can be represented with a single hyphen `-` (no zeroes) and
//   three zeroes can be represented by a single underscore `_`. This prefix-
//   less compression applies to repeated zeroes only, because (in the
//   growable-boolean-array use case this package was built for) zeroes are
//   far more likely to be repeated than other digits.
//
// See the README for the full design rationale, the "growable prefix"
// guarantee, and remaining known limitations (see the "gotchas" section).

import {b64ToDecimal, decimalToB64, isEncodingChar} from './base64.js'

/**
 * Expands a run-length-compressed encoded string back to its uncompressed
 * base-64 form. This is a real left-to-right parser: at each position it
 * either consumes a literal base-64 character, the `-`/`_` zero-shorthand,
 * or a full `:`/`.X`/`{X+}` repetition code.
 *
 * @throws if the input contains a character outside the base-64 alphabet
 * (other than the `-`/`_`/`:`/`.`/`{`/`}` compression syntax itself), an
 * unclosed `{`, a `.` or `:` with no preceding digit, a repetition count
 * that's missing, empty, or isn't itself valid base-64, or a repetition
 * count outside the range
 * its notation is meant for (`.` covers 4-63, `{}` covers 64+ -- see the
 * module-level comment). This validates the *notation*; it can't detect a
 * syntactically-valid string that just happens to decode to something
 * other than what was originally encoded.
 */
export function expandCompression(encoded: string): string {
  let result = ''
  let index = 0

  while (index < encoded.length) {
    const char = encoded[index]

    if (char === '-') {
      result += '00'
      index += 1
      continue
    }
    if (char === '_') {
      result += '000'
      index += 1
      continue
    }
    if (!isEncodingChar(char))
      throw new Error(`invalid character at index ${index} in compressed string: ${JSON.stringify(char)}`)

    const next = encoded[index + 1]

    if (next === ':') {
      result += char.repeat(3)
      index += 2
      continue
    }

    if (next === '.') {
      const countChar = encoded[index + 2]
      if (!isEncodingChar(countChar))
        throw new Error(`missing or invalid repetition count after '.' at index ${index}`)
      const count = b64ToDecimal(countChar)
      if (count < 4 || count > 63)
        throw new Error(`'.' repetition count must be 4-63, got ${count} at index ${index}`)
      result += char.repeat(count)
      index += 3
      continue
    }

    if (next === '{') {
      const closeBraceIndex = encoded.indexOf('}', index + 2)
      if (closeBraceIndex === -1)
        throw new Error(`unclosed '{' at index ${index + 1}`)
      const countChars = encoded.slice(index + 2, closeBraceIndex)
      if (countChars.length === 0 || [...countChars].some((c) => !isEncodingChar(c)))
        throw new Error(`invalid repetition count in '{}' at index ${index}`)
      const count = b64ToDecimal(countChars)
      if (count < 64)
        throw new Error(`'{}' repetition count must be >= 64, got ${count} at index ${index}`)
      result += char.repeat(count)
      index = closeBraceIndex + 1
      continue
    }

    result += char
    index += 1
  }

  return result
}

const REGEX_REPEATED_DIGITS = /(?<digit>.)(?<repetition>\1{2,})/ // only bother compressing if there are >= 3 in a row
const REGEX_REPEATED_ZEROES = /(?<!0)(?<zeroes>0{2,3})(?!0)/ // zeroes can be compressed if there are only two repeated, because they are more common

/**
 * Applies the run-length-compression pass to an already base-64-encoded
 * string (see the module-level comment for the compression rules).
 */
export function compressEncodedString(encoded: string): string {
  const matchZeroesSpecialCase = REGEX_REPEATED_ZEROES.exec(encoded)
  if (matchZeroesSpecialCase?.groups) {
    const {index, groups} = matchZeroesSpecialCase
    const beforeZeroes = encoded.slice(0, index)
    const {zeroes} = groups
    const afterZeroes = encoded.slice(index + zeroes.length)
    return `${
      compressEncodedString(beforeZeroes)
    }${
      zeroes.length === 2
        ? '-'
        : '_'
    }${
      compressEncodedString(afterZeroes)
    }`
  }
  const match = REGEX_REPEATED_DIGITS.exec(encoded)
  if (!match?.groups)
    return encoded
  const {index, groups} = match
  const beforeRepetition = encoded.slice(0, index)
  const {digit, repetition} = groups
  const numberOfRepeatedCharacters = repetition.length + 1
  const afterRepetition = encoded.slice(index + numberOfRepeatedCharacters)
  if (numberOfRepeatedCharacters === 3)
    return `${beforeRepetition}${digit}:${compressEncodedString(afterRepetition)}`
  if (numberOfRepeatedCharacters < 64)
    return `${beforeRepetition}${digit}.${decimalToB64(numberOfRepeatedCharacters)}${compressEncodedString(afterRepetition)}`
  return `${beforeRepetition}${digit}{${decimalToB64(numberOfRepeatedCharacters)}}${compressEncodedString(afterRepetition)}`
}
