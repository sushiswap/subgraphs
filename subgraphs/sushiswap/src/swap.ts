import { BigDecimal, BigInt, ethereum } from '@graphprotocol/graph-ts'
import { Pair, PairHourSnapshot, Swap } from '../generated/schema'
import { Swap as SwapEvent } from '../generated/templates/Pair/Pair'
import { BIG_DECIMAL_ZERO, BIG_INT_ONE, BIG_INT_ZERO } from './constants'
import {
  convertTokenToDecimal, getAprSnapshot, getOrCreateToken,
  getOrCreateTransaction,
  getPair,
  getTokenPrice,
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

  const token0Price = getTokenPrice(pair.token0)
  const token1Price = getTokenPrice(pair.token1)
  const token0NativeLiquidity = pair.reserve0.toBigDecimal().times(token0Price.derivedNative)
  const token1NativeLiquidity = pair.reserve1.toBigDecimal().times(token1Price.derivedNative)
  let isImbalancedPair = false // Testing if this can ignore  hide arb bots causing apr to explode
  if (token0NativeLiquidity.gt(BIG_DECIMAL_ZERO) && token1NativeLiquidity.gt(BIG_DECIMAL_ZERO)) {
    const balance = token0NativeLiquidity.div(token1NativeLiquidity)
    isImbalancedPair = balance.gt(BigDecimal.fromString('0.90')) || balance.lt(BigDecimal.fromString('0.1'))
  }
  if (snapshot == null || pair.liquidityUSD.equals(BIG_DECIMAL_ZERO) || isImbalancedPair) {
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
  if (snapshot.cumulativeVolumeUSD === null) {
    return BIG_DECIMAL_ZERO
  }
  return pair.volumeUSD.minus(snapshot.cumulativeVolumeUSD!)
    .times(pair.swapFee.divDecimal(BigDecimal.fromString('10000')))
    .times(BigDecimal.fromString('365')) // One year
    .div(pair.liquidityUSD)
}

