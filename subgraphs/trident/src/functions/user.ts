import { Address } from '@graphprotocol/graph-ts'
import { User, _FactoryUser } from '../../generated/schema'
import { BIG_INT_ONE, BIG_INT_ZERO, PairType } from '../constants'
import { getOrCreateFactory } from './factory'

export function createUser(address: Address): User {

  const user = new User(address.toHex())
  user.lpSnapshotsCount = BIG_INT_ZERO
  user.save()

  const factory = getOrCreateFactory(PairType.ALL)
  factory.userCount = factory.userCount.plus(BIG_INT_ONE)
  factory.save()


  return user as User
}

export function getOrCreateUser(address: Address, type: string): User {
  let user = User.load(address.toHex())
  if (user === null) {
    user = createUser(address)
  } else {
    if (type !== PairType.ALL) {
      let factoryUser = _FactoryUser.load(type.concat(":").concat(address.toHex()))
      if (factoryUser === null) {
        factoryUser = new _FactoryUser(type.concat(":").concat(address.toHex()))
        factoryUser.save()

        const factory = getOrCreateFactory(type)
        factory.userCount = factory.userCount.plus(BIG_INT_ONE)
        factory.save()
      }
    }
  }

  return user as User
}
