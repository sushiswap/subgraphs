import { BigDecimal, BigInt } from '@graphprotocol/graph-ts'
import { Swap } from '../generated/schema'
import { Swap as SwapEvent } from '../generated/templates/Pair/Pair'
import {
  convertTokenToDecimal, getOrCreateToken,
  getOrCreateTransaction,
  getPair
} from './functions'

export function handleSwap(event: SwapEvent, volumeUSD: BigDecimal): Swap {
  const transaction = getOrCreateTransaction(event)

  const swaps = transaction.swaps

  const pair = getPair(event.address.toHex())

  const token0 = getOrCreateToken(pair.token0)
  const token1 = getOrCreateToken(pair.token1)
  const amount0In = convertTokenToDecimal(event.params.amount0In, token0.decimals)
  const amount1In = convertTokenToDecimal(event.params.amount1In, token1.decimals)
  const amount0Out = convertTokenToDecimal(event.params.amount0Out, token0.decimals)
  const amount1Out = convertTokenToDecimal(event.params.amount1Out, token1.decimals)

  const swap = new Swap(event.transaction.hash.toHex().concat('-').concat(BigInt.fromI32(swaps.length).toString()))
  swap.pair = pair.id
  swap.timestamp = transaction.createdAtTimestamp
  swap.transaction = transaction.id
  swap.sender = event.params.sender.toHex()
  swap.amount0In = amount0In
  swap.amount1In = amount1In
  swap.amount0Out = amount0Out
  swap.amount1Out = amount1Out
  swap.to = event.params.to.toHex()
  swap.logIndex = event.logIndex
  swap.amountUSD = volumeUSD
  swap.save()

  transaction.swaps = transaction.swaps.concat([swap.id])

  transaction.save()
  return swap
}
