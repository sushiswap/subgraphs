import { FACTORY_ADDRESS } from '../constants'
import { Factory } from '../../generated/schema'
import { Address } from '@graphprotocol/graph-ts'

export function createFactory(id: Address = FACTORY_ADDRESS): Factory {
  const factory = new Factory(id.toHex())
  factory.save()
  return factory
}

export function getFactory(id: Address = FACTORY_ADDRESS): Factory {
  return Factory.load(id.toHex()) as Factory
}

export function getOrCreateFactory(id: Address = FACTORY_ADDRESS): Factory {
  let factory = Factory.load(id.toHex())

  if (factory === null) {
    factory = createFactory()
  }

  return factory as Factory
}
