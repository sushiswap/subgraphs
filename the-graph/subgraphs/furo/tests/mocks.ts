import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts'
import { createMockedFunction, newMockEvent } from 'matchstick-as'
import {
  LogCancelStream as CancelStreamEvent,
  LogCreateStream as CreateStreamEvent,
  LogWithdrawFromStream as WithdrawEvent,
} from '../generated/FuroStream/FuroStream'

export function createStreamEvent(
  streamId: BigInt,
  sender: Address,
  recipient: Address,
  token: Address,
  amount: BigInt,
  startTime: BigInt,
  endTime: BigInt,
  fromBentoBox: boolean
): CreateStreamEvent {
  let mockEvent = newMockEvent()

  let event = new CreateStreamEvent(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  )

  event.parameters = new Array()
  let streamIdParam = new ethereum.EventParam('streamId', ethereum.Value.fromUnsignedBigInt(streamId))
  let senderParam = new ethereum.EventParam('sender', ethereum.Value.fromAddress(sender))
  let recipientParam = new ethereum.EventParam('recipient', ethereum.Value.fromAddress(recipient))
  let tokenParam = new ethereum.EventParam('token', ethereum.Value.fromAddress(token))
  let amountParam = new ethereum.EventParam('amount', ethereum.Value.fromUnsignedBigInt(amount))
  let startTimeParam = new ethereum.EventParam('startTime', ethereum.Value.fromUnsignedBigInt(startTime))
  let endTimeParam = new ethereum.EventParam('endTime', ethereum.Value.fromUnsignedBigInt(endTime))
  let fromBentoBoxParam = new ethereum.EventParam('fromBentoBox', ethereum.Value.fromBoolean(fromBentoBox))

  event.parameters.push(streamIdParam)
  event.parameters.push(senderParam)
  event.parameters.push(recipientParam)
  event.parameters.push(tokenParam)
  event.parameters.push(amountParam)
  event.parameters.push(startTimeParam)
  event.parameters.push(endTimeParam)
  event.parameters.push(fromBentoBoxParam)

  return event
}

export function createWithdrawEvent(
  streamId: BigInt,
  sharesToWithdraw: BigInt,
  withdrawTo: Address,
  token: Address,
  toBentoBox: boolean
): WithdrawEvent {
  let mockEvent = newMockEvent()

  let event = new WithdrawEvent(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  )

  event.parameters = new Array()
  let streamIdParam = new ethereum.EventParam('streamId', ethereum.Value.fromUnsignedBigInt(streamId))
  let sharesToWithdrawParam = new ethereum.EventParam(
    'sharesToWithdraw',
    ethereum.Value.fromUnsignedBigInt(sharesToWithdraw)
  )
  let withdrawToParam = new ethereum.EventParam('withdrawTo', ethereum.Value.fromAddress(withdrawTo))
  let tokenParam = new ethereum.EventParam('token', ethereum.Value.fromAddress(token))
  let toBentoBoxParam = new ethereum.EventParam('toBentoBox', ethereum.Value.fromBoolean(toBentoBox))

  event.parameters.push(streamIdParam)
  event.parameters.push(withdrawToParam)
  event.parameters.push(tokenParam)
  event.parameters.push(sharesToWithdrawParam)
  event.parameters.push(toBentoBoxParam)

  return event
}

export function createCancelStreamEvent(
  streamId: BigInt,
  senderBalance: BigInt,
  recipientBalance: BigInt,
  token: Address,
  toBentoBox: boolean
): CancelStreamEvent {
  let mockEvent = newMockEvent()

  let event = new CancelStreamEvent(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  )

  event.parameters = new Array()
  let streamIdParam = new ethereum.EventParam('streamId', ethereum.Value.fromUnsignedBigInt(streamId))
  let senderBalanceParam = new ethereum.EventParam('senderBalance', ethereum.Value.fromUnsignedBigInt(senderBalance))
  let recipientBalanceParam = new ethereum.EventParam(
    'recipientBalance',
    ethereum.Value.fromUnsignedBigInt(recipientBalance)
  )
  let tokenParam = new ethereum.EventParam('token', ethereum.Value.fromAddress(token))
  let toBentoBoxParam = new ethereum.EventParam('toBentoBox', ethereum.Value.fromBoolean(toBentoBox))

  event.parameters.push(streamIdParam)
  event.parameters.push(recipientBalanceParam)
  event.parameters.push(tokenParam)
  event.parameters.push(senderBalanceParam)
  event.parameters.push(toBentoBoxParam)

  return event
}

export function createTokenMock(contractAddress: string, decimals: BigInt, name: string, symbol: string): void {
  createMockedFunction(Address.fromString(contractAddress), 'decimals', 'decimals():(uint8)').returns([
    ethereum.Value.fromUnsignedBigInt(decimals),
  ])
  createMockedFunction(Address.fromString(contractAddress), 'name', 'name():(string)').returns([
    ethereum.Value.fromString(name),
  ])
  createMockedFunction(Address.fromString(contractAddress), 'symbol', 'symbol():(string)').returns([
    ethereum.Value.fromString(symbol),
  ])
}
