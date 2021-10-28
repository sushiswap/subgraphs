import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts'
import { CONSTANT_PRODUCT_POOL_FACTORY_ADDRESS, MASTER_DEPLOYER_ADDRESS } from '../constants/addresses'
import {
  ConstantProductPool,
  ConstantProductPoolKpi,
  ConstantProductPoolFactory,
  ConstantProductPoolAsset,
} from '../../generated/schema'
import { getOrCreateMasterDeployer } from './master-deployer'
import { getOrCreateToken } from './token'
import { DeployPool__Params } from '../../generated/MasterDeployer/MasterDeployer'

export function getOrCreateConstantProductPoolFactory(
  id: Address = CONSTANT_PRODUCT_POOL_FACTORY_ADDRESS
): ConstantProductPoolFactory {
  let factory = ConstantProductPoolFactory.load(id.toHex())

  if (factory === null) {
    const masterDeployer = getOrCreateMasterDeployer()
    masterDeployer.factoryCount = masterDeployer.factoryCount.plus(BigInt.fromI32(1))
    masterDeployer.save()

    factory = new ConstantProductPoolFactory(id.toHex())
    factory.masterDeployer = masterDeployer.id
    factory.save()
  }

  return factory as ConstantProductPoolFactory
}

export function getConstantProductPoolAsset(id: string): ConstantProductPoolAsset {
  return ConstantProductPoolAsset.load(id) as ConstantProductPoolAsset
}

export function createConstantProductPoolKpi(id: Address): ConstantProductPoolKpi {
  const kpi = new ConstantProductPoolKpi(id.toHex())
  kpi.save()
  return kpi as ConstantProductPoolKpi
}

export function getConstantProductPoolKpi(id: Address): ConstantProductPoolKpi {
  return ConstantProductPoolKpi.load(id.toHex()) as ConstantProductPoolKpi
}

export function createConstantProductPool(deployParams: DeployPool__Params): ConstantProductPool {
  const id = deployParams.pool.toHex()

  const masterDeployer = getOrCreateMasterDeployer()
  masterDeployer.factoryCount = masterDeployer.factoryCount.plus(BigInt.fromI32(1))
  masterDeployer.save()

  const factory = getOrCreateConstantProductPoolFactory()
  const decoded = ethereum.decode('(address,address,uint256,bool)', deployParams.deployData)!.toTuple()

  const assets = [decoded[0].toAddress() as Address, decoded[1].toAddress() as Address]
  const swapFee = decoded[2].toBigInt() as BigInt
  const twapEnabled = decoded[3].toBoolean() as boolean

  const pool = new ConstantProductPool(id)

  const kpi = createConstantProductPoolKpi(deployParams.pool)

  pool.kpi = kpi.id

  pool.masterDeployer = MASTER_DEPLOYER_ADDRESS.toHex()
  // pool.template = "CONSTANT_PRODUCT";
  pool.factory = factory.id

  for (let i = 0; i < assets.length; i++) {
    const token = getOrCreateToken(assets[i])
    const asset = new ConstantProductPoolAsset(pool.id.concat(':asset:').concat(i.toString()))
    asset.pool = id
    asset.token = token.id
    asset.save()
  }

  pool.swapFee = swapFee
  pool.twapEnabled = twapEnabled
  pool.block = deployParams._event.block.number
  pool.timestamp = deployParams._event.block.timestamp
  pool.save()

  factory.poolCount = factory.poolCount.plus(BigInt.fromI32(1))
  factory.save()

  return pool as ConstantProductPool
}

export function getConstantProductPool(id: Address): ConstantProductPool {
  return ConstantProductPool.load(id.toHex()) as ConstantProductPool
}
