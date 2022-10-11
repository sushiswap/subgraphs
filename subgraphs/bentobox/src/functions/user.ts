import { Address, ethereum } from '@graphprotocol/graph-ts'

import { User } from '../../generated/schema'
import { getOrCreateBentoBox } from './bentobox'
import { increaseUserCount } from './bentobox-kpi'

export function getOrCreateUser(id: Address, event: ethereum.Event): User {
  let user = User.load(id.toHex())

  if (user === null) {
    const bentoBox = getOrCreateBentoBox()
    user = new User(id.toHex())
    user.bentoBox = bentoBox.id
    user.block = event.block.number
    user.timestamp = event.block.timestamp
    user.save()

    increaseUserCount(event.block.timestamp)
  }

  return user as User
}
