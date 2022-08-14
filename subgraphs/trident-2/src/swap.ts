import { BigDecimal, BigInt } from '@graphprotocol/graph-ts'
import { Pair, PairHourSnapshot, Swap } from '../generated/schema'
import { Swap as SwapEvent } from '../generated/templates/ConstantProductPool/ConstantProductPool'
import { BIG_DECIMAL_ZERO, BIG_INT_ONE, FactoryType } from './constants'
import {
  convertTokenToDecimal, getAprSnapshot, getOrCreateToken,
  getOrCreateTransaction,
  getPair,
  increaseFactoryTransactionCount
} from './functions'


export function handleSwap(event: SwapEvent, volumeUSD: BigDecimal): Swap {
  const transaction = getOrCreateTransaction(event)
  const pair = getPair(event.address.toHex())
  const swaps = transaction.swaps

  const tokenIn = getOrCreateToken(event.params.tokenIn.toHex())
  const tokenOut = getOrCreateToken(event.params.tokenOut.toHex())

  const amount0Total = convertTokenToDecimal(event.params.amountIn, tokenIn.decimals)
  const amount1Total = convertTokenToDecimal(event.params.amountOut, tokenOut.decimals)

  const swap = new Swap(event.transaction.hash.toHex().concat('-').concat(BigInt.fromI32(swaps.length).toString()))
  swap.pair = pair.id
  swap.timestamp = transaction.createdAtTimestamp
  swap.transaction = transaction.id
  swap.sender = event.transaction.from.toHex()
  swap.tokenIn = event.params.tokenIn.toHex()
  swap.tokenOut = event.params.tokenOut.toHex()
  swap.amountIn = amount0Total
  swap.amountOut = amount1Total
  swap.to = event.params.recipient.toHex()
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
  increaseFactoryTransactionCount(FactoryType.CONSTANT_PRODUCT_POOL)
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
    .times(BigDecimal.fromString('100'))
    .div(pair.liquidityUSD)
}

