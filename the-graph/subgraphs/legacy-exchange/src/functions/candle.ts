import { BigDecimal, BigInt, ByteArray, Bytes, log } from '@graphprotocol/graph-ts'
import { concat } from '@graphprotocol/graph-ts/helper-functions'
import { TIME_FRAMES } from '../constants'
import { getTokenPrice } from '.'
import { PairAsset, Candle } from '../../generated/schema'
import { Swap as SwapEvent } from '../../generated/templates/Pair/Pair'

export function updateCandles(
  asset0: PairAsset,
  asset1: PairAsset,
  token0Amount: BigDecimal,
  token1Amount: BigDecimal,
  event: SwapEvent,
  pairAddress: string
): void {
  const token0Price = getTokenPrice(asset0.token)
  const token1Price = getTokenPrice(asset1.token)

  const price = token0Amount.div(token1Amount)
  const timestamp = event.block.timestamp.toI32()

  for (let i = 0; i < TIME_FRAMES.length; i++) {
    const candleId = generateCandleId(timestamp, TIME_FRAMES[i], asset0.token, asset1.token)
    let candle = Candle.load(candleId)
    if (candle === null) {
      candle = new Candle(candleId)
      candle.pair = pairAddress
      candle.time = timestamp
      candle.period = TIME_FRAMES[i]
      candle.token0 = asset0.token
      candle.token1 = asset1.token
      candle.open = price
      candle.openUSD = price.times(token0Price.derivedUSD)
      candle.openNative = price.times(token0Price.derivedNative)
      candle.low = price
      candle.high = price
    } else {
      if (price < candle.low) {
        candle.low = price
      }
      if (price > candle.high) {
        candle.high = price
      }
    }

    candle.lowUSD = candle.low.times(token0Price.derivedUSD)
    candle.lowNative = candle.low.times(token0Price.derivedNative)
    candle.highUSD = candle.high.times(token0Price.derivedUSD)
    candle.highNative = candle.high.times(token0Price.derivedNative)

    candle.close = price
    candle.closeUSD = price.times(token0Price.derivedUSD)
    candle.closeNative = price.times(token0Price.derivedNative)
    candle.lastBlock = event.block.number.toI32()
    candle.token0Amount = candle.token0Amount.plus(token0Amount)
    candle.token0AmountUSD = candle.token0Amount.times(token0Price.derivedUSD)
    candle.token0AmountNative = candle.token0Amount.times(token0Price.derivedNative)
    candle.token1Amount = candle.token1Amount.plus(token1Amount)
    candle.token1AmountUSD = candle.token1Amount.times(token1Price.derivedUSD)
    candle.token1AmountNative = candle.token1Amount.times(token1Price.derivedNative)
    candle.save()
   
    // debugCandle(candle)
  }
 
}

/**
 * ONLY used for debugging - useful for debugging {@link updateCandles}.
 * @param candle 
 */
export function debugCandle(candle: Candle): void {
  log.debug('-------- TIME FRAME: {} --------', [candle.period.toString()])
  log.debug('O: {}', [candle.open.toString()])
  log.debug('H: {}', [candle.high.toString()])
  log.debug('L: {}', [candle.low.toString()])
  log.debug('C: {}', [candle.close.toString()])
  log.debug('', [])
  log.debug('O USD: {}', [candle.openUSD.toString()])
  log.debug('H USD: {}', [candle.highUSD.toString()])
  log.debug('L USD: {}', [candle.lowUSD.toString()])
  log.debug('C USD: {}', [candle.closeUSD.toString()])
  log.debug('', [])
  log.debug('O NATIVE: {}', [candle.openNative.toString()])
  log.debug('H NATIVE: {}', [candle.highNative.toString()])
  log.debug('L NATIVE: {}', [candle.lowNative.toString()])
  log.debug('C NATIVE: {}', [candle.closeNative.toString()])


}

/**
 * Used to generate a unique id for candles by concatenating tokens and time variables.
 * @param timestamp Unix timestamp
 * @param timeFrame time frame in seconds, example: 60 or 3600
 * @param token0 token address as string
 * @param token1 token Address as string
 * @returns 
 */
export function generateCandleId(timestamp: i32, timeFrame: i32, token0: string, token1: string): string {
  const tokens = concat(ByteArray.fromHexString(token0), ByteArray.fromHexString(token1))
  const timeId = timestamp / timeFrame
  const timeframeId = concat(Bytes.fromI32(timeId), Bytes.fromI32(timeFrame))
  return concat(timeframeId, tokens).toHex()
}

