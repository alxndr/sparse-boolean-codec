const ONE = '1'
const ZERO = '0'

// the binary representation is 'backwards' from the order of booleans...
// this allows more zero-values (i.e. un-attended shows) to be added (to the
// end of the boolean array === the beginning of the binary representation)
// without modifying the encoded string.

export function booleansToBinary(bools:boolean[]):string {
  return bools.reduce((str, bool) => `${bool ? ONE : ZERO}${str}`, '')
}

export function binaryToBooleans(binary:string):boolean[] {
  return binary.split('').reverse().map((val) => val === ONE, [])
}

// TODO determine & explain the backwards-ness of the encoded string too...

const ENCODING_CHARS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ@$'
const ENCODING_BASE = ENCODING_CHARS.length
const ENCODING_CHUNK_SIZE = Math.ceil(Math.log2(ENCODING_BASE))
const ENCODING_CHARS_SPLIT = ENCODING_CHARS.split('')

export function binaryToEncodedString(binary:string):string {
  return binary.split(new RegExp(`(.{${ENCODING_CHUNK_SIZE}})`)).filter(v => v.length).reduce((encoded:string, binaryChunk:string) => {
    // eg ['101001', '010010', '100101', '011010', '010010', '010100', '1']
    const decimalValue:number = binaryChunk.split('').reduce((decValue, binaryChar, digitIndex) => {
      return decValue + (binaryChar === ONE ? Math.pow(2, digitIndex) : 0)
    }, 0)
    return `${encoded}${ENCODING_CHARS[decimalValue]}`
  }, '')
}

export function booleansToEncodedString(bools:boolean[]):string {
  return binaryToEncodedString(booleansToBinary(bools))
}

export function encodedStringToBinary(encoded:string):string {
  // TODO are the reverse()s correct??
  return encoded.split('').reverse().reduce((acc, encodedLetter) => {
    const binaryRepresentation = ENCODING_CHARS_SPLIT.indexOf(encodedLetter).toString(2).split('').reverse().join('')
    return `${acc}${binaryRepresentation}${Array(ENCODING_CHUNK_SIZE - binaryRepresentation.length).fill(0).join('')}` // TODO is this backwards? should acc be after??
  }, '')
}

export function encodedStringToBooleans(encoded:string):boolean[] {
  return binaryToBooleans(encodedStringToBinary(encoded))
}
