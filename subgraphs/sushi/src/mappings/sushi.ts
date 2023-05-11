import { Transfer as TransferEvent } from '../../generated/Sushi/Sushi'
import { ADDRESS_ZERO } from '../constants'
import { UserType } from '../enums'
import { getOrCreateTransaction } from '../functions/transaction'
import { getOrCreateUser } from '../functions/user'

export function onTransfer(event: TransferEvent): void {
  const senderAddress = event.params.from
  let sender = getOrCreateUser(senderAddress.toHex(), event)
  sender.modifiedAtBlock = event.block.number
  sender.modifiedAtTimestamp = event.block.timestamp
  //we don't update balance of address(0) when minting
  if (senderAddress != ADDRESS_ZERO) {
    sender.balance = sender.balance.minus(event.params.value)
  }
  sender.save()

  const receiverAddress = event.params.to
  let receiver = getOrCreateUser(receiverAddress.toHex(), event)
  receiver.modifiedAtBlock = event.block.number
  receiver.modifiedAtTimestamp = event.block.timestamp
  //we don't update balance of address(0) when burning
  if (receiverAddress != ADDRESS_ZERO) {
    receiver.balance = receiver.balance.plus(event.params.value)
  }
  receiver.save()

  getOrCreateTransaction(event)
}
