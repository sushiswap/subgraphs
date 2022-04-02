import { BigInt, log } from '@graphprotocol/graph-ts'
import { NATIVE_ADDRESS, WHITELISTED_TOKEN_ADDRESSES } from '../constants'
import { Pair, PairAsset, PairKpi, WhitelistedToken } from '../../generated/schema'

import { PairCreated__Params } from '../../generated/Factory/Factory'
import { Pair as PairTemplate } from '../../generated/templates'
import { createWhitelistedPair } from './whitelisted-pair'
import { getOrCreateFactory } from './factory'
import { getOrCreateToken } from './token'
import { getOrCreateTokenPrice } from './token-price'

export function getPairAsset(id: string): PairAsset {
  return PairAsset.load(id) as PairAsset
}

export function createPairKpi(id: string): PairKpi {
  const kpi = new PairKpi(id)
  kpi.save()
  return kpi as PairKpi
}

export function getPairKpi(id: string): PairKpi {
  return PairKpi.load(id) as PairKpi
}

export function createPair(params: PairCreated__Params): Pair {
  const id = params.pair.toHex()

  const factory = getOrCreateFactory()

  const assets = [params.token0, params.token1]

  const pair = new Pair(id)

  const kpi = createPairKpi(id)
  pair.kpi = kpi.id

  pair.factory = factory.id
  pair.block = params._event.block.number
  pair.timestamp = params._event.block.timestamp

  for (let i = 0; i < assets.length; i++) {
    const token = getOrCreateToken(assets[i].toHex())
    const asset = new PairAsset(pair.id.concat(':asset:').concat(i.toString()))
    asset.pair = id
    asset.token = token.id
    asset.save()

    const whitelistedToken = WhitelistedToken.load(token.id)

    if (WHITELISTED_TOKEN_ADDRESSES.includes(token.id) || whitelistedToken !== null || token.id == NATIVE_ADDRESS) {
      const address = assets[Math.abs(i - 1) as i32].toHex()
      const tokenPrice = getOrCreateTokenPrice(address)

      const whitelistedPair = createWhitelistedPair(
        tokenPrice.token.concat(':').concat(tokenPrice.whitelistedPairCount.toString())
      )
      whitelistedPair.pair = id
      whitelistedPair.price = tokenPrice.id
      whitelistedPair.save()

      tokenPrice.whitelistedPairCount = tokenPrice.whitelistedPairCount.plus(BigInt.fromI32(1))
      tokenPrice.save()
    }
  }

  pair.save()

  PairTemplate.create(params.pair)

  return pair
}
