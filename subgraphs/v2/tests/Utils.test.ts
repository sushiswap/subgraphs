import { assert, log, test } from 'matchstick-as/assembly/index'
import { FACTORY_ADDRESS, NETWORK, generatePoolAddress } from '../src/constants'

test('Create pair address', () => {
  if (NETWORK === 'base') {
    const token0 = '0x4200000000000000000000000000000000000006'
    const token1 = '0x532f27101965dd16442e59d40670faf5ebb142e4'
    const actual = generatePoolAddress(token0, token1, FACTORY_ADDRESS) // correct token order
    const actual2 = generatePoolAddress(token1, token0, FACTORY_ADDRESS) // incorrect token order


    const expected = "0x404e927b203375779a6abd52a2049ce0adf6609b"
    assert.stringEquals(actual, expected)
    assert.stringEquals(actual2, expected)
  } else {
    log.warning('Test skipped, network is not set to base', [])
    return true
  }

})

