import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import {
  ConstantProductPool,
  ConstantProductPoolFactory,
  MasterDeployer,
} from "../generated/schema";
import {
  DeployPool,
  MasterDeployer as MasterDeployerContract,
  TransferOwner,
  TransferOwnerClaim,
} from "../generated/MasterDeployer/MasterDeployer";

import { ConstantProductPool as ConstantProductPoolTemplate } from "../generated/templates";
import { log } from "@graphprotocol/graph-ts";

const MASTER_DEPLOYER_ADDRESS = Address.fromString(
  "0xa2A7Aa74cb94f37221FD49F5BA6F3fF876092700"
);

const CONSTANT_PRODUCT_POOL_FACTORY_ADDRESS = Address.fromString(
  "0x5e343eD1586e13d5e34A204667FAb0D81F85a2c2"
);

// const CONCENTRATED_LIQUIDITY_POOL_FACTORY_ADDRESS = Address.fromString("");

const HYBRID_POOL_FACTORY_ADDRESS = Address.fromString(
  "0x0FaBb19C1362cbdd83a13D9b53F54934b05fC771"
);

const INDEX_POOL_FACTORY_ADDRESS = Address.fromString(
  "0x6c27a62230B46BF52084C8110b05FEd34e480489"
);

function getOrCreateMasterDeployer(): MasterDeployer {
  let masterDeployer = MasterDeployer.load(MASTER_DEPLOYER_ADDRESS.toHex());

  if (masterDeployer == null) {
    masterDeployer = new MasterDeployer(MASTER_DEPLOYER_ADDRESS.toHex());
    masterDeployer.factoryLength = BigInt.fromI32(0);
    masterDeployer.save();
  }

  return masterDeployer as MasterDeployer;
}

function getOrCreateConstantProductPoolFactory(): ConstantProductPoolFactory {
  let factory = ConstantProductPoolFactory.load(
    CONSTANT_PRODUCT_POOL_FACTORY_ADDRESS.toHex()
  );

  if (factory == null) {
    factory = new ConstantProductPoolFactory(
      CONSTANT_PRODUCT_POOL_FACTORY_ADDRESS.toHex()
    );
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

export function onDeployPool(event: DeployPool): void {
  log.info("onDeployPool...", []);

  getOrCreateMasterDeployer();

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
  log.info("onTransferOwner...", []);
}

export function onTransferOwnerClaim(event: TransferOwnerClaim): void {
  log.info("onTransferOwnerClaim...", []);
}
