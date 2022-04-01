import { Address, BigInt } from '@graphprotocol/graph-ts'

import { User } from '../../generated/schema'
import { getBentoBox } from '.'

export function getOrCreateUser(id: Address): User {
  let user = User.load(id.toHex())

  if (user === null) {
    const bentoBox = getBentoBox()
    user = new User(id.toHex())
    user.bentoBox = bentoBox.id

    bentoBox.userCount = bentoBox.userCount.plus(BigInt.fromString('1'))
    bentoBox.save()
  }

  // user.block = event.block.number
  // user.timestamp = event.block.timestamp
  user.save()

  return user as User
}
