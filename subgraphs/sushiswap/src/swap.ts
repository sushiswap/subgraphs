import { BigDecimal, BigInt } from '@graphprotocol/graph-ts'
import { Pair, PairHourSnapshot, Swap } from '../generated/schema'
import { Swap as SwapEvent } from '../generated/templates/Pair/Pair'
import { BIG_DECIMAL_ZERO, BIG_INT_ONE, BIG_INT_ZERO } from './constants'
import {
  convertTokenToDecimal, getAprSnapshot, getOrCreateToken,
  getOrCreateTransaction,
  getPair,
  increaseFactoryTransactionCount
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

  pair.txCount = pair.txCount.plus(BIG_INT_ONE)
  pair.save()
  tokenIn.txCount = tokenIn.txCount.plus(BIG_INT_ONE)
  tokenIn.save()
  tokenOut.txCount = tokenOut.txCount.plus(BIG_INT_ONE)
  tokenOut.save()
  increaseFactoryTransactionCount()
  return swap
}


export function updateApr(event: SwapEvent): void {
  const pair = getPair(event.address.toHex())
  const snapshot = getAprSnapshot(event.address.toHex(), event.block.timestamp)
  if (snapshot == null || pair.liquidityUSD.equals(BIG_DECIMAL_ZERO)) {
    pair.apr = BIG_DECIMAL_ZERO
    pair.aprUpdatedAtTimestamp = event.block.timestamp
    pair.save()
    return
  }
  pair.apr = calculateApr(pair, snapshot)
  pair.aprUpdatedAtTimestamp = event.block.timestamp
  pair.save()
}


/**
 * 
 * Formula source: https://github.com/sushiswap/sushiswap-interface/blob/437586a4e659f5eddeedd167b3cfe89e0c5f9c3c/src/features/trident/pools/usePoolsTableData.tsx#L84-L98
 * @param pair 
 * @param snapshot 
 */
const calculateApr = (pair: Pair, snapshot: PairHourSnapshot): BigDecimal => {
  return pair.volumeUSD.minus(snapshot.volumeUSD)
    .times(pair.swapFee.divDecimal(BigDecimal.fromString('10000')))
    .times(BigDecimal.fromString('365')) // One year
    .div(BigDecimal.fromString('100'))
    .div(pair.liquidityUSD)
    .div(BigDecimal.fromString('100'))
}

