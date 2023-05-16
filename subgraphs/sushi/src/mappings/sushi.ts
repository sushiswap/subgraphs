import { BigInt } from '@graphprotocol/graph-ts'
import { Transfer as TransferEvent } from '../../generated/Sushi/Sushi'
import { ADDRESS_ZERO } from '../constants'
import { UserType } from '../enums'
import { getOrCreateTransaction } from '../functions/transaction'
import { getOrCreateUser, updateUser } from '../functions/user'
import { getOrCreateSushi, updateHolderCount } from '../functions/sushi'

export function onTransfer(event: TransferEvent): void {
  let sender = getOrCreateUser(event.params.from.toHex(), event)
  updateUser(sender, event, UserType.SENDER)

  let receiver = getOrCreateUser(event.params.to.toHex(), event)
  updateUser(receiver, event, UserType.RECEIVER)

  getOrCreateTransaction(event)
}
