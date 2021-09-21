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
  getOrCreateConstantProductPool,
  getOrCreateMasterDeployer,
} from "../functions";

import { ConstantProductPool as ConstantProductPoolTemplate } from "../../generated/templates";
import { log } from "@graphprotocol/graph-ts";

export function onDeployPool(event: DeployPool): void {
  log.debug("[MasterDeployer] onDeployPool...", []);

  getOrCreateMasterDeployer(event.address);

  if (event.params._factory == CONSTANT_PRODUCT_POOL_FACTORY_ADDRESS) {
    getOrCreateConstantProductPool(event.params.pool);
    ConstantProductPoolTemplate.create(event.params.pool);
  } else if (event.params._factory == HYBRID_POOL_FACTORY_ADDRESS) {
    //
  } else if (event.params._factory == INDEX_POOL_FACTORY_ADDRESS) {
    //
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
}

export function onMigratorUpdated(event: MigratorUpdated): void {
  log.debug("[MasterDeployer] onMigratorUpdated...", []);
}
