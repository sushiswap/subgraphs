import { Transfer as TransferEvent } from '../../../generated/xSushi/xSushi'
import { User } from '../../../generated/schema'
import { UserType } from '../enums'
import { getOrCreateXSushi as getOrCreateXSushi } from './xsushi'
import { BigInt } from '@graphprotocol/graph-ts'

export function createUser(id: string, event: TransferEvent): User {
  const user = new User(id)
  user.createdAtBlock = event.block.number
  user.createdAtTimestamp = event.block.timestamp
  user.modifiedAtBlock = event.block.number
  user.modifiedAtTimestamp = event.block.timestamp
  user.save()

  const xSushi = getOrCreateXSushi()
  xSushi.userCount = xSushi.userCount.plus(BigInt.fromU32(1))
  xSushi.save()
  return user
}

export function getOrCreateUser(type: UserType, event: TransferEvent): User {
  const id = type === UserType.SENDER ? event.params.from.toHex() : event.params.to.toHex()
  const user = User.load(id)

  if (user === null) {
    return createUser(id, event)
  }

  return user as User
}
