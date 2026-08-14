import {describe, it, assert} from 'vitest'

import {
  b64ToDecimal,
  binaryToBooleanArray,
  binaryToEncodedString,
  booleanArrayToEncodedAndCompressedString,
  booleansToBinary,
  booleansToEncodedString,
  compressedAndEncodedStringToBooleanArray,
  compressEncodedString,
  decimalToB64,
  encodedStringToBinary,
  encodedStringToBooleanArray,
  expandCompression,
} from './index.js'

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
    it('creates an array of booleans in the same order of the binary', () => {
      assert.deepEqual(
        binaryToBooleanArray('10'),
        [true, false]
      )
      assert.deepEqual(
        binaryToBooleanArray('1011'),
        [true, false, true, true]
      )
      assert.deepEqual(
        binaryToBooleanArray('00011'),
        [false, false, false, true, true]
      )
    })
  })
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

  describe('compression', () => {
    describe('reducing size', () => {
      describe('with no repetition', () => {
        it('returns the input unchanged', () => {
          assert.equal(
            compressEncodedString('abc123'),
            'abc123'
          )
          assert.equal(
            compressEncodedString('abababababab'),
            'abababababab'
          )
        })
      })
      describe('zeroes special-casing', () => {
        describe('with three zeroes', () => {
          it('compresses to an underscore', () => {
            assert.equal(
              compressEncodedString('10001'),
              '1_1'
            )
          })
        })
        describe('with two zeroes', () => {
          it('compresses to a hyphen', () => {
            assert.equal(
              compressEncodedString('1001'),
              '1-1'
            )
          })
        })
      })
      describe('with two non-zero digits', () => {
        it('does not compress', () => {
          assert.equal(
            compressEncodedString('1221'),
            '1221'
          )
        })
      })
      describe('with three non-zero digits', () => {
        it('compresses with a colon', () => {
          assert.equal(
            compressEncodedString('23334'),
            '23:4'
          )
          assert.equal(
            compressEncodedString('aaabbbc'),
            'a:b:c'
          )
        })
      })
      describe('with 4 to 63 repeated chars', () => {
        it('compresses the string with a period', () => {
          assert.equal(
            compressEncodedString('122221'),
            '12.41'
          )
          assert.equal(
            compressEncodedString('z55555z'),
            'z5.5z'
          )
          assert.equal(
            compressEncodedString('0000000'),
            '0.7'
          )
          assert.equal( // 63 chars
            compressEncodedString('zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz'),
            'z.$'
          )
        })
      })
      describe('with 64 or more repeated digits', () => {
        it('compresses the string with braces', () => {
          assert.equal( // 64 chars
            compressEncodedString('0000000000000000000000000000000000000000000000000000000000000000'),
            '0{10}'
          )
          assert.equal(
            compressEncodedString('zXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXz'),
            'zX{12}z'
          )
          assert.equal(
            compressEncodedString('1aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1'),
            '1a{$$}1'
          )
          assert.equal(
            compressEncodedString('1aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1'),
            '1a{100}1'
          )
        })
      })
      describe('with multiple sets of repeated chars', () => {
        it('compresses them appropriately', () => {
          assert.equal(
            compressEncodedString('00111111111112333400000000000000zzzzzzz00010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000044440'),
            '-1.b23:40.ez.7_10{1v}4.40'
          )
        })
      })
    })
    describe('expanding', () => {
      describe('with no compression code', () => {
        it('returns the string as is', () => {
          assert.equal(
            expandCompression('abc123'),
            'abc123'
          )
        })
      })
      it('works with a period', () => {
        assert.equal(
          expandCompression('3.4'),
          '3333'
        )
        assert.equal(
          expandCompression('0.za'),
          '00000000000000000000000000000000000a'
        )
        assert.equal(
          expandCompression('1.Aa'),
          '111111111111111111111111111111111111a'
        )
      })
      it('works with a colon', () => {
        assert.equal(
          expandCompression('1:2'),
          '1112'
        )
        assert.equal(
          expandCompression('3:4'),
          '3334'
        )
      })
      it('works with base-64 repetition', () => {
        assert.equal(
          expandCompression('1{10}'), // boundary: smallest valid brace count (64)
          '1'.repeat(64)
        )
        assert.equal(
          expandCompression('2{13}'),
          '2222222222222222222222222222222222222222222222222222222222222222222'
        )
      })
      describe('with multiple compression codes', () => {
        it('handles them appropriately', () => {
          assert.equal(
            expandCompression('01{10}345{10}7{10}90{10}'),
            `0${'1'.repeat(64)}34${'5'.repeat(64)}${'7'.repeat(64)}9${'0'.repeat(64)}`
          )
          assert.equal(
            expandCompression('0.62-2-101_whg8Eg5_M0.4d-w1-2-gw0.72-w-1'),
            '000000200200101000whg8Eg5000M0000d00w100200gw0000000200w001'
          )
        })
      })
      describe('zeroes special-casing', () => {
        describe('a hyphen', () => {
          it('expands to two zeroes', () => {
            assert.equal(
              expandCompression('1-2'),
              '1002'
            )
          })
          it('still expands other compressions', () => {
            assert.equal(
              expandCompression('-3.4-'),
              '00333300'
            )
          })
        })
        describe('an underscore', () => {
          it('expands to three zeroes', () => {
            assert.equal(
              expandCompression('1_2'),
              '10002'
            )
          })
          it('still expands other compressions', () => {
            assert.equal(
              expandCompression('1-1_2.53:'),
              '100100022222333'
            )
          })
        })
      })
      describe('with a little bit of everything', () => {
        it('expands correctly', () => {
          assert.equal(
            expandCompression('01:2-3.45{67}8.9_a:b.c_'),
            '011120033335555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555555888888888000aaabbbbbbbbbbbb000'
          )
        })
      })
      describe('with an invalid compression', () => {
        it('throws on structurally malformed compression codes', () => {
          assert.throws(() => expandCompression('1.:4'))
          assert.throws(() => expandCompression('2{3'))
          assert.throws(() => expandCompression('5.6.7'))
          assert.throws(() => expandCompression('8..9'))
          assert.throws(() => expandCompression('.foo'))
          assert.throws(() => expandCompression('bar;baz'))
          assert.throws(() => expandCompression('qux.'))
        })
        it('throws on an empty brace', () => {
          assert.throws(() => expandCompression('5{}'))
        })
        it('throws on a period repetition count below 4 (only "," and ":" cover 0-3)', () => {
          assert.throws(() => expandCompression('1.0'))
          assert.throws(() => expandCompression('1.1'))
          assert.throws(() => expandCompression('1.2'))
          assert.throws(() => expandCompression('1.3'))
        })
        it('throws on any brace repetition count below 64 (a single base-64 character maxes out at 63)', () => {
          assert.throws(() => expandCompression('0{1}'))
          assert.throws(() => expandCompression('9{9}'))
          assert.throws(() => expandCompression('b{a}'))
          assert.throws(() => expandCompression('1{z}'))
          assert.throws(() => expandCompression('a{$}')) // 63 -- one below the boundary
        })
      })
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

  describe('compressedAndEncodedStringToBooleanArray', () => {
    describe('with no compression codes', () => {
      it('behaves the same as encodedStringToBooleanArray', () => {
        assert.deepEqual(
          compressedAndEncodedStringToBooleanArray('5'),
          [true, false, true, false, false, false]
        )
        assert.deepEqual(
          compressedAndEncodedStringToBooleanArray('1'),
          [true, false, false, false, false, false]
        )
      })
    })
    describe('with compression codes', () => {
      it('expands colon notation before decoding', () => {
        assert.deepEqual(
          compressedAndEncodedStringToBooleanArray('1:'),
          [
            true, false, false, false, false, false,
            true, false, false, false, false, false,
            true, false, false, false, false, false,
          ]
        )
      })
      it('expands hyphen (two zeroes) before decoding', () => {
        assert.deepEqual(
          compressedAndEncodedStringToBooleanArray('1-1'),
          compressedAndEncodedStringToBooleanArray('1001')
        )
      })
    })
  })

  describe('booleanArrayToEncodedAndCompressedString', () => {
    it('encodes simple boolean arrays', () => {
      assert.equal(
        booleanArrayToEncodedAndCompressedString([true, false, true, false, false, false]),
        '5'
      )
      assert.equal(
        booleanArrayToEncodedAndCompressedString([true, false, false, false, false, false]),
        '1'
      )
    })
    it('compresses repetition in the encoded output', () => {
      // three groups of [T,F,F,F,F,F] each encode to '1', which compresses to '1:'
      assert.equal(
        booleanArrayToEncodedAndCompressedString([
          true, false, false, false, false, false,
          true, false, false, false, false, false,
          true, false, false, false, false, false,
        ]),
        '1:'
      )
    })
  })

  describe('round-trip: booleanArrayToEncodedAndCompressedString → compressedAndEncodedStringToBooleanArray', () => {
    it('recovers the original booleans (arrays that are multiples of 6 long)', () => {
      const inputs = [
        [true, false, false, false, false, false],
        [true, false, true, false, true, false],
        [true, true, true, true, true, true],
        [
          true, false, false, false, false, false,
          true, false, false, false, false, false,
          true, false, false, false, false, false,
        ],
      ]
      for (const bools of inputs) {
        assert.deepEqual(
          compressedAndEncodedStringToBooleanArray(booleanArrayToEncodedAndCompressedString(bools)),
          bools,
          `round-trip failed for ${JSON.stringify(bools)}`
        )
      }
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
