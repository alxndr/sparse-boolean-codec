import {describe, it, assert} from 'vitest'

import {
  booleanArrayToEncodedAndCompressedString,
  compressedAndEncodedStringToBooleanArray,
} from './index.js'

describe('primary encode/decode API', () => {
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
})
