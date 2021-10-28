import {
  ADDRESS_ZERO,
  CONCENTRATED_LIQUIDITY_POOL_FACTORY_ADDRESS,
  CONSTANT_PRODUCT_POOL_FACTORY_ADDRESS,
  HYBRID_POOL_FACTORY_ADDRESS,
  INDEX_POOL_FACTORY_ADDRESS,
  MASTER_DEPLOYER_ADDRESS,
} from '../constants/addresses'
import {
  AddToWhitelist,
  BarFeeUpdated,
  DeployPool,
  RemoveFromWhitelist,
  TransferOwner,
  TransferOwnerClaim,
} from '../../generated/MasterDeployer/MasterDeployer'
import { ConstantProductPool, HybridPool, IndexPool } from '../../generated/templates'
import {
  createConstantProductPool,
  getOrCreateHybridPool,
  getOrCreateIndexPool,
  getOrCreateMasterDeployer,
} from '../functions'
import { log, store } from '@graphprotocol/graph-ts'

import { WhitelistedFactory } from '../../generated/schema'

export function onDeployPool(event: DeployPool): void {
  log.debug('[MasterDeployer] onDeployPool...', [])

  getOrCreateMasterDeployer(event.address)

  if (event.params.factory == CONSTANT_PRODUCT_POOL_FACTORY_ADDRESS) {
    createConstantProductPool(event.params)
    ConstantProductPool.create(event.params.pool)
  } else if (event.params.factory == CONCENTRATED_LIQUIDITY_POOL_FACTORY_ADDRESS) {
    getOrCreateIndexPool(event.params.pool)
    IndexPool.create(event.params.pool)
  } else if (event.params.factory == HYBRID_POOL_FACTORY_ADDRESS) {
    getOrCreateHybridPool(event.params.pool)
    HybridPool.create(event.params.pool)
  } else if (event.params.factory == INDEX_POOL_FACTORY_ADDRESS) {
    getOrCreateIndexPool(event.params.pool)
    IndexPool.create(event.params.pool)
  }
}

export function onTransferOwner(event: TransferOwner): void {
  log.debug('[MasterDeployer] onTransferOwner...', [])
  const masterDeployer = getOrCreateMasterDeployer(event.address)
  masterDeployer.previousOwner = event.params.sender
  if (masterDeployer.pendingOwner == event.params.recipient) {
    masterDeployer.pendingOwner = ADDRESS_ZERO
  }
  masterDeployer.owner = event.params.recipient
  masterDeployer.save()
}

export function onTransferOwnerClaim(event: TransferOwnerClaim): void {
  log.debug('[MasterDeployer] onTransferOwnerClaim...', [])
  const masterDeployer = getOrCreateMasterDeployer(event.address)
  masterDeployer.previousOwner = event.params.sender
  masterDeployer.pendingOwner = event.params.recipient
  masterDeployer.save()
}

export function onAddToWhitelist(event: AddToWhitelist): void {
  log.debug('[MasterDeployer] onAddToWhitelist...', [])

  let whitelistedFactory = WhitelistedFactory.load(event.params.factory.toHex())

  if (whitelistedFactory === null) {
    whitelistedFactory = new WhitelistedFactory(event.params.factory.toHex())
    whitelistedFactory.masterDeployer = MASTER_DEPLOYER_ADDRESS.toHex()
  }

  whitelistedFactory.save()
}

export function onRemoveFromWhitelist(event: RemoveFromWhitelist): void {
  log.debug('[MasterDeployer] onRemoveFromWhitelist...', [])
  store.remove('WhitelistedFactory', event.params.factory.toHex())
}

export function onBarFeeUpdated(event: BarFeeUpdated): void {
  log.debug('[MasterDeployer] onBarFeeUpdated...', [])
  const masterDeployer = getOrCreateMasterDeployer(event.address)
  masterDeployer.barFee = event.params.barFee
  masterDeployer.save()
}
