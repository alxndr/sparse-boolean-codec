// A base-64 encoding of a boolean array, with a run-length-compression pass
// on top. See the README for the full design rationale, the "growable
// prefix" guarantee, and remaining known limitations (see the "gotchas"
// section).
//
// Implementation is split by pass, matching the README's "how it works"
// breakdown: boolean array <-> binary string (binary.ts), binary string <->
// base-64 (base64.ts), and the run-length compression pass on the base-64
// string (compression.ts). This file re-exports the public API and defines
// the two primary encode/decode entry points that chain those passes
// together.

export {booleansToBinary, binaryToBooleanArray} from './binary.js'
export {
  binaryToEncodedString,
  booleansToEncodedString,
  b64ToDecimal,
  decimalToB64,
  encodedStringToBinary,
  encodedStringToBooleanArray,
} from './base64.js'
export {compressEncodedString, expandCompression} from './compression.js'

import {booleansToEncodedString, encodedStringToBooleanArray} from './base64.js'
import {compressEncodedString, expandCompression} from './compression.js'

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
