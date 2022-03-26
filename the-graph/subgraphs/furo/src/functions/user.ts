import { Address, ethereum } from '@graphprotocol/graph-ts'
import { User } from '../../generated/schema'


export function getOrCreateUser(id: Address, event: ethereum.Event): User {
  let user = User.load(id.toHex())

  if (user === null) {
    user = new User(id.toHex())
    user.createdAtBlock = event.block.number
    user.createdAtTimestamp = event.block.timestamp
  }

  user.save()

  return user as User
}
