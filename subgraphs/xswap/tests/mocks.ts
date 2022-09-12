import { BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts'
import { newMockEvent } from 'matchstick-as'
import { Packet as PacketEvent } from '../generated/Stargate/Stargate'

export function createPacketEvent(chainId: u16, payload: Bytes): PacketEvent {
  let mockEvent = newMockEvent()
  let event = new PacketEvent(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  )
  event.parameters = new Array()

  let chainIdParam = new ethereum.EventParam('chainId', ethereum.Value.fromUnsignedBigInt(BigInt.fromU32(chainId)))
  let payloadParam = new ethereum.EventParam('payload', ethereum.Value.fromBytes(payload))
  event.parameters.push(chainIdParam)
  event.parameters.push(payloadParam)

  return event
}
