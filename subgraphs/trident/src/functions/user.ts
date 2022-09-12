import { Address } from '@graphprotocol/graph-ts'
import { User } from '../../generated/schema'
import { BIG_INT_ONE, BIG_INT_ZERO, PairType } from '../constants'
import { getOrCreateFactory } from './factory'

export function createUser(address: Address): User {

  const user = new User(address.toHex())
  user.lpSnapshotsCount = BIG_INT_ZERO
  user.save()

  const factory = getOrCreateFactory(PairType.CONSTANT_PRODUCT_POOL)
  factory.userCount = factory.userCount.plus(BIG_INT_ONE)
  factory.save()


  return user as User
}

export function getOrCreateUser(address: Address): User {
  let user = User.load(address.toHex())
  if (user === null) {
    user = createUser(address)
  }

  return user as User
}
