import { ByteArray, crypto } from '@graphprotocol/graph-ts'
import { test
, assert, log } from 'matchstick-as/assembly/index'
import { STABLE_POOL_ADDRESSES } from '../src/constants'

test('Test pool permutations', () => {
  // NETWORK=optimism pnpm exec turbo run test --scope=trident-permutation-test --force


  const test = crypto.keccak256(ByteArray.fromHexString(
    '0x' +
      "0x4200000000000000000000000000000000000006".slice(2).padStart(64, '0') +
      "0x7f5c764cbc14f9669b88837ca1490cca17c31607".slice(2).padStart(64, '0') +
      (30).toString(16).padStart(64, '0') +
      (0).toString(16).padStart(64, '0')
  ))
  
  log.debug("sagarang bam bam {}", [test.toHex()])

  const EXPECTED = ["0x11b072c5259ebd68e888a79c49bfff0bcf742983, 0x1b67c104240478a98c7a5dfaec5dd4817c12f014"]
  log.debug("actual {}", [STABLE_POOL_ADDRESSES.toString()])
  log.debug("expected {}", [EXPECTED.toString()])
  assert.stringEquals(STABLE_POOL_ADDRESSES.toString(), EXPECTED.toString())
})
