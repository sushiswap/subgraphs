import { Address } from '@graphprotocol/graph-ts'
import { User } from '../../generated/schema'

export function createUser(address: Address): User {

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
