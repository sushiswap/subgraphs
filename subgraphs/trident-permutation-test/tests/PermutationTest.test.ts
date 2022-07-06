import { test
, assert, log } from 'matchstick-as/assembly/index'
import { STABLE_POOL_ADDRESSES } from '../src/constants'

test('Test pool permutations', () => {
  // NETWORK=optimism pnpm exec turbo run test --scope=trident-permutation-test --force
  // const STABLE_POOL_ADDRESSES = ["0x1e31a2c6e6614273d740358affb46bef180efb7b"]

  const EXPECTED = ["0x1e31a2c6e6614273d740358affb46bef180efb7b"]
  log.debug("{}", [STABLE_POOL_ADDRESSES.toString()])
  assert.stringEquals(STABLE_POOL_ADDRESSES.toString(), EXPECTED.toString())
})
