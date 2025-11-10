import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts'
import { assert, beforeEach, createMockedFunction, describe, test } from 'matchstick-as/assembly/index'

import { NativeTokenDetails } from '../../src/utils/nativeTokenDetails'
import { StaticTokenDefinition } from '../../src/utils/staticTokenDefinition'
import { fetchTokenDecimals, fetchTokenName, fetchTokenSymbol, fetchTokenTotalSupply } from '../../src/utils/token'

const NATIVE_TOKEN_ADDRESS = '0x0000000000000000000000000000000000000000'
const NATIVE_TOKEN: NativeTokenDetails = {
  symbol: 'ETH',
  name: 'Ethereum',
  decimals: BigInt.fromI32(18),
}

const TOKEN_OVERRIDES: StaticTokenDefinition[] = [
  {
    address: Address.fromString('0x1111111111111111111111111111111111111111'),
    symbol: 'TEST',
    name: 'Test Token',
    decimals: BigInt.fromI32(18),
  },
]

describe('Token utilities', () => {
  beforeEach(() => {
    // Mock ERC20 functions for the native token address
    const nativeAddress = Address.fromString(NATIVE_TOKEN_ADDRESS)

    // Mock symbol() function
    createMockedFunction(nativeAddress, 'symbol', 'symbol():(string)').returns([ethereum.Value.fromString('ETH')])

    // Mock name() function
    createMockedFunction(nativeAddress, 'name', 'name():(string)').returns([ethereum.Value.fromString('Ethereum')])

    // Mock decimals() function
    createMockedFunction(nativeAddress, 'decimals', 'decimals():(uint32)').returns([
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(18)),
    ])

    // Mock totalSupply() function
    createMockedFunction(nativeAddress, 'totalSupply', 'totalSupply():(uint256)').returns([
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(0)),
    ])
  })
  test('fetchTokenSymbol returns native token symbol', () => {
    const symbol = fetchTokenSymbol(Address.fromString(NATIVE_TOKEN_ADDRESS), TOKEN_OVERRIDES, NATIVE_TOKEN)
    assert.assertTrue(symbol == 'ETH', 'Should return native token symbol')
  })

  test('fetchTokenSymbol returns overridden token symbol', () => {
    const symbol = fetchTokenSymbol(
      Address.fromString('0x1111111111111111111111111111111111111111'),
      TOKEN_OVERRIDES,
      NATIVE_TOKEN,
    )
    assert.assertTrue(symbol == 'TEST', 'Should return overridden token symbol')
  })

  test('fetchTokenName returns native token name', () => {
    const name = fetchTokenName(Address.fromString(NATIVE_TOKEN_ADDRESS), TOKEN_OVERRIDES, NATIVE_TOKEN)
    assert.assertTrue(name == 'Ethereum', 'Should return native token name')
  })

  test('fetchTokenName returns overridden token name', () => {
    const name = fetchTokenName(
      Address.fromString('0x1111111111111111111111111111111111111111'),
      TOKEN_OVERRIDES,
      NATIVE_TOKEN,
    )
    assert.assertTrue(name == 'Test Token', 'Should return overridden token name')
  })

  test('fetchTokenTotalSupply returns zero for native token', () => {
    const totalSupply = fetchTokenTotalSupply(Address.fromString(NATIVE_TOKEN_ADDRESS))
    assert.assertTrue(totalSupply.equals(BigInt.zero()), 'Should return zero for native token total supply')
  })

  test('fetchTokenDecimals returns native token decimals', () => {
    const decimals = fetchTokenDecimals(Address.fromString(NATIVE_TOKEN_ADDRESS), TOKEN_OVERRIDES, NATIVE_TOKEN)
    assert.assertTrue(decimals!.equals(BigInt.fromI32(18)), 'Should return native token decimals')
  })

  test('fetchTokenDecimals returns overridden token decimals', () => {
    const decimals = fetchTokenDecimals(
      Address.fromString('0x1111111111111111111111111111111111111111'),
      TOKEN_OVERRIDES,
      NATIVE_TOKEN,
    )
    assert.assertTrue(decimals!.equals(BigInt.fromI32(18)), 'Should return overridden token decimals')
  })
})
