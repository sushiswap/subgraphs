import { BigDecimal, BigInt } from '@graphprotocol/graph-ts'
import { PairHourSnapshot, PairKpi, Swap } from '../generated/schema'
import { Swap as SwapEvent } from '../generated/templates/ConstantProductPool/ConstantProductPool'
import { BIG_DECIMAL_ZERO, FactoryType, MINIMUM_NATIVE_LIQUIDITY } from './constants'
import {
  convertTokenToDecimal, getAprSnapshot, getOrCreateToken,
  getOrCreateTransaction,
  getPair,
  getPairKpi,
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

  increaseTransactionCount(FactoryType.CONSTANT_PRODUCT_POOL)
  return swap
}


export function updateApr(event: SwapEvent): void {
  const pairKpi = getPairKpi(event.address.toHex())
  const snapshot = getAprSnapshot(event.address.toHex(), event.block.timestamp)
  if (snapshot == null || pairKpi.liquidityNative.lt(MINIMUM_NATIVE_LIQUIDITY) || pairKpi.liquidityUSD.equals(BIG_DECIMAL_ZERO)) {
    pairKpi.apr = BIG_DECIMAL_ZERO
    pairKpi.aprUpdatedAtTimestamp = event.block.timestamp
    pairKpi.save()
    return
  }
  pairKpi.apr = calculateApr(pairKpi, snapshot)
  pairKpi.aprUpdatedAtTimestamp = event.block.timestamp
  pairKpi.save()
}


/**
 * 
 * Formula source: https://github.com/sushiswap/sushiswap-interface/blob/437586a4e659f5eddeedd167b3cfe89e0c5f9c3c/src/features/trident/pools/usePoolsTableData.tsx#L84-L98
 * @param pairKpi 
 * @param snapshot 
 */
const calculateApr = (pairKpi: PairKpi, snapshot: PairHourSnapshot): BigDecimal => {
  const pair = getPair(pairKpi.id)
  return pairKpi.volumeUSD.minus(snapshot.volumeUSD)
    .times(pair.swapFee.divDecimal(BigDecimal.fromString('10000')))
    .times(BigDecimal.fromString('365')) // One year
    .times(BigDecimal.fromString('100'))
    .div(pairKpi.liquidityUSD)
}

