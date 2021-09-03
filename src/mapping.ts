import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import {
  ConstantProductPool,
  ConstantProductPoolFactory,
  MasterDeployer,
} from "../generated/schema";
import {
  MasterDeployer as MasterDeployerContract,
  NewPoolCreated,
} from "../generated/MasterDeployer/MasterDeployer";

function getOrCreateMasterDeployer(id: Address): MasterDeployer {
  let masterDeployer = MasterDeployer.load(id.toHex());

  if (masterDeployer == null) {
    masterDeployer = new MasterDeployer(id.toHex());
    masterDeployer.factoryLength = BigInt.fromI32(0);
    masterDeployer.save();
  }

  return masterDeployer as MasterDeployer;
}

function getOrCreateConstantProductPoolFactory(
  id: Address
): ConstantProductPoolFactory {
  let factory = ConstantProductPoolFactory.load(id.toHex());

  if (factory == null) {
    factory = new ConstantProductPoolFactory(id.toHex());
    factory.poolLength = BigInt.fromI32(0);
    factory.save();
  }

  return factory as ConstantProductPoolFactory;
}

function getOrCreateConstantProductPool(id: Address): ConstantProductPool {
  let pool = ConstantProductPool.load(id.toHex());

  if (pool == null) {
    pool = new ConstantProductPool(id.toHex());
    pool.factory = CONSTANT_PRODUCT_POOL_FACTORY_ADDRESS.toHex();
    pool.save();
  }

  return pool as ConstantProductPool;
}

const CONSTANT_PRODUCT_POOL_FACTORY_ADDRESS = Address.fromString("");
const CONCENTRATED_LIQUIDITY_FACTORY_ADDRESS = Address.fromString("");

export function handleNewPoolCreated(event: NewPoolCreated): void {
  const masterDeployer = getOrCreateMasterDeployer(event.transaction.from);

  let pool;

  if (event.params._factory == CONSTANT_PRODUCT_POOL_FACTORY_ADDRESS) {
    pool = getOrCreateConstantProductPool(event.params.pool);
  }
}
