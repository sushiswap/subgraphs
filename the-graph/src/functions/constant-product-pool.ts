import { Address, BigInt } from "@graphprotocol/graph-ts";
import {
  CONSTANT_PRODUCT_POOL_FACTORY_ADDRESS,
  MASTER_DEPLOYER_ADDRESS,
} from "../constants";
import {
  ConstantProductPool,
  ConstantProductPoolFactory,
} from "../../generated/schema";

import { ConstantProductPool as ConstantProductPoolContract } from "../../generated/templates/ConstantProductPool/ConstantProductPool";
import { getOrCreateMasterDeployer } from "./master-deployer";
import { getOrCreateToken } from "./token";

export function getOrCreateConstantProductPoolFactory(): ConstantProductPoolFactory {
  let factory = ConstantProductPoolFactory.load(
    CONSTANT_PRODUCT_POOL_FACTORY_ADDRESS.toHex()
  );

  if (factory === null) {
    factory = new ConstantProductPoolFactory(
      CONSTANT_PRODUCT_POOL_FACTORY_ADDRESS.toHex()
    );
    factory.masterDeployer = MASTER_DEPLOYER_ADDRESS.toHex();
    factory.save();

    const masterDeployer = getOrCreateMasterDeployer(MASTER_DEPLOYER_ADDRESS);
    masterDeployer.factoryCount = masterDeployer.factoryCount.plus(
      BigInt.fromI32(1)
    );
    masterDeployer.save();
  }

  return factory as ConstantProductPoolFactory;
}

export function getOrCreateConstantProductPool(
  id: Address
): ConstantProductPool {
  let pool = ConstantProductPool.load(id.toHex());

  if (pool === null) {
    const contract = ConstantProductPoolContract.bind(id);
    const factory = getOrCreateConstantProductPoolFactory();
    pool = new ConstantProductPool(id.toHex());
    pool.masterDeployer = MASTER_DEPLOYER_ADDRESS.toHex();
    pool.factory = factory.id;
    pool.token0 = getOrCreateToken(contract.token0()).id;
    pool.token1 = getOrCreateToken(contract.token1()).id;
    pool.save();
    factory.poolCount = factory.poolCount.plus(BigInt.fromI32(1));
    factory.save();
  }

  return pool as ConstantProductPool;
}
