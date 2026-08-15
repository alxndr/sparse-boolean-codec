import {ONE, booleansToBinary, binaryToBooleanArray} from './binary.js'

function reverseString(s: string): string {
  return s.split('').reverse().join('')
}

const ENCODING_CHARS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ@$'
const ENCODING_BASE = ENCODING_CHARS.length
const ENCODING_CHUNK_SIZE = Math.ceil(Math.log2(ENCODING_BASE))
const ENCODING_CHARS_SPLIT = ENCODING_CHARS.split('')

/**
 * Converts a binary-digit string to a base-64 encoded string. Reverses
 * order (see binary.ts's module-level NOTE for why).
 */
export function binaryToEncodedString(binary: string): string {
  const zeroPadding = Array((ENCODING_CHUNK_SIZE - (binary.length % ENCODING_CHUNK_SIZE)) % ENCODING_CHUNK_SIZE)
    .fill(0)
    .join('')
  const binaryChunks: string[] = `${zeroPadding}${binary}`
    .split(new RegExp(`(.{${ENCODING_CHUNK_SIZE}})`))
    .filter((v) => v.length) // n.b. this reverses the representation... 0th element of `binary` is last char in `encoded`
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

/** Whether `char` is one of the 64 valid base-64 encoding characters. Used
 * internally by the compression layer's parser; not part of the public API. */
export function isEncodingChar(char: string | undefined): char is string {
  return char !== undefined && ENCODING_CHARS.includes(char)
}

/** Converts a non-negative decimal integer to a base-64 string. */
export function decimalToB64(n: number): string {
  if (n < ENCODING_BASE)
    return ENCODING_CHARS[n]
  return `${decimalToB64(Math.floor(n / ENCODING_BASE))}${decimalToB64(n % ENCODING_BASE)}`
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
