import {describe, it, assert} from 'vitest'

import {binaryToBooleanArray, booleansToBinary} from './binary.js'

describe('binary', () => {
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
})
