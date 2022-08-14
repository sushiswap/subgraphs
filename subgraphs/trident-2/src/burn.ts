import { BigDecimal } from '@graphprotocol/graph-ts'
import { Burn } from '../generated/schema'
import { Burn as BurnEvent } from '../generated/templates/ConstantProductPool/ConstantProductPool'
import { BIG_INT_ONE, FactoryType } from './constants'
import {
  convertTokenToDecimal,
  getOrCreateBundle,
  getOrCreateBurn,
  getOrCreateToken,
  getOrCreateTransaction,
  getPair,
  getTokenPrice,
  increaseFactoryTransactionCount
} from './functions'

export function handleBurn(event: BurnEvent): Burn {
  const transaction = getOrCreateTransaction(event)
  const burns = transaction.burns
  let burn = getOrCreateBurn(event, burns.length)

  const pair = getPair(event.address.toHex())
  const token0 = getOrCreateToken(pair.token0)
  const token1 = getOrCreateToken(pair.token1)
  const token0Amount = convertTokenToDecimal(event.params.amount0, token0.decimals)
  const token1Amount = convertTokenToDecimal(event.params.amount1, token1.decimals)
  const token0Price = getTokenPrice(token0.id)
  const token1Price = getTokenPrice(token1.id)
  const bundle = getOrCreateBundle()
  const amountTotalUSD = token1Price.derivedNative
    .times(token1Amount)
    .plus(token0Price.derivedNative.times(token0Amount))
    .times(bundle.nativePrice)

  burn.amount0 = token0Amount as BigDecimal
  burn.amount1 = token1Amount as BigDecimal
  burn.logIndex = event.logIndex
  burn.amountUSD = amountTotalUSD as BigDecimal
  burn.save()
  pair.txCount = pair.txCount.plus(BIG_INT_ONE)
  pair.save()
  token0.txCount = token0.txCount.plus(BIG_INT_ONE)
  token0.save()
  token1.txCount = token1.txCount.plus(BIG_INT_ONE)
  token1.save()

  increaseFactoryTransactionCount(FactoryType.CONSTANT_PRODUCT_POOL)
  return burn
}
