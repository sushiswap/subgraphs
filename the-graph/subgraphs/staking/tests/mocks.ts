import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts'
import { newMockEvent } from 'matchstick-as'
import {
  IncentiveCreated as IncentiveCreatedEvent,
  IncentiveUpdated as IncentiveUpdatedEvent,
  Stake as StakeEvent,
  Subscribe as SubscribeEvent,
  Unstake as UnstakeEvent,
  Unsubscribe as UnSubscribeEvent,
} from '../generated/Staking/Staking'

export function createIncentiveCreatedEvent(
  token: Address,
  rewardToken: Address,
  creator: Address,
  id: BigInt,
  amount: BigInt,
  startTime: BigInt,
  endTime: BigInt
): IncentiveCreatedEvent {
  let mockEvent = newMockEvent()
  let event = new IncentiveCreatedEvent(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  )

  event.parameters = new Array()
  let tokenParam = new ethereum.EventParam('token', ethereum.Value.fromAddress(token))
  let rewardTokenParam = new ethereum.EventParam('rewardToken', ethereum.Value.fromAddress(rewardToken))
  let creatorParam = new ethereum.EventParam('creator', ethereum.Value.fromAddress(creator))
  let idParam = new ethereum.EventParam('id', ethereum.Value.fromUnsignedBigInt(id))
  let amountParam = new ethereum.EventParam('amount', ethereum.Value.fromUnsignedBigInt(amount))
  let startTimeParam = new ethereum.EventParam('startTime', ethereum.Value.fromUnsignedBigInt(startTime))
  let endTimeParam = new ethereum.EventParam('endTime', ethereum.Value.fromUnsignedBigInt(endTime))
  event.parameters.push(tokenParam)
  event.parameters.push(rewardTokenParam)
  event.parameters.push(creatorParam)
  event.parameters.push(idParam)
  event.parameters.push(amountParam)
  event.parameters.push(startTimeParam)
  event.parameters.push(endTimeParam)

  return event
}

export function createIncentiveUpdatedEvent(
  id: BigInt,
  amount: BigInt,
  startTime: BigInt,
  endTime: BigInt
): IncentiveUpdatedEvent {
  let mockEvent = newMockEvent()
  let event = new IncentiveUpdatedEvent(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  )

  event.parameters = new Array()
  let idParam = new ethereum.EventParam('id', ethereum.Value.fromUnsignedBigInt(id))
  let amountParam = new ethereum.EventParam('amount', ethereum.Value.fromUnsignedBigInt(amount))
  let startTimeParam = new ethereum.EventParam('startTime', ethereum.Value.fromUnsignedBigInt(startTime))
  let endTimeParam = new ethereum.EventParam('endTime', ethereum.Value.fromUnsignedBigInt(endTime))
  event.parameters.push(idParam)
  event.parameters.push(amountParam)
  event.parameters.push(startTimeParam)
  event.parameters.push(endTimeParam)

  return event
}

export function createStakeEvent(token: Address, user: Address, amount: BigInt): StakeEvent {
  let mockEvent = newMockEvent()
  let event = new StakeEvent(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  )

  event.parameters = new Array()
  let tokenParam = new ethereum.EventParam('token', ethereum.Value.fromAddress(token))
  let userParam = new ethereum.EventParam('user', ethereum.Value.fromAddress(user))
  let amountParam = new ethereum.EventParam('amount', ethereum.Value.fromUnsignedBigInt(amount))
  event.parameters.push(tokenParam)
  event.parameters.push(userParam)
  event.parameters.push(amountParam)

  return event
}

export function createUnstakeEvent(token: Address, user: Address, amount: BigInt): UnstakeEvent {
  let mockEvent = newMockEvent()
  let event = new UnstakeEvent(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  )

  event.parameters = new Array()
  let tokenParam = new ethereum.EventParam('token', ethereum.Value.fromAddress(token))
  let userParam = new ethereum.EventParam('user', ethereum.Value.fromAddress(user))
  let amountParam = new ethereum.EventParam('amount', ethereum.Value.fromUnsignedBigInt(amount))
  event.parameters.push(tokenParam)
  event.parameters.push(userParam)
  event.parameters.push(amountParam)

  return event
}

export function createSubscribeEvent(id: BigInt, user: Address): SubscribeEvent {
  let mockEvent = newMockEvent()
  let event = new SubscribeEvent(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  )

  event.parameters = new Array()
  let idParam = new ethereum.EventParam('id', ethereum.Value.fromUnsignedBigInt(id))
  let userParam = new ethereum.EventParam('user', ethereum.Value.fromAddress(user))
  event.parameters.push(idParam)
  event.parameters.push(userParam)

  return event
}

export function createUnsubscribeEvent(id: BigInt, user: Address): UnSubscribeEvent {
  let mockEvent = newMockEvent()
  let event = new UnSubscribeEvent(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  )

  event.parameters = new Array()
  let idParam = new ethereum.EventParam('id', ethereum.Value.fromUnsignedBigInt(id))
  let userParam = new ethereum.EventParam('user', ethereum.Value.fromAddress(user))
  event.parameters.push(idParam)
  event.parameters.push(userParam)

  return event
}
