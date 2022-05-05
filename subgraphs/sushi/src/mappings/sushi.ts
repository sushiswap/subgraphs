import { Transfer as TransferEvent } from '../../generated/Sushi/Sushi'
import { UserType } from '../enums'
import { getOrCreateTransaction } from '../functions/transaction'
import { getOrCreateUser } from '../functions/user'

export function onTransfer(event: TransferEvent): void {
  let sender = getOrCreateUser(UserType.SENDER, event)
  let reciever = getOrCreateUser(UserType.RECIEVER, event)
  getOrCreateTransaction(event)

  sender.balance = sender.balance.minus(event.params.value)
  sender.modifiedAtBlock = event.block.number
  sender.modifiedAtTimestamp = event.block.timestamp
  sender.save()

  reciever.balance = reciever.balance.plus(event.params.value)
  reciever.modifiedAtBlock = event.block.number
  reciever.modifiedAtTimestamp = event.block.timestamp
  reciever.save()
}
