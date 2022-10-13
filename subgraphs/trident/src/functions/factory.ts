import { Address } from '@graphprotocol/graph-ts'
import { Factory } from '../../generated/schema'
import {
  BIG_DECIMAL_ZERO, BIG_INT_ONE, BIG_INT_ZERO, CONSTANT_PRODUCT_POOL_FACTORY_ADDRESS, STABLE_POOL_FACTORY_ADDRESS, PairType, CONCENTRATED_LIQUIDITY_POOL_FACTORY_ADDRESS
} from '../constants'

export function getOrCreateFactory(type: string): Factory {
  let id = getFactoryId(type)
  let factory = Factory.load(id)

  if (factory === null) {
    factory = new Factory(id)
    factory.type = type
    factory.volumeUSD = BIG_DECIMAL_ZERO
    factory.volumeNative = BIG_DECIMAL_ZERO
    factory.liquidityUSD = BIG_DECIMAL_ZERO
    factory.liquidityNative = BIG_DECIMAL_ZERO
    factory.feesUSD = BIG_DECIMAL_ZERO
    factory.feesNative = BIG_DECIMAL_ZERO
    factory.pairCount = BIG_INT_ZERO
    factory.transactionCount = BIG_INT_ZERO
    factory.tokenCount = BIG_INT_ZERO
    factory.userCount = BIG_INT_ZERO
    factory.save()
  }

  return factory as Factory
}

export function increaseFactoryTransactionCount(type: string): void {
  const globalFactory = getOrCreateFactory(PairType.ALL)
  globalFactory.transactionCount = globalFactory.transactionCount.plus(BIG_INT_ONE)
  globalFactory.save()

  const factory = getOrCreateFactory(type)
  factory.transactionCount = factory.transactionCount.plus(BIG_INT_ONE)
  factory.save()
}

function getFactoryId(type: string): string {
  if (type == PairType.CONSTANT_PRODUCT_POOL) {
    return CONSTANT_PRODUCT_POOL_FACTORY_ADDRESS.toHex()
  }
  else if (type == PairType.STABLE_POOL) {
    return STABLE_POOL_FACTORY_ADDRESS.toHex()
  }
  else if (type == PairType.ALL) {
    return PairType.ALL
  }
  else if (type === PairType.CONCENTRATED_LIQUIDITY_POOL) {
    return CONCENTRATED_LIQUIDITY_POOL_FACTORY_ADDRESS.toHex()
  }
  else {
    throw new Error(
      `Unknown factory type: ${type}, currently available: ${PairType.ALL}, ${PairType.CONSTANT_PRODUCT_POOL}, ${PairType.CONCENTRATED_LIQUIDITY_POOL} and ${PairType.STABLE_POOL}. Did you forget to add it to the list of supported factories?`    )
  }
}
