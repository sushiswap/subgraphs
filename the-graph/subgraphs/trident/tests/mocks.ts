import { Address, BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts'
import { newMockEvent } from 'matchstick-as'
import { AddToWhitelist, BarFeeUpdated, DeployPool } from '../generated/MasterDeployer/MasterDeployer'


export function createBarFeeUpdatedEvent(fee: number, ownerAddress: Address): BarFeeUpdated {
  let mockEvent = newMockEvent()
  let event = new BarFeeUpdated(
    ownerAddress,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  )
  event.parameters = new Array()
  let feeParam = new ethereum.EventParam('barFee', ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(0)))
  event.parameters.push(feeParam)

  return event
}

export function createAddToWhitelistEvent(factory: Address, ownerAddress: Address): AddToWhitelist {
  let mockEvent = newMockEvent()
  let event = new AddToWhitelist(
    ownerAddress,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  )
  event.parameters = new Array()
  let factoryParam = new ethereum.EventParam('_factory', ethereum.Value.fromAddress(factory))
  event.parameters.push(factoryParam)

  return event
}

export function createDeployPoolEvent(
  pool: Address,
  masterDeployAddress: Address,
  factory: Address,
  deployData: Bytes,
): DeployPool {
  let mockEvent = newMockEvent()
  let event = new DeployPool(
    masterDeployAddress,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  )
  event.parameters = new Array()
  let factoryParam = new ethereum.EventParam('factory', ethereum.Value.fromAddress(factory))
  let poolParam = new ethereum.EventParam('pool', ethereum.Value.fromAddress(pool))
  let deployDataParam = new ethereum.EventParam('deployData', ethereum.Value.fromBytes(deployData))
  event.parameters.push(factoryParam)
  event.parameters.push(poolParam)
  event.parameters.push(deployDataParam)

  return event
}

export function createMintEvent(): DeployPool {
  let mockEvent = newMockEvent()
  let event = new DeployPool(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  )
  event.parameters = new Array()
  let addressParam = new ethereum.EventParam('address', ethereum.Value.fromAddress(mockEvent.address))
  event.parameters.push(addressParam)

  return event
}


