import { Address } from '@graphprotocol/graph-ts'
import { User } from '../../generated/schema'
import { BIG_INT_ONE, FactoryType } from '../constants'
import { getOrCreateFactory } from './factory'
import { createUserKpi } from './user-kpi'

export function createUser(address: Address): User {

  const user = new User(address.toHex())
  user.save()

  const factory = getOrCreateFactory(FactoryType.CONSTANT_PRODUCT_POOL)
  factory.userCount = factory.userCount.plus(BIG_INT_ONE)
  factory.save()

  createUserKpi(address)

  return user as User
}

export function getOrCreateUser(address: Address): User {
  let user = User.load(address.toHex())
  if (user === null) {
    user = createUser(address)
  }

  return user as User
}
