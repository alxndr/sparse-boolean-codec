import {describe, it, assert} from 'vitest'

import {
  binaryToBooleans,
  binaryToEncodedString,
  booleansToBinary,
  booleansToEncodedString,
  encodedStringToBinary,
  // encodedStringToBinary,
  encodedStringToBooleans,
} from './encoding'

describe('encoding helpers', () => {
  describe('boolean to binary', () => {
    it('creates a string in reverse order of the input array', () => {
      assert.deepEqual(
        booleansToBinary([true, false, false, true, true, true]),
        '111001'
      )
    })
  })
  describe('binary to boolean', () => {
    it('creates an array of booleans in reverse order of the binary', () => {
      assert.deepEqual(
        binaryToBooleans('10'),
        [false, true]
      )
      assert.deepEqual(
        binaryToBooleans('1011'),
        [true, true, false, true]
      )
      assert.deepEqual(
        binaryToBooleans('00011'),
        [true, true, false, false, false]
      )
    })
  })
  describe('binary to encoded', () => {
    it('generates 64-bit encoded representation of binary value', () => {
      assert.deepEqual(
        binaryToEncodedString('0'),
        '0'
      )
      assert.deepEqual(
        binaryToEncodedString('1'),
        '1'
      )
      assert.deepEqual(
        binaryToEncodedString('10'),
        '1'
      )
      assert.deepEqual(
        binaryToEncodedString('01'),
        '2'
      )
      assert.deepEqual(
        binaryToEncodedString('11'),
        '3'
      )
      assert.deepEqual(
        binaryToEncodedString('011'),
        '6'
      )
      assert.deepEqual(
        binaryToEncodedString('1001'),
        '9'
      )
      assert.deepEqual(
        binaryToEncodedString('0101'),
        'a'
      )
      assert.deepEqual(
        binaryToEncodedString('000001'),
        'w'
      )
      assert.deepEqual(
        binaryToEncodedString('110001'),
        'z'
      )
      assert.deepEqual(
        binaryToEncodedString('001001'),
        'A'
      )
      assert.deepEqual(
        binaryToEncodedString('000011'),
        'M'
      )
      assert.deepEqual(
        binaryToEncodedString('101111'),
        'Z'
      )
      assert.deepEqual(
        binaryToEncodedString('011111'),
        '@'
      )
      assert.deepEqual(
        binaryToEncodedString('111111'),
        '$'
      )
      assert.deepEqual(
        binaryToEncodedString('0000001'),
        '01'
      )
      assert.deepEqual(
        binaryToEncodedString('0000101'),
        'g1'
      )
      assert.deepEqual(
        binaryToEncodedString('0000011'),
        'w1'
      )
      assert.deepEqual(
        binaryToEncodedString('1111111'),
        '$1'
      )
      assert.deepEqual(
        binaryToEncodedString('00000001'),
        '02'
      )
      assert.deepEqual(
        binaryToEncodedString('00000101'),
        'w2'
      )
      assert.deepEqual(
        binaryToEncodedString('00000011'),
        '03'
      )
      assert.deepEqual(
        binaryToEncodedString('00000111'),
        'w3'
      )
      assert.deepEqual(
        binaryToEncodedString('00001111'),
        'M3'
      )
      assert.deepEqual(
        binaryToEncodedString('11111111'),
        '$3'
      )
      assert.deepEqual(
        binaryToEncodedString('000000001'),
        '04'
      )
      assert.deepEqual(
        binaryToEncodedString('111111111'),
        '$7'
      )
      assert.deepEqual(
        binaryToEncodedString('1111111111'),
        '$f'
      )
      assert.deepEqual(
        binaryToEncodedString('11111111111'),
        '$v'
      )
      assert.deepEqual(
        binaryToEncodedString('111111111111'),
        '$$'
      )
      assert.deepEqual(
        binaryToEncodedString('0000000000001'),
        '001'
      )
    })
  })
  describe('boolean to encoded', () => {
    it('turns array of booleans into encoded string', () => {
      assert.deepEqual(
        booleansToEncodedString([true, false, true]),
        '5'
      )
      assert.deepEqual(
        booleansToEncodedString([true, false, false, false, false, false, false, true]),
        '12'
      )
      assert.deepEqual(
        booleansToEncodedString([true, false, false, false, false, false, false, false, false, false, false, true]),
        '1w'
      )
      assert.deepEqual(
        booleansToEncodedString([true, false, false, false, false, false, true, false, false, false, false, false, false, false, false, false, false, false, true, true, true, true, true, true]),
        '$0ww'
      )
    })
  })
  describe('encoded to binary', () => {
    it('turns encoded string to binary string', () => {
      assert.deepEqual(
        encodedStringToBinary('0'),
        '000000'
      )
      assert.deepEqual(
        encodedStringToBinary('1'),
        '100000'
      )
      assert.deepEqual(
        encodedStringToBinary('10'),
        '000000100000'
      )
      assert.deepEqual(
        encodedStringToBinary('a'),
        '010100'
      )
      assert.deepEqual(
        encodedStringToBinary('Z'),
        '101111'
      )
      assert.deepEqual(
        encodedStringToBinary('$'),
        '111111'
      )
      assert.deepEqual(
        encodedStringToBinary('01'),
        '100000000000'
      )
      assert.deepEqual(
        encodedStringToBinary('$1'),
        '100000111111'
      )
    })
  })
  describe('encoded to boolean', () => {
    it('turns encoded string back to (backwards) list of booleans', () => {
      assert.deepEqual(
        encodedStringToBooleans('9'),
        [false, false, true, false, false, true]
      )
      assert.deepEqual(
        encodedStringToBooleans('Z'),
        [true, true, true, true, false, true]
      )
      assert.deepEqual(
        encodedStringToBooleans('1$'),
        [
          false, false, false, false, false, true,
          true, true, true, true, true, true,
        ]
      )
      assert.deepEqual(
        encodedStringToBooleans('$1'),
        [
          true, true, true, true, true, true,
          false, false, false, false, false, true,
        ]
      )
    })
  })
})
