// TODO...
// some representations are 'backwards' from the order of booleans...
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

function flipString(s:string):string {
  return s.split('').reverse().join('')
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

const REGEX_ENCODED_COMPRESSION = /(?<digit>[0-9a-z@$])\{(?<count>[0-9a-z@$]+)\}/i

export function expandCompression(encoded:string):string {
  if (!REGEX_ENCODED_COMPRESSION.test(encoded))
    return encoded
  const match = REGEX_ENCODED_COMPRESSION.exec(encoded)
  if (!match?.groups) {
    console.error('this should not happen...', encoded, match)
    return encoded
  }
  const {index, groups} = match
  const {digit, count} = groups
  const beforeSequence = encoded.slice(0, index)
  const expandedDigit = Array(b64ToDecimal(count)).fill(digit).join('')
  const afterSequence = encoded.slice(index + count.length + 3) // 3 because 2 for the braces and 1 for the slice offset
  return `${beforeSequence}${expandedDigit}${expandCompression(afterSequence)}`
}

const REGEX_ENCODED_REPETITION = /(?<digit>.)(?<repetition>\1{4,})/

export function decimalToB64(n:number):string {
  if (n < ENCODING_BASE)
    return ENCODING_CHARS[n]
  return `${decimalToB64(Math.floor(n / ENCODING_BASE))}${decimalToB64(n % ENCODING_BASE)}`
}

export function compressEncodedString(encoded:string):string {
  // only bother compressing if there are >= 5 in a row, since the compression itself takes at least 4 chars...
  const match = REGEX_ENCODED_REPETITION.exec(encoded)
  if (!match?.groups)
    return encoded
  const {index, groups} = match
  const {digit, repetition} = groups
  const beforeRepetition = encoded.slice(0, index)
  const afterRepetition = encoded.slice(index + repetition.length + 1)
  return `${beforeRepetition}${digit}{${decimalToB64(repetition.length + 1)}}${compressEncodedString(afterRepetition)}`
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
