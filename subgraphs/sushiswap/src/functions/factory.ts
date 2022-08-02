import { Address } from '@graphprotocol/graph-ts'
import { Factory } from '../../generated/schema'
import { BIG_DECIMAL_ZERO, BIG_INT_ONE, BIG_INT_ZERO, FACTORY_ADDRESS } from '../constants'

export function getOrCreateFactory(id: Address = FACTORY_ADDRESS): Factory {
  let factory = Factory.load(id.toHex())

  if (factory === null) {
    factory = new Factory(id.toHex())
    factory.volumeUSD = BIG_DECIMAL_ZERO
    factory.untrackedVolumeUSD = BIG_DECIMAL_ZERO
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

export function increaseTransactionCount(): void {
  const factory = getOrCreateFactory()
  factory.transactionCount = factory.transactionCount.plus(BIG_INT_ONE)
  factory.save()
}