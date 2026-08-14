// A base-64 encoding of a boolean array, with a run-length-compression pass
// on top:
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
// guarantee, and known limitations (especially around malformed compressed
// input).

function reverseString(s: string): string {
  return s.split('').reverse().join('')
}

// NOTE:
// some intermediate representations are 'backwards' from the order of
// booleans... this allows more false values (i.e. bits that are still unset)
// to be appended to the end of the boolean array -- which becomes the
// *beginning* of the binary representation -- without modifying the encoded
// string. See the README section "why is everything reversed?" for the full
// explanation.

const ONE = '1'
const ZERO = '0'

/** Converts a boolean array to a binary-digit string, preserving order. */
export function booleansToBinary(bools: boolean[]): string {
  return bools.reduce((str, bool) => `${bool ? ONE : ZERO}${str}`, '')
}

/** Converts a binary-digit string back to a boolean array, preserving order. */
export function binaryToBooleanArray(binary: string): boolean[] {
  return binary.split('').map((val) => val === ONE)
}

const ENCODING_CHARS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ@$'
const ENCODING_BASE = ENCODING_CHARS.length
const ENCODING_CHUNK_SIZE = Math.ceil(Math.log2(ENCODING_BASE))
const ENCODING_CHARS_SPLIT = ENCODING_CHARS.split('')

/**
 * Converts a binary-digit string to a base-64 encoded string. Reverses
 * order (see the module-level NOTE above).
 */
export function binaryToEncodedString(binary: string): string {
  const zeroPadding = Array((ENCODING_CHUNK_SIZE - (binary.length % ENCODING_CHUNK_SIZE)) % ENCODING_CHUNK_SIZE)
    .fill(0)
    .join('')
  const binaryChunks: string[] = `${zeroPadding}${binary}`
    .split(new RegExp(`(.{${ENCODING_CHUNK_SIZE}})`))
    .filter((v) => v.length) // n.b. this reverses the representation... 0th element of `binary` is last char in `something`
  return binaryChunks.reduce((encoded: string, binaryChunk: string) => {
    const decimalValue: number = binaryChunk
      .split('')
      .reverse()
      .reduce((decValue, binaryChar, digitIndex) => {
        return decValue + (binaryChar === ONE ? Math.pow(2, digitIndex) : 0)
      }, 0)
    return `${encoded}${ENCODING_CHARS[decimalValue]}`
  }, '')
}

/**
 * Converts a boolean array directly to a base-64 encoded string (without the
 * run-length-compression pass). Trailing `false` values are dropped, since
 * they carry no information -- an absent index decodes back to `false`.
 */
export function booleansToEncodedString(bools: boolean[]): string {
  const binary: string = booleansToBinary(bools)
  const encoded: string = reverseString(binaryToEncodedString(binary))
  return encoded.replace(/0+$/, '')
}

/**
 * Converts a single base-64 character (or a multi-character base-64 string)
 * to its decimal value.
 *
 * @throws if a single character is not one of the 64 valid encoding
 * characters.
 */
export function b64ToDecimal(encodedLetter: string): number {
  if (encodedLetter.length === 1) {
    const value = ENCODING_CHARS_SPLIT.indexOf(encodedLetter)
    if (value === -1) // not in the list of acceptable chars
      throw new Error(`character is not valid in base-64 encoding: ${encodedLetter}`)
    return value
  }
  return encodedLetter
    .split('')
    .reverse()
    .reduce(
      (acc, elem, index) => acc + b64ToDecimal(elem) * ENCODING_BASE ** index,
      0)
}

function isEncodingChar(char: string | undefined): char is string {
  return char !== undefined && ENCODING_CHARS.includes(char)
}

/**
 * Expands a run-length-compressed encoded string back to its uncompressed
 * base-64 form. This is a real left-to-right parser: at each position it
 * either consumes a literal base-64 character, the `-`/`_` zero-shorthand,
 * or a full `:`/`.X`/`{X+}` repetition code.
 *
 * @throws if the input contains a character outside the base-64 alphabet
 * (other than the `-`/`_`/`:`/`.`/`{`/`}` compression syntax itself), an
 * unclosed `{`, a `.` or `:` with no preceding digit, a repetition count
 * that isn't itself valid base-64, or a repetition count outside the range
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

/** Converts a non-negative decimal integer to a base-64 string. */
export function decimalToB64(n: number): string {
  if (n < ENCODING_BASE)
    return ENCODING_CHARS[n]
  return `${decimalToB64(Math.floor(n / ENCODING_BASE))}${decimalToB64(n % ENCODING_BASE)}`
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

/** Converts an (uncompressed) base-64 encoded string back to a binary-digit string. */
export function encodedStringToBinary(encoded: string): string {
  return encoded.split('').reverse().reduce((acc, encodedLetter) => {
    const binaryRepresentation = reverseString(b64ToDecimal(encodedLetter).toString(2))
    const zeroPadding = Array(ENCODING_CHUNK_SIZE - binaryRepresentation.length).fill(0).join('')
    return `${binaryRepresentation}${zeroPadding}${acc}`
  }, '')
}

/** Converts an (uncompressed) base-64 encoded string back to a boolean array. */
export function encodedStringToBooleanArray(encoded: string): boolean[] {
  return binaryToBooleanArray(encodedStringToBinary(encoded))
}

/**
 * Decodes a run-length-compressed, base-64 encoded string (as produced by
 * {@link booleanArrayToEncodedAndCompressedString}) back to a boolean array.
 * This is the primary decode entry point.
 */
export function compressedAndEncodedStringToBooleanArray(encoded: string): boolean[] {
  const uncompressed = expandCompression(encoded)
  return encodedStringToBooleanArray(uncompressed)
}

/**
 * Encodes a boolean array to a run-length-compressed, base-64 encoded
 * string. This is the primary encode entry point.
 */
export function booleanArrayToEncodedAndCompressedString(bools: boolean[]): string {
  const encoded = booleansToEncodedString(bools)
  return compressEncodedString(encoded)
}
