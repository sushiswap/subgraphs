import { BigInt, log } from '@graphprotocol/graph-ts'
import { Pair, PairKpi, PairAsset } from '../../generated/schema'
import { PairCreated__Params } from '../../generated/Factory/Factory'
import { Pair as PairTemplate } from '../../generated/templates'
import { WHITELISTED_TOKEN_ADDRESSES } from '../constants'
import { getOrCreateToken } from './token'
import { getOrCreateFactory } from './factory'
import { getOrCreateTokenPrice } from './token-price'
import { createWhitelistedPair } from './whitelisted-pair'

export function createPair(params: PairCreated__Params): Pair {
  const id = params.pair.toHex()

  const factory = getOrCreateFactory()

  const assets = [params.token0, params.token1]

  const pair = new Pair(id)

  pair.factory = factory.id

  pair.block = params._event.block.number
  pair.timestamp = params._event.block.timestamp

  const kpi = createPairKpi(id)
  pair.kpi = kpi.id

  for (let i = 0; i < assets.length; i++) {
    const token = getOrCreateToken(assets[i].toHex())
    const asset = new PairAsset(pair.id.concat(':asset:').concat(i.toString()))
    asset.pair = id
    asset.token = token.id

    if (WHITELISTED_TOKEN_ADDRESSES.includes(token.id)) {
      const tokenPrice = getOrCreateTokenPrice(assets[Math.abs(i - 1) as i32].toHex())

      const whitelistedPair = createWhitelistedPair(
        tokenPrice.token.concat(':').concat(tokenPrice.whitelistedPairCount.toString())
      )
      whitelistedPair.pair = id
      whitelistedPair.price = tokenPrice.id
      whitelistedPair.save()

      tokenPrice.whitelistedPairCount = tokenPrice.whitelistedPairCount.plus(BigInt.fromI32(1))
      tokenPrice.save()
    }

    asset.save()
  }

  pair.save()

  PairTemplate.create(params.pair)

  return pair
}

export function createPairKpi(id: string): PairKpi {
  const kpi = new PairKpi(id)
  kpi.save()
  return kpi as PairKpi
}

export function getPairKpi(id: string): PairKpi {
  return PairKpi.load(id) as PairKpi
}

export function getPairAsset(id: string): PairAsset {
  return PairAsset.load(id) as PairAsset
}
