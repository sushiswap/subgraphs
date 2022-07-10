import { Address, BigInt } from '@graphprotocol/graph-ts'

export const BENTOBOX_ADDRESS = Address.fromString('0x74c764d41b77dbbb4fe771dab1939b00b146894a')

export const KASHI_MEDIUM_RISK_MASTER_CONTRACT_ADDRESSES = '0xa010ee0226cd071bebd8919a1f675cae1f1f5d3e'.split(',')

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
