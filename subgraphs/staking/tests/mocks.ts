import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts'
import { createMockedFunction, newMockEvent } from 'matchstick-as'
import {
  Claim as ClaimEvent,
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
  let event = changetype<IncentiveCreatedEvent>(newMockEvent())
  event.parameters = new Array()
  
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
  let event = changetype<IncentiveUpdatedEvent>(newMockEvent())
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
  let event = changetype<StakeEvent>(newMockEvent())
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
  let event = changetype<UnstakeEvent>(newMockEvent())
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
  let event = changetype<SubscribeEvent>(newMockEvent())
  event.parameters = new Array()

  let idParam = new ethereum.EventParam('id', ethereum.Value.fromUnsignedBigInt(id))
  let userParam = new ethereum.EventParam('user', ethereum.Value.fromAddress(user))
  event.parameters.push(idParam)
  event.parameters.push(userParam)

  return event
}

export function createUnsubscribeEvent(id: BigInt, user: Address): UnSubscribeEvent {
  let event = changetype<UnSubscribeEvent>(newMockEvent())
  event.parameters = new Array()

  let idParam = new ethereum.EventParam('id', ethereum.Value.fromUnsignedBigInt(id))
  let userParam = new ethereum.EventParam('user', ethereum.Value.fromAddress(user))
  event.parameters.push(idParam)
  event.parameters.push(userParam)

  return event
}

export function createClaimEvent(id: BigInt, user: Address, amount: BigInt): ClaimEvent {
  let event = changetype<ClaimEvent>(newMockEvent())
  event.parameters = new Array()

  let idParam = new ethereum.EventParam('id', ethereum.Value.fromUnsignedBigInt(id))
  let userParam = new ethereum.EventParam('user', ethereum.Value.fromAddress(user))
  let amountParam = new ethereum.EventParam('amount', ethereum.Value.fromUnsignedBigInt(amount))
  event.parameters.push(idParam)
  event.parameters.push(userParam)
  event.parameters.push(amountParam)

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
