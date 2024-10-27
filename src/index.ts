// This is a base-64 encoding, with some extras for further compression:
// * A digit repeated exactly three times can be represented by a single
//   instance of the digit, followed by a colon.
// * A digit repeated more than three times and less than 64 times can be
//   represented by a single instance of the digit, followed by a pipe,
//   followed by the (base-64) digit representing the total count of the
//   repetition.
// * A digit repeated 64 or more times can be represented by a single instance
//   of the digit, followed by an open-brace `{`, followed by the (base-64)
//   digits representing the total count of the repetition, followed by a
//   close-brace `}`.
// * Two zeroes can be represented with a single hyphen `-` (no zeroes) and
//   three zeroes can be represented by a single underscore `_`. This prefix-
//   less compression applies to repeated zeroes only, because (in this very
//   specific use-case) they are more likely to be repeated than other digits.

import {flipString} from './string'

// NOTE:
// some intermediate representations are 'backwards' from the order of booleans...
// this allows more zero-values (i.e. un-attended shows) to be added (to the
// end of the boolean array === the beginning of the binary representation)
// without modifying the encoded string.

const ONE = '1'
const ZERO = '0'

export function booleansToBinary(bools:boolean[]):string { // preserves ordering
  return bools.reduce((str, bool) => `${bool ? ONE : ZERO}${str}`, '')
}

export function binaryToBooleanArray(binary:string):boolean[] { // preserves ordering
  return binary.split('').map((val) => val === ONE, [])
}

const ENCODING_CHARS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ@$'
const ENCODING_BASE = ENCODING_CHARS.length
const ENCODING_CHUNK_SIZE = Math.ceil(Math.log2(ENCODING_BASE))
const ENCODING_CHARS_SPLIT = ENCODING_CHARS.split('')

export function binaryToEncodedString(binary:string):string { // reverses order
  const zeroPadding = Array((ENCODING_CHUNK_SIZE - (binary.length % ENCODING_CHUNK_SIZE)) % ENCODING_CHUNK_SIZE)
    .fill(0)
    .join('')
  const binaryChunks:string[] = `${zeroPadding}${binary}`
    .split(new RegExp(`(.{${ENCODING_CHUNK_SIZE}})`))
    .filter(v => v.length) // n.b. this reverses the representation... 0th element of `binary` is last char in `something`
  return binaryChunks.reduce((encoded:string, binaryChunk:string) => {
    const decimalValue:number = binaryChunk.split('').reverse().reduce((decValue, binaryChar, digitIndex) => {
      return decValue + (binaryChar === ONE ? Math.pow(2, digitIndex) : 0)
    }, 0)
    return `${encoded}${ENCODING_CHARS[decimalValue]}`
  }, '')
}

export function booleansToEncodedString(bools:boolean[]):string {
  const binary:string = booleansToBinary(bools)
  const encoded:string = flipString(binaryToEncodedString(binary))
  return encoded.replace(/0+$/, '')
}

export function b64ToDecimal(encodedLetter:string):number {
  if (encodedLetter.length === 1) {
    const value = ENCODING_CHARS_SPLIT.indexOf(encodedLetter)
    if (value === -1) // not in the list of acceptable chars
      throw new Error(`character is not valid in base-64 encoding: ${value}`)
    return value
  }
  return encodedLetter
    .split('')
    .reverse()
    .reduce(
      (acc, elem, index) => acc + b64ToDecimal(elem) * ENCODING_BASE ** index,
      0)
}

const REGEX_ENCODED_COMPRESSION = /(?<digit>[0-9a-z@$])(?<count>:|\|[0-9a-z@$]|\{[0-9a-z@$]+\})/i

export function expandCompression(encoded:string):string {
  if (encoded.includes('-')) {
    const hyphenPosition = encoded.indexOf('-')
    const beforeHyphen = encoded.slice(0, hyphenPosition)
    const afterHyphen = encoded.slice(hyphenPosition + 1)
    return expandCompression(`${beforeHyphen}00${afterHyphen}`)
  }
  if (encoded.includes('_')) {
    const underscorePosition = encoded.indexOf('_')
    const beforeUnderscore = encoded.slice(0, underscorePosition)
    const afterUnderscore = encoded.slice(underscorePosition + 1)
    return expandCompression(`${beforeUnderscore}000${afterUnderscore}`)
  }
  if (!REGEX_ENCODED_COMPRESSION.test(encoded))
    return encoded
  const match = REGEX_ENCODED_COMPRESSION.exec(encoded)
  if (!match?.groups) {
    console.error('this should not happen...', encoded, match)
    return encoded
  }
  const {index, groups} = match
  const beforeSequence = encoded.slice(0, index)
  const {digit, count} = groups
  const afterSequence = encoded.slice(index + count.length + 1)
  const numberOfRepeatedCharacters = (count === ':')
    ? 3
    : b64ToDecimal(count.replaceAll(/[^0-9a-z@$]/g, ''))
  const expandedDigit = Array(numberOfRepeatedCharacters).fill(digit).join('')
  return `${beforeSequence}${expandedDigit}${expandCompression(afterSequence)}`
}

export function decimalToB64(n:number):string {
  if (n < ENCODING_BASE)
    return ENCODING_CHARS[n]
  return `${decimalToB64(Math.floor(n / ENCODING_BASE))}${decimalToB64(n % ENCODING_BASE)}`
}

const REGEX_REPEATED_DIGITS = /(?<digit>.)(?<repetition>\1{2,})/ // only bother compressing if there are >= 3 in a row
const REGEX_REPEATED_ZEROES = /(?<!0)(?<zeroes>0{2,3})(?!0)/ // zeroes can be compressed if there are only two repeated, because they are more common

export function compressEncodedString(encoded:string):string {
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
    return `${beforeRepetition}${digit}|${decimalToB64(numberOfRepeatedCharacters)}${compressEncodedString(afterRepetition)}`
  return `${beforeRepetition}${digit}{${decimalToB64(numberOfRepeatedCharacters)}}${compressEncodedString(afterRepetition)}`
}

export function encodedStringToBinary(encoded:string):string {
  return encoded.split('').reverse().reduce((acc, encodedLetter) => {
    const binaryRepresentation = flipString(b64ToDecimal(encodedLetter).toString(2))
    const zeroPadding = Array(ENCODING_CHUNK_SIZE - binaryRepresentation.length).fill(0).join('')
    return `${binaryRepresentation}${zeroPadding}${acc}`
  }, '')
}

export function encodedStringToBooleanArray(encoded:string):boolean[] {
  return binaryToBooleanArray(encodedStringToBinary(encoded))
}

export function compressedAndEncodedStringToBooleanArray(encoded:string):boolean[] {
  const uncompressed = expandCompression(encoded)
  return encodedStringToBooleanArray(uncompressed)
}

export function booleanArrayToEncodedAndCompressedString(bools:boolean[]):string {
  const encoded = booleansToEncodedString(bools)
  return compressEncodedString(encoded)
}
