// TODO...
// some representations are 'backwards' from the order of booleans...
// this allows more zero-values (i.e. un-attended shows) to be added (to the
// end of the boolean array === the beginning of the binary representation)
// without modifying the encoded string.

// TODO...
// implement compression:
// if a char is repeated 5 or more times, shrink like so:
//   0{5} => 00000 (5)
//   0{a} => 0000000000 (10)
//   0{k} => 00000000000000000000 (20)
//   0{A} => 000000000000000000000000000000000000 (35?)
//   0{Z} => 00000000000000000000000000000000000000000000000000000000000000 (61)

const ONE = '1'
const ZERO = '0'

export function booleansToBinary(bools:boolean[]):string { // preserves ordering
  // console.log('booleansToBinary', [...bools])
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
  console.log('binaryToEncodedString...', {binary})
  const zeroPadding = Array((ENCODING_CHUNK_SIZE - (binary.length % ENCODING_CHUNK_SIZE)) % ENCODING_CHUNK_SIZE).fill(0).join('')
  // console.log('binaryToEncodedString...', {zeroPadding})
  const something = `${zeroPadding}${binary}`.split(new RegExp(`(.{${ENCODING_CHUNK_SIZE}})`)).filter(v => v.length) // n.b. this reverses the representation... 0th element of `binary` is last char in `something`
  // console.log('binaryToEncodedString...', {something})
  return something.reduce((encoded:string, binaryChunk:string) => {
    console.log('binaryToEncodedString first reducer...', {encoded, binaryChunk})
    const decimalValue:number = binaryChunk.split('').reverse().reduce((decValue, binaryChar, digitIndex) => {
      // console.log('binaryToEncodedString nested reducer...', {priorValue: decValue, binaryChar, digitIndex})
      return decValue + (binaryChar === ONE ? Math.pow(2, digitIndex) : 0)
    }, 0)
    return `${encoded}${ENCODING_CHARS[decimalValue]}`
  }, '')
}

export function booleansToEncodedString(bools:boolean[]):string {
  // console.log('booleansToEncodedString...', [...bools])
  const binary:string = booleansToBinary(bools)
  // console.log('booleansToEncodedString...', {binary})
  const encoded:string = flipString(binaryToEncodedString(binary))
  // console.log('booleansToEncodedString!!!', {encoded})
  return encoded.replace(/0+$/, '')
}

function flipString(s:string):string {
  return s.split('').reverse().join('')
}

export function encodedStringToBinary(encoded:string):string {
  return encoded.split('').reverse().reduce((acc, encodedLetter) => {
    const binaryRepresentation = flipString(ENCODING_CHARS_SPLIT.indexOf(encodedLetter).toString(2))
    const zeroPadding = Array(ENCODING_CHUNK_SIZE - binaryRepresentation.length).fill(0).join('')
    return `${binaryRepresentation}${zeroPadding}${acc}`
  }, '')
}

export function encodedStringToBooleanArray(encoded:string):boolean[] {
  return binaryToBooleanArray(encodedStringToBinary(encoded))
}
