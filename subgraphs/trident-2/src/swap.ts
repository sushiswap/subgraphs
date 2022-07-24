import { BigDecimal, BigInt } from '@graphprotocol/graph-ts'
import { Swap } from '../generated/schema'
import { Swap as SwapEvent } from '../generated/templates/ConstantProductPool/ConstantProductPool'
import { FactoryType } from './constants'
import {
  convertTokenToDecimal, getOrCreateToken,
  getOrCreateTransaction,
  getPair,
  increaseTransactionCount
} from './functions'


export function handleSwap(event: SwapEvent, volumeUSD: BigDecimal): Swap {
  const transaction = getOrCreateTransaction(event)

  const swaps = transaction.swaps

  const pair = getPair(event.address.toHex())

  const token0 = getOrCreateToken(pair.token0)
  const token1 = getOrCreateToken(pair.token1)

  const amount0Total = convertTokenToDecimal(event.params.amountIn, token0.decimals)
  const amount1Total = convertTokenToDecimal(event.params.amountOut, token1.decimals)

  const swap = new Swap(event.transaction.hash.toHex().concat('-').concat(BigInt.fromI32(swaps.length).toString()))
  swap.pair = pair.id
  swap.timestamp = transaction.createdAtTimestamp
  swap.transaction = transaction.id
  swap.sender = event.transaction.from.toHex()
  swap.amountIn = amount0Total
  swap.amountOut = amount1Total
  swap.to = event.params.recipient.toHex()
  swap.logIndex = event.logIndex
  swap.amountUSD = volumeUSD
  swap.save()

  transaction.swaps = transaction.swaps.concat([swap.id])

  transaction.save()

  increaseTransactionCount(FactoryType.CONSTANT_PRODUCT_POOL)
  return swap
}
