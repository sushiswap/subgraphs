import {
  AddToWhitelist,
  BarFeeUpdated,
  DeployPool,
  MigratorUpdated,
  RemoveFromWhitelist,
  TransferOwner,
  TransferOwnerClaim,
} from "../../generated/MasterDeployer/MasterDeployer";
import {
  CONSTANT_PRODUCT_POOL_FACTORY_ADDRESS,
  HYBRID_POOL_FACTORY_ADDRESS,
  INDEX_POOL_FACTORY_ADDRESS,
} from "../constants";
import {
  ConstantProductPool,
  HybridPool,
  IndexPool,
} from "../../generated/templates";
import {
  getOrCreateConstantProductPool,
  getOrCreateHybridPool,
  getOrCreateIndexPool,
  getOrCreateMasterDeployer,
} from "../functions";

import { log } from "@graphprotocol/graph-ts";

export function onDeployPool(event: DeployPool): void {
  log.debug("[MasterDeployer] onDeployPool...", []);

  getOrCreateMasterDeployer(event.address);

  if (event.params._factory == CONSTANT_PRODUCT_POOL_FACTORY_ADDRESS) {
    getOrCreateConstantProductPool(event.params.pool);
    ConstantProductPool.create(event.params.pool);
  } else if (event.params._factory == HYBRID_POOL_FACTORY_ADDRESS) {
    getOrCreateHybridPool(event.params.pool);
    HybridPool.create(event.params.pool);
  } else if (event.params._factory == INDEX_POOL_FACTORY_ADDRESS) {
    getOrCreateIndexPool(event.params.pool);
    IndexPool.create(event.params.pool);
  }
}

export function onTransferOwner(event: TransferOwner): void {
  log.debug("[MasterDeployer] onTransferOwner...", []);
}

export function onTransferOwnerClaim(event: TransferOwnerClaim): void {
  log.debug("[MasterDeployer] onTransferOwnerClaim...", []);
}

export function onAddToWhitelist(event: AddToWhitelist): void {
  log.debug("[MasterDeployer] onAddToWhitelist...", []);
}

export function onRemoveFromWhitelist(event: RemoveFromWhitelist): void {
  log.debug("[MasterDeployer] onRemoveFromWhitelist...", []);
}

export function onBarFeeUpdated(event: BarFeeUpdated): void {
  log.debug("[MasterDeployer] onBarFeeUpdated...", []);
  const masterDeployer = getOrCreateMasterDeployer(event.address);
  masterDeployer.barFee = event.params._barFee;
  masterDeployer.save();
}

export function onMigratorUpdated(event: MigratorUpdated): void {
  log.debug("[MasterDeployer] onMigratorUpdated...", []);
  const masterDeployer = getOrCreateMasterDeployer(event.address);
  masterDeployer.migrator = event.params._migrator;
  masterDeployer.save();
}
