import { Address, BigInt, ethereum, log } from '@graphprotocol/graph-ts'
import { CONSTANT_PRODUCT_POOL_FACTORY_ADDRESS, MASTER_DEPLOYER_ADDRESS } from '../constants/addresses'
import {
  ConstantProductPool,
  ConstantProductPoolAsset,
  ConstantProductPoolFactory,
  ConstantProductPoolKpi,
} from '../../generated/schema'
import { getOrCreateTokenPrice, getTokenPrice } from './token-price'

import { DeployPool__Params } from '../../generated/MasterDeployer/MasterDeployer'
import { WHITELISTED_TOKEN_ADDRESSES } from '../constants/addresses'
import { createWhitelistedPool } from './whitelisted-pool'
import { getOrCreateMasterDeployer } from './master-deployer'
import { getOrCreateToken } from './token'

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

export function createConstantProductPoolKpi(id: string): ConstantProductPoolKpi {
  const kpi = new ConstantProductPoolKpi(id)
  kpi.save()
  return kpi as ConstantProductPoolKpi
}

export function getConstantProductPoolKpi(id: string): ConstantProductPoolKpi {
  return ConstantProductPoolKpi.load(id) as ConstantProductPoolKpi
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

  if (id == '0xca5953773602e8c789f0635f40e05e816165b85c') {
    log.info('STARGATE POOL DEPLOYED!!!', [])
    log.info('ASSET 0 {}', [assets[0].toHex()])
    log.info('ASSET 1 {}', [assets[1].toHex()])
    log.info('ASSET LENGTH {}', [assets.length.toString()])
    for (let i = 0; i < WHITELISTED_TOKEN_ADDRESSES.length; i++) {
      log.info('WHITELIST TOKEN {}', [WHITELISTED_TOKEN_ADDRESSES[i]])
    }
    log.info('INCLUDES USDC {}', [
      WHITELISTED_TOKEN_ADDRESSES.includes('0x2791bca1f2de4661ed88a30c99a7a9449aa84174') ? 'true' : 'false',
    ])
    log.info('ABS INDEX {}', [(Math.abs(0 - 1) as i32).toString()])
  }

  const kpi = createConstantProductPoolKpi(id)

  pool.kpi = kpi.id

  pool.masterDeployer = MASTER_DEPLOYER_ADDRESS.toHex()
  // pool.template = "CONSTANT_PRODUCT";
  pool.factory = factory.id

  pool.swapFee = swapFee
  pool.twapEnabled = twapEnabled
  pool.block = deployParams._event.block.number
  pool.timestamp = deployParams._event.block.timestamp
  pool.save()

  factory.poolCount = factory.poolCount.plus(BigInt.fromI32(1))
  factory.save()

  for (let i = 0; i < assets.length; i++) {
    const token = getOrCreateToken(assets[i].toHex())
    const asset = new ConstantProductPoolAsset(pool.id.concat(':asset:').concat(i.toString()))
    asset.pool = id
    asset.token = token.id
    asset.save()

    if (WHITELISTED_TOKEN_ADDRESSES.includes(token.id)) {
      const address = assets[Math.abs(i - 1) as i32].toHex()
      const tokenPrice = getOrCreateTokenPrice(address)

      const whitelistedPool = createWhitelistedPool(
        tokenPrice.token.concat(':').concat(tokenPrice.whitelistedPoolCount.toString())
      )
      whitelistedPool.pool = id
      whitelistedPool.price = tokenPrice.id
      whitelistedPool.save()

      tokenPrice.whitelistedPoolCount = tokenPrice.whitelistedPoolCount.plus(BigInt.fromI32(1))
      tokenPrice.save()
    }
  }

  return pool as ConstantProductPool
}

export function getConstantProductPool(id: string): ConstantProductPool {
  return ConstantProductPool.load(id) as ConstantProductPool
}
