import { Address } from '@graphprotocol/graph-ts'
import { Factory } from '../../generated/schema'
import { FACTORY_ADDRESS } from '../constants/index'

export function getOrCreateFactory(id: Address = FACTORY_ADDRESS): Factory {
  let factory = Factory.load(id.toHex())

  if (factory === null) {
    factory = new Factory(id.toHex())
    factory.save()
  }

  return factory as Factory
}
