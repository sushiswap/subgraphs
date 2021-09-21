import { Address, BigInt, ethereum, log } from "@graphprotocol/graph-ts";
import {
  CONSTANT_PRODUCT_POOL_FACTORY_ADDRESS,
  HYBRID_POOL_FACTORY_ADDRESS,
  INDEX_POOL_FACTORY_ADDRESS,
  MASTER_DEPLOYER_ADDRESS,
} from "../constants";
import {
  DeployPool,
  TransferOwner,
  TransferOwnerClaim,
} from "../../generated/MasterDeployer/MasterDeployer";
import {
  getOrCreateConstantProductPool,
  getOrCreateConstantProductPoolFactory,
  getOrCreateMasterDeployer,
} from "../functions";

import { ConstantProductPool as ConstantProductPoolTemplate } from "../../generated/templates";

export function onDeployPool(event: DeployPool): void {
  log.debug("onDeployPool...", []);

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
  log.debug("onTransferOwner...", []);
}

export function onTransferOwnerClaim(event: TransferOwnerClaim): void {
  log.debug("onTransferOwnerClaim...", []);
}
