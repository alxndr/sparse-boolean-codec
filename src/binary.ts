// NOTE:
// some intermediate representations are 'backwards' from the order of
// booleans... this allows more false values (i.e. bits that are still unset)
// to be appended to the end of the boolean array -- which becomes the
// *beginning* of the binary representation -- without modifying the encoded
// string. See the README section "why the growable prefix works" for the
// full explanation.

export const ONE = '1'
export const ZERO = '0'

/** Converts a boolean array to a binary-digit string, preserving order. */
export function booleansToBinary(bools: boolean[]): string {
  return bools.reduce((str, bool) => `${bool ? ONE : ZERO}${str}`, '')
}

/** Converts a binary-digit string back to a boolean array, preserving order. */
export function binaryToBooleanArray(binary: string): boolean[] {
  return binary.split('').map((val) => val === ONE)
}
