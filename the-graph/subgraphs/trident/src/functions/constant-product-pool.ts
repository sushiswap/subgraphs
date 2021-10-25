import { Address, BigInt } from '@graphprotocol/graph-ts'
import { CONSTANT_PRODUCT_POOL_FACTORY_ADDRESS, MASTER_DEPLOYER_ADDRESS } from '../constants'
import { ConstantProductPool, ConstantProductPoolFactory } from '../../generated/schema'

import { ConstantProductPool as ConstantProductPoolContract } from '../../generated/templates/ConstantProductPool/ConstantProductPool'
import { getOrCreateMasterDeployer } from './master-deployer'
import { getOrCreateToken } from './token'
import { DeployPool__Params } from '../../generated/MasterDeployer/MasterDeployer'

export function getOrCreateConstantProductPoolFactory(
  id: Address = CONSTANT_PRODUCT_POOL_FACTORY_ADDRESS
): ConstantProductPoolFactory {
  let factory = ConstantProductPoolFactory.load(id.toHex())

  if (factory === null) {
    factory = new ConstantProductPoolFactory(id.toHex())
    factory.masterDeployer = MASTER_DEPLOYER_ADDRESS.toHex()
    factory.save()

    const masterDeployer = getOrCreateMasterDeployer(MASTER_DEPLOYER_ADDRESS)
    masterDeployer.factoryCount = masterDeployer.factoryCount.plus(BigInt.fromI32(1))
    masterDeployer.save()
  }

  return factory as ConstantProductPoolFactory
}

export function createConstantProductPool(deployParams: DeployPool__Params): ConstantProductPool {
  const id = deployParams.pool.toHex()
  const contract = ConstantProductPoolContract.bind(deployParams.pool)
  const factory = getOrCreateConstantProductPoolFactory()
  const assets = contract.getAssets()
  const token0 = getOrCreateToken(assets[0])
  const token1 = getOrCreateToken(assets[1])
  const pool = new ConstantProductPool(id)
  pool.masterDeployer = MASTER_DEPLOYER_ADDRESS.toHex()
  // pool.template = "CONSTANT_PRODUCT";
  pool.factory = factory.id
  pool.token0 = token0.id
  pool.token1 = token1.id
  pool.assets = [token0.id, token1.id]
  pool.swapFee = contract.swapFee()
  pool.data = deployParams.deployData
  pool.save()
  factory.poolCount = factory.poolCount.plus(BigInt.fromI32(1))
  factory.save()

  return pool as ConstantProductPool
}

export function getConstantProductPool(id: Address): ConstantProductPool {
  return ConstantProductPool.load(id.toHex()) as ConstantProductPool
}
