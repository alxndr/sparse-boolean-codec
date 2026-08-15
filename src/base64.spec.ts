import {describe, it, assert} from 'vitest'

import {
  b64ToDecimal,
  binaryToEncodedString,
  booleansToEncodedString,
  decimalToB64,
  encodedStringToBinary,
  encodedStringToBooleanArray,
} from './base64.js'

describe('base64', () => {
  describe('binary to encoded', () => {
    it('generates left-aligned 64-bit encoded representation of binary value', () => {
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
        '2'
      )
      assert.deepEqual(
        binaryToEncodedString('11'),
        '3'
      )
      assert.deepEqual(
        binaryToEncodedString('100'),
        '4'
      )
      assert.deepEqual(
        binaryToEncodedString('101'),
        '5'
      )
      assert.deepEqual(
        binaryToEncodedString('1000'),
        '8'
      )
      assert.deepEqual(
        binaryToEncodedString('10000'),
        'g'
      )
      assert.deepEqual(
        binaryToEncodedString('100000'),
        'w'
      )
      assert.deepEqual(
        binaryToEncodedString('100011'),
        'z'
      )
      assert.deepEqual(
        binaryToEncodedString('100100'),
        'A'
      )
      assert.deepEqual(
        binaryToEncodedString('111101'),
        'Z'
      )
      assert.deepEqual(
        binaryToEncodedString('111110'),
        '@'
      )
      assert.deepEqual(
        binaryToEncodedString('111111'),
        '$'
      )
      assert.deepEqual(
        binaryToEncodedString('1000000'),
        '10'
      )
      assert.deepEqual(
        binaryToEncodedString('1100000'),
        '1w'
      )
      assert.deepEqual(
        binaryToEncodedString('1110000'),
        '1M'
      )
      assert.deepEqual(
        binaryToEncodedString('1111000'),
        '1U'
      )
      assert.deepEqual(
        binaryToEncodedString('1111100'),
        '1Y'
      )
      assert.deepEqual(
        binaryToEncodedString('1111110'),
        '1@'
      )
      assert.deepEqual(
        binaryToEncodedString('1111111'),
        '1$'
      )
      assert.deepEqual(
        binaryToEncodedString('10000000'),
        '20'
      )
      assert.deepEqual(
        binaryToEncodedString('10111111'),
        '2$'
      )
      assert.deepEqual(
        binaryToEncodedString('11000000'),
        '30'
      )
      assert.deepEqual(
        binaryToEncodedString('11111111'),
        '3$'
      )
      assert.deepEqual(
        binaryToEncodedString('111111111'),
        '7$'
      )
      assert.deepEqual(
        binaryToEncodedString('1111111111'),
        'f$'
      )
      assert.deepEqual(
        binaryToEncodedString('11111111111'),
        'v$'
      )
      assert.deepEqual(
        binaryToEncodedString('111111111111'),
        '$$'
      )
    })
    describe('left zero-padding', () => {
      it('is preserved in six-character chunks', () => {
        assert.deepEqual(
          binaryToEncodedString('01'),
          '1'
        )
        assert.deepEqual(
          binaryToEncodedString('011'),
          '3'
        )
        assert.deepEqual(
          binaryToEncodedString('0101'),
          '5'
        )
        assert.deepEqual(
          binaryToEncodedString('000001'),
          '1'
        )
        assert.deepEqual(
          binaryToEncodedString('0000001'),
          '01'
        )
        assert.deepEqual(
          binaryToEncodedString('0000011'),
          '03'
        )
        assert.deepEqual(
          binaryToEncodedString('0000101'),
          '05'
        )
        assert.deepEqual(
          binaryToEncodedString('00000001'),
          '01'
        )
        assert.deepEqual(
          binaryToEncodedString('000000001'),
          '01'
        )
        assert.deepEqual(
          binaryToEncodedString('0000000000001'),
          '001'
        )
        assert.deepEqual(
          binaryToEncodedString('0000001000000'),
          '010'
        )
      })
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
        '110$'
      )
    })
    describe('extra false at the end', () => {
      it('does not result in extra zeros at the end of the encoded string', () => {
        assert.deepEqual(
          booleansToEncodedString([true, false, true, false, false]),
          '5'
        )
        assert.deepEqual(
          booleansToEncodedString([true, false, false, false, false, false, true]),
          '11'
        )
        assert.deepEqual(
          booleansToEncodedString([true, false, false, false, false, false, true, false]),
          '11'
        )
        assert.deepEqual(
          booleansToEncodedString([true, false, false, false, false, false, true, false, false]),
          '11'
        )
        assert.deepEqual(
          booleansToEncodedString([true, false, false, false, false, false, true, false, false, false, false, false, false, false, false]),
          '11'
        )
      })
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
        encodedStringToBinary('2'),
        '010000'
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
        '000000100000'
      )
      assert.deepEqual(
        encodedStringToBinary('$1'),
        '111111100000'
      )
    })
    it('zero-pads on the right-hand side', () => {
      assert.deepEqual(
        encodedStringToBinary('10'),
        '100000000000'
      )
      assert.deepEqual(
        encodedStringToBinary('100'),
        '100000000000000000'
      )
    })
  })
  describe('encoded to boolean', () => {
    it('turns encoded string back to (backwards, false-padded) list of booleans', () => {
      assert.deepEqual(
        encodedStringToBooleanArray('1'),
        [true, false, false, false, false, false]
      )
      assert.deepEqual(
        encodedStringToBooleanArray('9'),
        [true, false, false, true, false, false]
      )
      assert.deepEqual(
        encodedStringToBooleanArray('Z'),
        [true, false, true, true, true, true]
      )
      assert.deepEqual(
        encodedStringToBooleanArray('01'),
        [
          false, false, false, false, false, false,
          true,  false, false, false, false, false,
        ]
      )
      assert.deepEqual(
        encodedStringToBooleanArray('1$'),
        [
          true, false, false, false, false, false,
          true,  true,  true,  true,  true,  true,
        ]
      )
      assert.deepEqual(
        encodedStringToBooleanArray('$1'),
        [
          true,  true,  true,  true,  true,  true,
          true, false, false, false, false, false,
        ]
      )
      assert.deepEqual(
        encodedStringToBooleanArray('$10'),
        [
          true,   true,  true,  true,  true,  true,
          true,  false, false, false, false, false,
          false, false, false, false, false, false,
        ]
      )
    })
  })
  describe('b64ToDecimal', () => {
    it('converts string characters to decimal values', () => {
      assert.equal(
        b64ToDecimal('0'),
        0
      )
      assert.equal(
        b64ToDecimal('1'),
        1
      )
      assert.equal(
        b64ToDecimal('2'),
        2
      )
      assert.equal(
        b64ToDecimal('a'),
        10
      )
      assert.equal(
        b64ToDecimal('z'),
        35
      )
      assert.equal(
        b64ToDecimal('A'),
        36
      )
      assert.equal(
        b64ToDecimal('Z'),
        61
      )
      assert.equal(
        b64ToDecimal('@'),
        62
      )
      assert.equal(
        b64ToDecimal('$'),
        63
      )
    })
    it('handles multiple digits', () => {
      assert.equal(
        b64ToDecimal('10'),
        64
      )
      assert.equal(
        b64ToDecimal('11'),
        65
      )
      assert.equal(
        b64ToDecimal('1$'),
        127
      )
      assert.equal(
        b64ToDecimal('20'),
        128
      )
      assert.equal(
        b64ToDecimal('kV'),
        1337
      )
      assert.equal(
        b64ToDecimal('$$'),
        4095
      )
      assert.equal(
        b64ToDecimal('100'),
        4096
      )
      assert.equal(
        b64ToDecimal('111'),
        4161
      )
      assert.equal(
        b64ToDecimal('bar'),
        45723
      )
      assert.equal(
        b64ToDecimal('foo'),
        63000
      )
    })
    describe('with invalid chars', () => {
      it('throws', () => {
        assert.throws(() => b64ToDecimal('!'))
        assert.throws(() => b64ToDecimal('#'))
        assert.throws(() => b64ToDecimal('.'))
        assert.throws(() => b64ToDecimal(','))
        assert.throws(() => b64ToDecimal('?'))
        assert.throws(() => b64ToDecimal('<'))
        assert.throws(() => b64ToDecimal('>'))
        assert.throws(() => b64ToDecimal('{'))
        assert.throws(() => b64ToDecimal('}'))
        assert.throws(() => b64ToDecimal('('))
        assert.throws(() => b64ToDecimal(')'))
        assert.throws(() => b64ToDecimal('"'))
        assert.throws(() => b64ToDecimal(`'`))
        assert.throws(() => b64ToDecimal('`'))
      })
    })
  })
  describe('decimalToB64', () => {
    it('converts number to base-64 string', () => {
      assert.equal(
        decimalToB64(0),
        '0'
      )
      assert.equal(
        decimalToB64(1),
        '1'
      )
      assert.equal(
        decimalToB64(2),
        '2'
      )
      assert.equal(
        decimalToB64(10),
        'a'
      )
      assert.equal(
        decimalToB64(35),
        'z'
      )
      assert.equal(
        decimalToB64(36),
        'A'
      )
      assert.equal(
        decimalToB64(61),
        'Z'
      )
      assert.equal(
        decimalToB64(62),
        '@'
      )
      assert.equal(
        decimalToB64(63),
        '$'
      )
      assert.equal(
        decimalToB64(64),
        '10'
      )
      assert.equal(
        decimalToB64(130),
        '22'
      )
      assert.equal(
        decimalToB64(1337),
        'kV'
      )
      assert.equal(
        decimalToB64(45723),
        'bar'
      )
      assert.equal(
        decimalToB64(63000),
        'foo'
      )
    })
  })
})
