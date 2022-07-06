import { Address } from '@graphprotocol/graph-ts'
import { ConstantProductPoolFactory } from '../schema'
import { CONSTANT_PRODUCT_POOL_FACTORY_ADDRESS } from '../constants'

export function getOrCreateConstantProductPoolFactory(
  id: Address = CONSTANT_PRODUCT_POOL_FACTORY_ADDRESS
): ConstantProductPoolFactory {
  let factory = ConstantProductPoolFactory.load(id.toHex())

  if (factory === null) {
    factory = new ConstantProductPoolFactory(id.toHex())
    factory.save()
  }

  return factory as ConstantProductPoolFactory
}
