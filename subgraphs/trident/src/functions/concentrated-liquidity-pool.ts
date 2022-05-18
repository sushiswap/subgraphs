import { Address, BigInt } from '@graphprotocol/graph-ts'
import { CONCENTRATED_LIQUIDITY_POOL_FACTORY_ADDRESS, MASTER_DEPLOYER_ADDRESS } from '../constants'
import {
  ConcentratedLiquidityPool,
  ConcentratedLiquidityPoolFactory,
  ConcentratedLiquidityPoolKpi,
} from '../../generated/schema'

import { getOrCreateMasterDeployer } from './master-deployer'

export function getOrCreateConcentratedLiquidityPoolFactory(
  id: Address = CONCENTRATED_LIQUIDITY_POOL_FACTORY_ADDRESS
): ConcentratedLiquidityPoolFactory {
  let factory = ConcentratedLiquidityPoolFactory.load(id.toHex())

  if (factory === null) {
    factory = new ConcentratedLiquidityPoolFactory(id.toHex())
    factory.masterDeployer = MASTER_DEPLOYER_ADDRESS.toHex()
    factory.save()

    const masterDeployer = getOrCreateMasterDeployer(MASTER_DEPLOYER_ADDRESS)
    masterDeployer.factoryCount = masterDeployer.factoryCount.plus(BigInt.fromI32(1))
    masterDeployer.save()
  }

  return factory as ConcentratedLiquidityPoolFactory
}

export function getConcentratedLiquidityPoolKpi(id: Address): ConcentratedLiquidityPoolKpi {
  return ConcentratedLiquidityPoolKpi.load(id.toHex()) as ConcentratedLiquidityPoolKpi
}

export function createConcentratedLiquidityPoolKpi(id: Address): ConcentratedLiquidityPoolKpi {
  const kpi = new ConcentratedLiquidityPoolKpi(id.toHex())
  kpi.save()
  return kpi as ConcentratedLiquidityPoolKpi
}

export function getOrCreateConcentratedLiquidityPool(id: Address): ConcentratedLiquidityPool {
  let pool = ConcentratedLiquidityPool.load(id.toHex())

  if (pool === null) {
    const factory = getOrCreateConcentratedLiquidityPoolFactory()

    pool = new ConcentratedLiquidityPool(id.toHex())
    pool.masterDeployer = MASTER_DEPLOYER_ADDRESS.toHex()
    pool.factory = factory.id
    pool.save()

    factory.poolCount = factory.poolCount.plus(BigInt.fromI32(1))
    factory.save()
  }

  return pool as ConcentratedLiquidityPool
}
