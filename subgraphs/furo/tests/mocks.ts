import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts'
import { createMockedFunction, newMockEvent } from 'matchstick-as'
import {
  CancelStream as CancelStreamEvent,
  CreateStream as CreateStreamEvent,
  UpdateStream as UpdateStreamEvent,
  Transfer as TransferStreamEvent,
  Withdraw as WithdrawStreamEvent,
} from '../generated/FuroStream/FuroStream'
import {
  CancelVesting as CancelVestingEvent,
  CreateVesting as CreateVestingEvent,
  Transfer as TransferVestingEvent,
  Withdraw as WithdrawVestingEvent,
} from '../generated/FuroVesting/FuroVesting'


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

export function createWithdrawStreamEvent(
  streamId: BigInt,
  sharesToWithdraw: BigInt,
  withdrawTo: Address,
  token: Address,
  toBentoBox: boolean
): WithdrawStreamEvent {
  let mockEvent = newMockEvent()

  let event = new WithdrawStreamEvent(
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

export function createTransferStreamEvent(
  from: Address,
  to: Address,
  id: BigInt
): TransferStreamEvent {
  let mockEvent = newMockEvent()

  let event = new TransferStreamEvent(
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
  let idParam = new ethereum.EventParam('id', ethereum.Value.fromUnsignedBigInt(id))

  event.parameters.push(fromParam)
  event.parameters.push(toParam)
  event.parameters.push(idParam)

  return event
}

export function createVestingEvent(
  vestId: BigInt,
  token: Address,
  sender: Address,
  recipient: Address,
  startTime: BigInt,
  cliffDuration: BigInt,
  stepDuration: BigInt,
  steps: BigInt,
  cliffAmount: BigInt,
  stepAmount: BigInt,
  fromBentoBox: boolean
): CreateVestingEvent {
  let mockEvent = newMockEvent()

  let event = new CreateVestingEvent(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  )

  event.parameters = new Array()
  let vestIdParam = new ethereum.EventParam('vestId', ethereum.Value.fromUnsignedBigInt(vestId))
  let tokenParam = new ethereum.EventParam('token', ethereum.Value.fromAddress(token))
  let senderParam = new ethereum.EventParam('sender', ethereum.Value.fromAddress(sender))
  let recipientParam = new ethereum.EventParam('recipient', ethereum.Value.fromAddress(recipient))
  let startTimeParam = new ethereum.EventParam('startTime', ethereum.Value.fromUnsignedBigInt(startTime))
  let cliffDurationParam = new ethereum.EventParam('cliffDuration', ethereum.Value.fromUnsignedBigInt(cliffDuration))
  let stepDurationParam = new ethereum.EventParam('stepDuration', ethereum.Value.fromUnsignedBigInt(stepDuration))
  let stepsParam = new ethereum.EventParam('steps', ethereum.Value.fromUnsignedBigInt(steps))
  let cliffAmountParam = new ethereum.EventParam('cliffAmount', ethereum.Value.fromUnsignedBigInt(cliffAmount))
  let stepAmountParam = new ethereum.EventParam('stepAmount', ethereum.Value.fromUnsignedBigInt(stepAmount))
  let fromBentoBoxParam = new ethereum.EventParam('fromBentoBox', ethereum.Value.fromBoolean(fromBentoBox))

  event.parameters.push(vestIdParam)
  event.parameters.push(tokenParam)
  event.parameters.push(senderParam)
  event.parameters.push(recipientParam)
  event.parameters.push(startTimeParam)
  event.parameters.push(cliffDurationParam)
  event.parameters.push(stepDurationParam)
  event.parameters.push(stepsParam)
  event.parameters.push(cliffAmountParam)
  event.parameters.push(stepAmountParam)
  event.parameters.push(fromBentoBoxParam)

  return event
}

export function createWithdrawVestingEvent(
  vestId: BigInt,
  token: Address,
  amount: BigInt,
  toBentoBox: boolean
): WithdrawVestingEvent {
  let mockEvent = newMockEvent()

  let event = new WithdrawVestingEvent(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  )

  event.parameters = new Array()
  let vestIdParam = new ethereum.EventParam('vestId', ethereum.Value.fromUnsignedBigInt(vestId))
  let tokenParam = new ethereum.EventParam('token', ethereum.Value.fromAddress(token))
  let amountParam = new ethereum.EventParam('amount', ethereum.Value.fromUnsignedBigInt(amount))
  let toBentoBoxParam = new ethereum.EventParam('toBentoBox', ethereum.Value.fromBoolean(toBentoBox))

  event.parameters.push(vestIdParam)
  event.parameters.push(tokenParam)
  event.parameters.push(amountParam)
  event.parameters.push(toBentoBoxParam)

  return event
}

export function createCancelVestingEvent(
  vestId: BigInt,
  ownerAmount: BigInt,
  recipientAmount: BigInt,
  token: Address,
  toBentoBox: boolean
): CancelVestingEvent {
  let mockEvent = newMockEvent()

  let event = new CancelVestingEvent(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  )

  event.parameters = new Array()
  let vestIdParam = new ethereum.EventParam('vestId', ethereum.Value.fromUnsignedBigInt(vestId))
  let ownerAmountParam = new ethereum.EventParam('ownerAmount', ethereum.Value.fromUnsignedBigInt(ownerAmount))
  let recipientAmountParam = new ethereum.EventParam(
    'recipientAmount',
    ethereum.Value.fromUnsignedBigInt(recipientAmount)
  )
  let tokenParam = new ethereum.EventParam('token', ethereum.Value.fromAddress(token))
  let toBentoBoxParam = new ethereum.EventParam('toBentoBox', ethereum.Value.fromBoolean(toBentoBox))

  event.parameters.push(vestIdParam)
  event.parameters.push(ownerAmountParam)
  event.parameters.push(recipientAmountParam)
  event.parameters.push(tokenParam)
  event.parameters.push(toBentoBoxParam)

  return event
}

export function createTransferVestingEvent(
  from: Address,
  to: Address,
  tokenId: BigInt
): TransferVestingEvent {
  let mockEvent = newMockEvent()

  let event = new TransferVestingEvent(
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
