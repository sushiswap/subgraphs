import { Address } from '@graphprotocol/graph-ts'
import { User } from '../../generated/schema'


export function getOrCreateUser(id: Address): User {
  let user = User.load(id.toHex())

  if (user === null) {
    user = new User(id.toHex())
  }

  // user.block = event.block.number
  // user.timestamp = event.block.timestamp
  user.save()

  return user as User
}
