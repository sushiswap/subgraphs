import { Address, BigInt, ethereum, log } from "@graphprotocol/graph-ts";
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

const MASTER_DEPLOYER_ADDRESS = Address.fromString(
  "0xa2A7Aa74cb94f37221FD49F5BA6F3fF876092700"
);

const CONSTANT_PRODUCT_POOL_FACTORY_ADDRESS = Address.fromString(
  "0x5e343eD1586e13d5e34A204667FAb0D81F85a2c2"
);

const HYBRID_POOL_FACTORY_ADDRESS = Address.fromString(
  "0x0FaBb19C1362cbdd83a13D9b53F54934b05fC771"
);

const INDEX_POOL_FACTORY_ADDRESS = Address.fromString(
  "0x6c27a62230B46BF52084C8110b05FEd34e480489"
);

// const CONCENTRATED_LIQUIDITY_POOL_FACTORY_ADDRESS = Address.fromString("");

export function getOrCreateMasterDeployer(id: Address): MasterDeployer {
  let masterDeployer = MasterDeployer.load(id.toHex());

  if (masterDeployer == null) {
    masterDeployer = new MasterDeployer(id.toHex());
    masterDeployer.factoryLength = BigInt.fromI32(0);
    masterDeployer.save();
  }

  return masterDeployer as MasterDeployer;
}

export function getOrCreateConstantProductPoolFactory(): ConstantProductPoolFactory {
  let factory = ConstantProductPoolFactory.load(
    CONSTANT_PRODUCT_POOL_FACTORY_ADDRESS.toHex()
  );

  if (factory == null) {
    factory = new ConstantProductPoolFactory(
      CONSTANT_PRODUCT_POOL_FACTORY_ADDRESS.toHex()
    );
    factory.poolLength = BigInt.fromI32(0);
    factory.save();

    const masterDeployer = getOrCreateMasterDeployer(MASTER_DEPLOYER_ADDRESS);
    masterDeployer.factoryLength = masterDeployer.factoryLength.plus(
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

  if (pool == null) {
    const factory = getOrCreateConstantProductPoolFactory();

    getOrCreateConstantProductPool(id);

    pool = new ConstantProductPool(id.toHex());
    pool.factory = factory.id;

    pool.reserve0 = BigInt.fromI32(0);
    pool.reserve1 = BigInt.fromI32(0);
    pool.totalSupply = BigInt.fromI32(0);

    pool.txCount = BigInt.fromI32(0);

    pool.save();

    factory.poolLength = factory.poolLength.plus(BigInt.fromI32(1));
    factory.save();
  }

  return pool as ConstantProductPool;
}

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
