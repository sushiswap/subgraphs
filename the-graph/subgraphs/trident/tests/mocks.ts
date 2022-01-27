import { Address, Bytes, ethereum } from '@graphprotocol/graph-ts'
import { newMockEvent } from 'matchstick-as'
import { AddToWhitelist, DeployPool, RemoveFromWhitelist } from '../generated/MasterDeployer/MasterDeployer'


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

export function createRemoveWhitelistEvent(factory: Address, ownerAddress: Address): RemoveFromWhitelist {
  let mockEvent = newMockEvent()
  let event = new RemoveFromWhitelist(
    ownerAddress,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  )
  event.parameters = new Array()
  let factoryParam = new ethereum.EventParam('factory', ethereum.Value.fromAddress(factory))
  event.parameters.push(factoryParam)

  return event
}


