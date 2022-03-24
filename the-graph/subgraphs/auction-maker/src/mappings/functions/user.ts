import { ethereum } from '@graphprotocol/graph-ts'
import { User } from '../../../generated/schema'
import { increaseUserCount } from './auction-maker'

export function getOrCreateUser(id: string, event: ethereum.Event): User {
  let user = User.load(id)

  if (user === null) {
    user = new User(id)
    user.createdAtBlock = event.block.number
    user.createdAtTimestamp = event.block.timestamp
    user.modifiedAtBlock = event.block.number
    user.modifiedAtTimestamp = event.block.timestamp
    user.save()
    
    increaseUserCount()
  }

  return user as User
}
