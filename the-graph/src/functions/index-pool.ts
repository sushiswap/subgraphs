import { Address, BigInt } from "@graphprotocol/graph-ts";
import {
  INDEX_POOL_FACTORY_ADDRESS,
  MASTER_DEPLOYER_ADDRESS,
} from "../constants";
import { IndexPool, IndexPoolFactory } from "../../generated/schema";

import { getOrCreateMasterDeployer } from "./master-deployer";

export function getOrCreateIndexPoolFactory(): IndexPoolFactory {
  let factory = IndexPoolFactory.load(INDEX_POOL_FACTORY_ADDRESS.toHex());

  if (factory === null) {
    factory = new IndexPoolFactory(INDEX_POOL_FACTORY_ADDRESS.toHex());
    factory.masterDeployer = MASTER_DEPLOYER_ADDRESS.toHex();
    factory.save();

    const masterDeployer = getOrCreateMasterDeployer(MASTER_DEPLOYER_ADDRESS);
    masterDeployer.factoryCount = masterDeployer.factoryCount.plus(
      BigInt.fromI32(1)
    );
    masterDeployer.save();
  }

  return factory as IndexPoolFactory;
}

export function getOrCreateIndexPool(id: Address): IndexPool {
  let pool = IndexPool.load(id.toHex());

  if (pool === null) {
    const factory = getOrCreateIndexPoolFactory();

    pool = new IndexPool(id.toHex());
    pool.masterDeployer = MASTER_DEPLOYER_ADDRESS.toHex();
    pool.factory = factory.id;
    pool.save();

    factory.poolCount = factory.poolCount.plus(BigInt.fromI32(1));
    factory.save();
  }

  return pool as IndexPool;
}
