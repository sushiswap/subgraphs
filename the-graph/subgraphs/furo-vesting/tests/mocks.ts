import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts'
import { createMockedFunction, newMockEvent } from 'matchstick-as'
import {
  CreateVesting as CreateVestingEvent,
  CancelVesting as CancelVestingEvent,
  Withdraw as WithdrawEvent,
} from '../generated/FuroVesting/FuroVesting'

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

export function createWithdrawEvent(
  vestId: BigInt,
  token: Address,
  amount: BigInt,
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
