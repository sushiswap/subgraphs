import { Address, BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts'
import { newMockEvent } from 'matchstick-as'
import { RoleAdminChanged, RoleGranted, RoleRevoked } from './AccessControls/AccessControls'
import { onAuctionTemplateAdded } from './mappings/market'
import { AuctionTemplateAdded, AuctionTemplateRemoved, MarketCreated } from './MISOMarket/MISOMarket'
import { AddedCommitment, AuctionCancelled, AuctionFinalized } from './templates/MisoAuction/MisoAuction'

export function createAddedCommitEvent(bidder: Address, commitment: BigInt): AddedCommitment {
  let mockEvent = newMockEvent()
  let event = new AddedCommitment(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  )
  event.parameters = new Array()
  let bidderParam = new ethereum.EventParam('bidder', ethereum.Value.fromAddress(bidder))
  let commitmentParam = new ethereum.EventParam('commitment', ethereum.Value.fromUnsignedBigInt(commitment))

  event.parameters.push(bidderParam)
  event.parameters.push(commitmentParam)

  return event
}

export function createAuctionFinalizedEvent(): AuctionFinalized {
  let mockEvent = newMockEvent()
  let event = new AuctionFinalized(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  )
  return event
}

export function createAuctionCancelledEvent(): AuctionCancelled {
  let mockEvent = newMockEvent()
  let event = new AuctionCancelled(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  )
  return event
}

export function createOnAuctionTemplateAddedEvent(newAuction: Address, templateId: BigInt): AuctionTemplateAdded {
  let mockEvent = newMockEvent()
  let event = new AuctionTemplateAdded(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  )
  event.parameters = new Array()
  let newAuctionparam = new ethereum.EventParam('newAuction', ethereum.Value.fromAddress(newAuction))
  let templateIdParam = new ethereum.EventParam('templateId', ethereum.Value.fromUnsignedBigInt(templateId))

  event.parameters.push(newAuctionparam)
  event.parameters.push(templateIdParam)

  return event
}

export function createAuctionTemplateRemovedEvent(auction: Address, templateId: BigInt): AuctionTemplateRemoved {
  let mockEvent = newMockEvent()
  let event = new AuctionTemplateRemoved(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  )
  event.parameters = new Array()
  let auctionParam = new ethereum.EventParam('auction', ethereum.Value.fromAddress(auction))
  let templateIdParam = new ethereum.EventParam('templateId', ethereum.Value.fromUnsignedBigInt(templateId))

  event.parameters.push(auctionParam)
  event.parameters.push(templateIdParam)

  return event
}

export function createMarketCreatedEvent(
  owner: Address,
  deployedBentoBox: Address,
  marketTemplate: Address
): MarketCreated {
  let mockEvent = newMockEvent()
  let event = new MarketCreated(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  )
  event.parameters = new Array()
  let ownerParam = new ethereum.EventParam('owner', ethereum.Value.fromAddress(owner))
  let addrParam = new ethereum.EventParam('addr', ethereum.Value.fromAddress(deployedBentoBox))
  let marketTemplateParam = new ethereum.EventParam('marketTemplate', ethereum.Value.fromAddress(marketTemplate))

  event.parameters.push(ownerParam)
  event.parameters.push(addrParam)
  event.parameters.push(marketTemplateParam)

  return event
}

export function createRoleAdminChangedEvent(
  role: Bytes,
  previousAdminRole: Bytes,
  newAdminRole: Bytes
): RoleAdminChanged {
  let mockEvent = newMockEvent()
  let event = new RoleAdminChanged(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  )
  event.parameters = new Array()
  let roleParam = new ethereum.EventParam('role', ethereum.Value.fromBytes(role))
  let previousAdminRoleParam = new ethereum.EventParam('previousAdminRole', ethereum.Value.fromBytes(previousAdminRole))
  let newAdminRoleParam = new ethereum.EventParam('newAdminRole', ethereum.Value.fromBytes(newAdminRole))

  event.parameters.push(roleParam)
  event.parameters.push(previousAdminRoleParam)
  event.parameters.push(newAdminRoleParam)

  return event
}

export function createRoleGrantedEvent(role: Bytes, account: Address, sender: Address): RoleGranted {
  let mockEvent = newMockEvent()
  let event = new RoleGranted(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  )
  event.parameters = new Array()
  let roleParam = new ethereum.EventParam('role', ethereum.Value.fromBytes(role))
  let accountParam = new ethereum.EventParam('account', ethereum.Value.fromAddress(account))
  let senderParam = new ethereum.EventParam('sender', ethereum.Value.fromAddress(sender))

  event.parameters.push(roleParam)
  event.parameters.push(accountParam)
  event.parameters.push(senderParam)

  return event
}

export function createRoleRevokedEvent(role: Bytes, account: Address, sender: Address): RoleRevoked {
  let mockEvent = newMockEvent()
  let event = new RoleRevoked(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  )
  event.parameters = new Array()
  let roleParam = new ethereum.EventParam('role', ethereum.Value.fromBytes(role))
  let accountParam = new ethereum.EventParam('account', ethereum.Value.fromAddress(account))
  let senderParam = new ethereum.EventParam('sender', ethereum.Value.fromAddress(sender))

  event.parameters.push(roleParam)
  event.parameters.push(accountParam)
  event.parameters.push(senderParam)

  return event
}
