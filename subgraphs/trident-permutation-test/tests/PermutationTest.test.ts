import { test
, assert } from 'matchstick-as/assembly/index'

test('Test pool permutations', () => {
  // STABLE_POOL_ADDRESSES
  const STABLE_POOL_ADDRESSES = ["0x1e31a2c6e6614273d740358affb46bef180efb7b"]

  const EXPECTED = ["0x1e31a2c6e6614273d740358affb46bef180efb7b"]
  // 0x1e31a2c6e6614273d740358affb46bef180efb7b
  assert.stringEquals(STABLE_POOL_ADDRESSES.toString(), EXPECTED.toString())
})
