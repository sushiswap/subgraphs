import { Transfer as TransferEvent } from '../../generated/Sushi/Sushi'
import { User } from '../../generated/schema'
import { ADDRESS_ZERO } from '../constants'
import { UserType } from '../enums'
import { getOrCreateSushi, updateHolderCount } from './sushi'
import { BigInt } from '@graphprotocol/graph-ts'

export function createUser(id: string, event: TransferEvent): User {
  const user = new User(id)
  user.createdAtBlock = event.block.number
  user.createdAtTimestamp = event.block.timestamp
  user.modifiedAtBlock = event.block.number
  user.modifiedAtTimestamp = event.block.timestamp
  user.balance = BigInt.fromU32(0)
  user.save()

  const sushi = getOrCreateSushi()
  sushi.totalUserCount = sushi.totalUserCount.plus(BigInt.fromU32(1))
  sushi.save()
  return user
}

export function getOrCreateUser(id: string, event: TransferEvent): User {
  const user = User.load(id)

  if (user === null) {
    return createUser(id, event)
  }

  return user as User
}

export function updateUser(user: User, event: TransferEvent, type: UserType): void {
  user.modifiedAtBlock = event.block.number
  user.modifiedAtTimestamp = event.block.timestamp
  //we don't update balance of address(0) when minting/burning
  if (user.id != ADDRESS_ZERO.toHex()) {
    const prevBalance = user.balance
    if (type === UserType.SENDER) {
      //reduce balance when sender
      user.balance = user.balance.minus(event.params.value)
    } else {
      //increase balance when receiver
      user.balance = user.balance.plus(event.params.value)
    }
    updateHolderCount(prevBalance, user.balance)
  }
  user.save()
}
