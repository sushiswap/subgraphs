import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts'


export const BIG_INT_ZERO = BigInt.fromI32(0)
export const BIG_DECIMAL_ZERO = BigDecimal.fromString('0')
export const BIG_DECIMAL_ONE = BigDecimal.fromString('1')
export const BIG_INT_ONE = BigInt.fromI32(1)

export const HOUR_IN_SECONDS = 3600
export const DAY_IN_SECONDS = 24 * HOUR_IN_SECONDS

export const BENTOBOX_ADDRESS = Address.fromString('0x0711b6026068f736bae6b213031fce978d48e026')

export const KASHI_MEDIUM_RISK_MASTER_CONTRACT_ADDRESSES = '0x513037395fa0c9c35e41f89189cedfe3bd42fadb'.split(',')

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
