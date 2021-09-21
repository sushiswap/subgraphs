import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import {
  CONSTANT_PRODUCT_POOL_FACTORY_ADDRESS,
  MASTER_DEPLOYER_ADDRESS,
} from "../constants";
import {
  ConstantProductPool,
  ConstantProductPoolFactory,
  MasterDeployer,
  Transaction,
} from "../../generated/schema";

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

    pool = new ConstantProductPool(id.toHex());
    pool.factory = factory.id;

    pool.reserve0 = BigInt.fromI32(0);
    pool.reserve1 = BigInt.fromI32(0);
    pool.totalSupply = BigInt.fromI32(0);

    pool.transactionLength = BigInt.fromI32(0);

    pool.save();

    factory.poolLength = factory.poolLength.plus(BigInt.fromI32(1));
    factory.save();
  }

  return pool as ConstantProductPool;
}

export function getOrCreateTransaction(event: ethereum.Event): Transaction {
  let transaction = Transaction.load(event.transaction.hash.toHexString());

  if (transaction === null) {
    transaction = new Transaction(event.transaction.hash.toHexString());
  }

  transaction.block = event.block.number;
  transaction.timestamp = event.block.timestamp;
  //   transaction.gasUsed = event.block.gasUsed;
  transaction.gasLimit = event.transaction.gasLimit;
  transaction.gasPrice = event.transaction.gasPrice;
  transaction.save();

  return transaction as Transaction;
}
