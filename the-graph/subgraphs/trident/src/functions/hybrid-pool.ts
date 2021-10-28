import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts'
import { HYBRID_POOL_FACTORY_ADDRESS, MASTER_DEPLOYER_ADDRESS } from '../constants/addresses'
import { HybridPool, HybridPoolFactory } from '../../generated/schema'

import { getOrCreateMasterDeployer } from './master-deployer'

export function getOrCreateHybridPoolFactory(id: Address = HYBRID_POOL_FACTORY_ADDRESS): HybridPoolFactory {
  let factory = HybridPoolFactory.load(id.toHex())

  if (factory === null) {
    factory = new HybridPoolFactory(id.toHex())
    factory.masterDeployer = MASTER_DEPLOYER_ADDRESS.toHex()
    factory.poolCount = BigInt.fromI32(0)
    factory.save()

    const masterDeployer = getOrCreateMasterDeployer(MASTER_DEPLOYER_ADDRESS)
    masterDeployer.factoryCount = masterDeployer.factoryCount.plus(BigInt.fromI32(1))
    masterDeployer.save()
  }

  return factory as HybridPoolFactory
}

export function getOrCreateHybridPool(id: Address): HybridPool {
  let pool = HybridPool.load(id.toHex())

  if (pool === null) {
    const factory = getOrCreateHybridPoolFactory()

    pool = new HybridPool(id.toHex())
    pool.masterDeployer = MASTER_DEPLOYER_ADDRESS.toHex()
    pool.factory = factory.id

    // pool.token0PrecisionMultiplier = BigInt.fromI32(0)
    // pool.token1PrecisionMultiplier = BigInt.fromI32(0)
    pool.save()

    factory.poolCount = factory.poolCount.plus(BigInt.fromI32(1))
    factory.save()
  }

  return pool as HybridPool
}
