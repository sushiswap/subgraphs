import { BigDecimal, BigInt } from '@graphprotocol/graph-ts'
import { Swap } from '../generated/schema'
import { Swap as SwapEvent } from '../generated/templates/Pair/Pair'
import { BIG_INT_ZERO } from './constants'
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
  const isFirstToken = event.params.amount0In.gt(BIG_INT_ZERO)
  const tokenIn = getOrCreateToken(isFirstToken ? pair.token0 : pair.token1)
  const tokenOut = getOrCreateToken(!isFirstToken ? pair.token0 : pair.token1)
  const amountIn = convertTokenToDecimal(isFirstToken ? event.params.amount0In : event.params.amount1In, tokenIn.decimals)
  const amountOut = convertTokenToDecimal(!isFirstToken ? event.params.amount0Out : event.params.amount1Out, tokenOut.decimals)

  const swap = new Swap(event.transaction.hash.toHex().concat('-').concat(BigInt.fromI32(swaps.length).toString()))
  swap.pair = pair.id
  swap.timestamp = transaction.createdAtTimestamp
  swap.transaction = transaction.id
  swap.sender = event.params.sender.toHex()
  swap.tokenIn = tokenIn.id
  swap.tokenOut = tokenOut.id
  swap.amountIn = amountIn
  swap.amountOut = amountOut
  swap.to = event.params.to.toHex()
  swap.logIndex = event.logIndex
  swap.amountUSD = volumeUSD
  swap.save()

  transaction.swaps = transaction.swaps.concat([swap.id])

  transaction.save()

  increaseTransactionCount()
  return swap
}
