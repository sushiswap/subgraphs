import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts'

import { User } from '../../generated/schema'
import { getBentoBox } from './bentobox'

export function getOrCreateUser(id: Address, event: ethereum.Event): User {
  let user = User.load(id.toHex())

  if (user === null) {
    const bentoBox = getBentoBox()
    user = new User(id.toHex())
    user.bentoBox = bentoBox.id
    user.block = event.block.number
    user.timestamp = event.block.timestamp
    user.save()
  }

  return user as User
}
