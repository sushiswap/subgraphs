import { Address, BigInt, log } from '@graphprotocol/graph-ts'
import { User } from '../../generated/schema'
import { getOrCreateFactory } from './factory'

export function createUser(address: Address): User {
  const factory = getOrCreateFactory()
  factory.userCount = factory.userCount.plus(BigInt.fromI32(1))
  factory.save()

  const user = new User(address.toHex())
  user.save()

  return user as User
}

export function getOrCreateUser(address: Address): User {
  let user = User.load(address.toHex())
  if (user === null) {
    user = createUser(address)
  }

  return user as User
}

export function updateUser(address: Address): User {
  const user = getOrCreateUser(address)

  return user as User
}

export function createUserIfNotExists(addresses: Address[]): void {
  for (let i = 0; i < addresses.length; i++) {
    updateUser(addresses[i])
  }
}
