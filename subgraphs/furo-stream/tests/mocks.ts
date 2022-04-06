import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts'
import { createMockedFunction, newMockEvent } from 'matchstick-as'
import {
  CancelStream as CancelStreamEvent,
  CreateStream as CreateStreamEvent,
  UpdateStream as UpdateStreamEvent,
  Transfer as TransferEvent,
  Withdraw as WithdrawEvent,
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
  event.parameters.push(sharesToWithdrawParam)
  event.parameters.push(withdrawToParam)
  event.parameters.push(tokenParam)
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
  event.parameters.push(senderBalanceParam)
  event.parameters.push(recipientBalanceParam)
  event.parameters.push(tokenParam)
  event.parameters.push(toBentoBoxParam)

  return event
}

export function createUpdateStreamEvent(
  streamId: BigInt,
  topUpAmount: BigInt,
  extendTime: BigInt,
  fromBentoBox: boolean
): UpdateStreamEvent {
  let mockEvent = newMockEvent()

  let event = new UpdateStreamEvent(
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
  let topUpAmountParam = new ethereum.EventParam('topUpAmount', ethereum.Value.fromUnsignedBigInt(topUpAmount))
  let extendTimeParam = new ethereum.EventParam('extendTime', ethereum.Value.fromUnsignedBigInt(extendTime))
  let fromBentoBoxParam = new ethereum.EventParam('fromBentoBox', ethereum.Value.fromBoolean(fromBentoBox))

  event.parameters.push(streamIdParam)
  event.parameters.push(topUpAmountParam)
  event.parameters.push(extendTimeParam)
  event.parameters.push(fromBentoBoxParam)

  return event
}

export function createTransferEvent(
  from: Address,
  to: Address,
  tokenId: BigInt
): TransferEvent {
  let mockEvent = newMockEvent()

  let event = new TransferEvent(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  )

  event.parameters = new Array()
  let fromParam = new ethereum.EventParam('from', ethereum.Value.fromAddress(from))
  let toParam = new ethereum.EventParam('to', ethereum.Value.fromAddress(to))
  let tokenIdParam = new ethereum.EventParam('tokenId', ethereum.Value.fromUnsignedBigInt(tokenId))

  event.parameters.push(fromParam)
  event.parameters.push(toParam)
  event.parameters.push(tokenIdParam)

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
