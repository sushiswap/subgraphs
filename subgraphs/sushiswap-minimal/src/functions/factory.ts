import { Address } from '@graphprotocol/graph-ts'
import { Factory } from '../../generated/schema'
import { BIG_INT_ONE, BIG_INT_ZERO, FACTORY_ADDRESS, PairType } from '../constants'

export function getOrCreateFactory(id: Address = FACTORY_ADDRESS): Factory {
  let factory = Factory.load(id.toHex())

  if (factory === null) {
    factory = new Factory(id.toHex())
    factory.type = PairType.CONSTANT_PRODUCT_POOL
    factory.pairCount = BIG_INT_ZERO
    factory.tokenCount = BIG_INT_ZERO
    factory.save()
  }

  return factory as Factory
}

