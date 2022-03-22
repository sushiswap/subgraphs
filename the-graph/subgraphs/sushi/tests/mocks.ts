import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts'
import { newMockEvent } from 'matchstick-as'
import { Transfer as TransferEvent } from '../generated/Sushi/Sushi'

export function createTransferEvent(from: Address, to: Address, value: BigInt): TransferEvent {
  let mockEvent = newMockEvent()
  let event = new TransferEvent(
    from,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  )
  event.parameters = new Array()

  let tokenParam = new ethereum.EventParam('from', ethereum.Value.fromAddress(from))
  let userParam = new ethereum.EventParam('to', ethereum.Value.fromAddress(to))
  let valueParam = new ethereum.EventParam('value', ethereum.Value.fromUnsignedBigInt(value))
  event.parameters.push(tokenParam)
  event.parameters.push(userParam)
  event.parameters.push(valueParam)

  return event
}
