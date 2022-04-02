import { Address, BigInt } from '@graphprotocol/graph-ts'

import { User } from '../../generated/schema'
import { getFactory } from './factory'

export function createUser(id: string): User {
  const user = new User(id)
  user.save()

  const factory = getFactory()
  factory.tokenCount = factory.tokenCount.plus(BigInt.fromI32(1))
  factory.save()

  return user
}

export function getUser(id: string): User {
  return User.load(id) as User
}

export function getOrCreateUser(id: string): User {
  const user = User.load(id)

  if (user === null) {
    return createUser(id)
  }

  return user as User
}

export function createUsersIfNotExist(ids: Array<Address | null>): void {
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i]
    if (id === null) {
      continue
    }
    getOrCreateUser(id.toHex())
  }
}
