import { Address } from '@graphprotocol/graph-ts'

import { User } from '../../generated/schema'
import { getBentoBox } from '../functions'

export function getOrCreateUser(id: Address): User {
  let user = User.load(id.toHex())

  if (user === null) {
    const bentoBox = getBentoBox()
    user = new User(id.toHex())
    user.bentoBox = bentoBox.id
  }

  user.save()

  return user as User
}
