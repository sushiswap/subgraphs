import {
  ADDRESS_ZERO,
  CONSTANT_PRODUCT_POOL_FACTORY_ADDRESS,
  HYBRID_POOL_FACTORY_ADDRESS,
  INDEX_POOL_FACTORY_ADDRESS,
  MASTER_DEPLOYER_ADDRESS,
} from "../constants";
import {
  Address,
  BigDecimal,
  BigInt,
  ByteArray,
  Bytes,
  crypto,
  ethereum,
  log,
} from "@graphprotocol/graph-ts";
import {
  ConstantProductPool,
  ConstantProductPoolFactory,
  HybridPool,
  HybridPoolFactory,
  IndexPool,
  IndexPoolFactory,
  MasterDeployer,
  Token,
  Transaction,
} from "../../generated/schema";

export function getOrCreateMasterDeployer(id: Address): MasterDeployer {
  let masterDeployer = MasterDeployer.load(id.toHex());

  if (masterDeployer === null) {
    masterDeployer = new MasterDeployer(id.toHex());
    masterDeployer.owner = ADDRESS_ZERO;
    masterDeployer.migrator = ADDRESS_ZERO;
    masterDeployer.barFee = BigInt.fromI32(0);
    masterDeployer.factoryCount = BigInt.fromI32(0);
    masterDeployer.save();
  }

  return masterDeployer as MasterDeployer;
}

export function getOrCreateConstantProductPoolFactory(): ConstantProductPoolFactory {
  let factory = ConstantProductPoolFactory.load(
    CONSTANT_PRODUCT_POOL_FACTORY_ADDRESS.toHex()
  );

  if (factory === null) {
    factory = new ConstantProductPoolFactory(
      CONSTANT_PRODUCT_POOL_FACTORY_ADDRESS.toHex()
    );
    factory.masterDeployer = MASTER_DEPLOYER_ADDRESS.toHex();
    factory.poolCount = BigInt.fromI32(0);
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
    const factory = getOrCreateConstantProductPoolFactory();
    pool = new ConstantProductPool(id.toHex());
    pool.masterDeployer = MASTER_DEPLOYER_ADDRESS.toHex();
    pool.factory = factory.id;
    pool.reserve0 = BigInt.fromI32(0);
    pool.reserve1 = BigInt.fromI32(0);
    pool.totalValueLocked = BigDecimal.zero();
    pool.volume = BigDecimal.zero();
    pool.totalSupply = BigInt.fromI32(0);
    pool.transactionCount = BigInt.fromI32(0);

    pool.save();

    factory.poolCount = factory.poolCount.plus(BigInt.fromI32(1));
    factory.save();
  }

  return pool as ConstantProductPool;
}

export function getOrCreateHybridPoolFactory(): HybridPoolFactory {
  let factory = HybridPoolFactory.load(HYBRID_POOL_FACTORY_ADDRESS.toHex());

  if (factory === null) {
    factory = new HybridPoolFactory(HYBRID_POOL_FACTORY_ADDRESS.toHex());
    factory.masterDeployer = MASTER_DEPLOYER_ADDRESS.toHex();
    factory.poolCount = BigInt.fromI32(0);
    factory.save();

    const masterDeployer = getOrCreateMasterDeployer(MASTER_DEPLOYER_ADDRESS);
    masterDeployer.factoryCount = masterDeployer.factoryCount.plus(
      BigInt.fromI32(1)
    );
    masterDeployer.save();
  }

  return factory as HybridPoolFactory;
}

export function getOrCreateHybridPool(id: Address): HybridPool {
  let pool = HybridPool.load(id.toHex());

  if (pool === null) {
    const factory = getOrCreateHybridPoolFactory();

    pool = new HybridPool(id.toHex());
    pool.masterDeployer = MASTER_DEPLOYER_ADDRESS.toHex();
    pool.factory = factory.id;
    pool.token0PrecisionMultiplier = BigInt.fromI32(0);
    pool.token1PrecisionMultiplier = BigInt.fromI32(0);
    pool.reserve0 = BigInt.fromI32(0);
    pool.reserve1 = BigInt.fromI32(0);
    pool.totalSupply = BigInt.fromI32(0);
    pool.transactionCount = BigInt.fromI32(0);
    pool.save();

    factory.poolCount = factory.poolCount.plus(BigInt.fromI32(1));
    factory.save();
  }

  return pool as HybridPool;
}

export function getOrCreateIndexPoolFactory(): IndexPoolFactory {
  let factory = IndexPoolFactory.load(INDEX_POOL_FACTORY_ADDRESS.toHex());

  if (factory === null) {
    factory = new IndexPoolFactory(INDEX_POOL_FACTORY_ADDRESS.toHex());
    factory.masterDeployer = MASTER_DEPLOYER_ADDRESS.toHex();
    factory.poolCount = BigInt.fromI32(0);
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

    pool.reserve0 = BigInt.fromI32(0);
    pool.reserve1 = BigInt.fromI32(0);
    pool.totalSupply = BigInt.fromI32(0);

    pool.transactionCount = BigInt.fromI32(0);

    pool.save();

    factory.poolCount = factory.poolCount.plus(BigInt.fromI32(1));
    factory.save();
  }

  return pool as IndexPool;
}

export function getOrCreateTransaction(event: ethereum.Event): Transaction {
  let transaction = Transaction.load(event.transaction.hash.toHexString());

  if (transaction === null) {
    transaction = new Transaction(event.transaction.hash.toHexString());
  }

  transaction.block = event.block.number;
  transaction.timestamp = event.block.timestamp;
  transaction.gasLimit = event.transaction.gasLimit;
  transaction.gasPrice = event.transaction.gasPrice;
  transaction.save();

  return transaction as Transaction;
}

export function getOrCreateToken(id: Address): Token {
  let token = Token.load(id.toHex());

  if (token === null) {
    token = new Token(id.toHex());
    token.name = "test";
    token.symbol = "TEST";
    token.decimals = BigInt.fromI32(0);
    token.totalSupply = BigInt.fromI32(0);
    token.save();
  }

  return token as Token;
}
