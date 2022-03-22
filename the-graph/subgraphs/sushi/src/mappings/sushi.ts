import { Transfer as TransferEvent } from '../../generated/Sushi/Sushi'
import { getOrCreateTransaction } from './functions/transaction'
import { getOrCreateUser } from './functions/user'
import { UserType } from './functions/user-type'

export function onTransfer(event: TransferEvent): void {
  let sender = getOrCreateUser(UserType.SENDER, event)
  let reciever = getOrCreateUser(UserType.RECIEVER, event)
  getOrCreateTransaction(event)

  sender.balance = sender.balance.minus(event.params.value)
  sender.modifiedBlock = event.block.number
  sender.modifiedTimestamp = event.block.timestamp
  sender.save()

  reciever.balance = reciever.balance.plus(event.params.value)
  reciever.modifiedBlock = event.block.number
  reciever.modifiedTimestamp = event.block.timestamp
  reciever.save()
}
