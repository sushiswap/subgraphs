import { Address, BigDecimal, BigInt, Bytes, TypedMap } from '@graphprotocol/graph-ts'

export const BIG_INT_ZERO = BigInt.fromI32(0)
export const BIG_DECIMAL_ZERO = BigDecimal.fromString('0')
export const BIG_DECIMAL_ONE = BigDecimal.fromString('1')
export const BIG_INT_ONE = BigInt.fromI32(1)

export const HOUR_IN_SECONDS = 3600
export const DAY_IN_SECONDS = 24 * HOUR_IN_SECONDS

export const CHAIN_ID = BigInt.fromString('{{ chainId }}')

export const BENTOBOX_ADDRESS = Address.fromString('{{ bentobox.address }}')

export const KASHI_MEDIUM_RISK_MASTER_CONTRACT_ADDRESSES = '{{ kashi.mediumRiskMasterContractAddresses }}'.split(',')

export const DEPRECIATED_ADDRESSES = '{{ kashi.depreciated }}'.split(',')

// MEDIUM RISK PAIR CONFIGURATION
export const MINIMUM_TARGET_UTILIZATION = BigInt.fromString('700000000000000000') // 70%

export const MAXIMUM_TARGET_UTILIZATION = BigInt.fromString('800000000000000000') // 80%

export const UTILIZATION_PRECISION = BigInt.fromString('1000000000000000000')

export const FULL_UTILIZATION = BigInt.fromString('1000000000000000000')

export const FULL_UTILIZATION_MINUS_MAX = FULL_UTILIZATION.minus(MAXIMUM_TARGET_UTILIZATION)

export const STARTING_INTEREST_PER_YEAR = BigInt.fromI32(317097920)
  .times(BigInt.fromI32(60))
  .times(BigInt.fromI32(60))
  .times(BigInt.fromI32(24))
  .times(BigInt.fromI32(365)) // approx 1% APR

export const MINIMUM_INTEREST_PER_YEAR = BigInt.fromI32(79274480)
  .times(BigInt.fromI32(60))
  .times(BigInt.fromI32(60))
  .times(BigInt.fromI32(24))
  .times(BigInt.fromI32(365)) // approx 0.25% APR

export const MAXIMUM_INTEREST_PER_YEAR = STARTING_INTEREST_PER_YEAR.times(BigInt.fromI32(1000)) // approx 1000% APR

export const INTEREST_ELASTICITY = BigInt.fromString('28800000000000000000000000000000000000000') // Half or double in 28800 seconds (8 hours) if linear

export const FACTOR_PRECISION = BigInt.fromString('1000000000000000000')

export const ADDRESS_ZERO = Address.fromString('0x0000000000000000000000000000000000000000')

class KashiActions {
  PAIR_ADD_COLLATERAL: string
  PAIR_REMOVE_COLLATERAL: string
  PAIR_ADD_ASSET: string
  PAIR_REMOVE_ASSET: string
  PAIR_BORROW: string
  PAIR_REPAY: string
}

export const ACTIONS: KashiActions = {
  PAIR_ADD_COLLATERAL: 'addCollateral',
  PAIR_REMOVE_COLLATERAL: 'removeCollateral',
  PAIR_ADD_ASSET: 'addAsset',
  PAIR_REMOVE_ASSET: 'removeAsset',
  PAIR_BORROW: 'borrow',
  PAIR_REPAY: 'repay',
}

export const NATIVE_ADDRESS = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'

export const BTC_ADDRESSES = [
  // wbtc
  '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
]
export const ETH_ADDRESSES = [
  // weth9
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
]

export const STABLE_ADDRESSES = [
  // usdc
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  // usdt
  '0xdac17f958d2ee523a2206206994597c13d831ec7',
  // dai
  '0x6b175474e89094c44da98b954eedeac495271d0f',
]

// TODO: Pricing...
export const baseLookupTable = new TypedMap<string, string>()
baseLookupTable.set('0x0000000000000000000000000000000000000001', 'USD')
baseLookupTable.set('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', 'ETH')
baseLookupTable.set('0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', 'BTC')

export class PriceFeed {
  from: Bytes
  to: Bytes
  decimals: BigInt
  fromDecimals: BigInt
  toDecimals: BigInt
}

export const chainlinkPriceFeedLookupTable = new TypedMap<string, PriceFeed>()

const oracles = {{ &kashi.oracles }}

Object.keys(oracles).forEach((address) => chainlinkPriceFeedLookupTable.set(address, {...oracles[address]}))