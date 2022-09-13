import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts'
import { Volume } from '../update-price-tvl-volume'
import { TokenDaySnapshot, TokenHourSnapshot } from '../../generated/schema'
import { BIG_DECIMAL_ZERO, BIG_INT_ONE, BIG_INT_ZERO, DAY_IN_SECONDS, HOUR_IN_SECONDS } from '../constants'
import { getOrCreateBundle } from './bundle'
import { convertTokenToDecimal } from './number-converter'
import { getPair } from './pair'
import { getOrCreateToken } from './token'
import { getTokenPrice } from './token-price'

export function updateTokenSnapshots(
  timestamp: BigInt,
  pairAddress: Address,
  volume: Volume = { 
    volumeUSD: BIG_DECIMAL_ZERO, 
    volumeNative: BIG_DECIMAL_ZERO, 
    feesNative: BIG_DECIMAL_ZERO, 
    feesUSD: BIG_DECIMAL_ZERO, 
    amount0Total: BIG_DECIMAL_ZERO, 
    amount1Total: BIG_DECIMAL_ZERO 
  }
): void {
  let pair = getPair(pairAddress.toHex())
  let bundle = getOrCreateBundle()

  updateTokenHourSnapshot(timestamp, pair.token0, bundle.nativePrice, volume.amount0Total, volume.feesNative, volume.feesUSD)
  updateTokenHourSnapshot(timestamp, pair.token1, bundle.nativePrice, volume.amount1Total, volume.feesNative, volume.feesUSD)

  updateTokenDaySnapshot(timestamp, pair.token0, bundle.nativePrice, volume.amount0Total, volume.feesNative, volume.feesUSD)
  updateTokenDaySnapshot(timestamp, pair.token1, bundle.nativePrice, volume.amount1Total, volume.feesNative, volume.feesUSD)
 }

 
function updateTokenHourSnapshot(
  timestamp: BigInt, 
  tokenId: string, 
  nativePrice: BigDecimal,
  volume: BigDecimal,
  feesNative: BigDecimal,
  feesUSD: BigDecimal,
  ): void {
  let token = getOrCreateToken(tokenId)
  let tokenPrice = getTokenPrice(tokenId)
  let id = generateTokenHourSnapshotId(tokenId, timestamp)
  let snapshot = TokenHourSnapshot.load(id)

  if (snapshot === null) {
    snapshot = new TokenHourSnapshot(id)
    snapshot.date = getHourStartDate(timestamp)
    snapshot.token = tokenId
    snapshot.transactionCount = BIG_INT_ZERO
    snapshot.liquidityNative = BIG_DECIMAL_ZERO
    snapshot.liquidityUSD = BIG_DECIMAL_ZERO
    snapshot.volume = BIG_DECIMAL_ZERO
    snapshot.volumeNative = BIG_DECIMAL_ZERO
    snapshot.volumeUSD = BIG_DECIMAL_ZERO
    snapshot.feesNative = BIG_DECIMAL_ZERO
    snapshot.feesUSD = BIG_DECIMAL_ZERO
  }

  snapshot.liquidity = convertTokenToDecimal(token.liquidity, token.decimals)
  snapshot.liquidityNative = token.liquidityNative
  snapshot.liquidityUSD = token.liquidityUSD
  snapshot.volume = snapshot.volume.plus(volume)
  snapshot.volumeNative = snapshot.volumeNative.plus(volume.times(tokenPrice.derivedNative))
  snapshot.volumeUSD = snapshot.volumeUSD.plus(volume.times(tokenPrice.derivedNative).times(nativePrice))
  snapshot.priceNative = tokenPrice.derivedNative
  snapshot.priceUSD = tokenPrice.derivedNative.times(nativePrice)
  snapshot.transactionCount = snapshot.transactionCount.plus(BIG_INT_ONE)
  snapshot.feesNative = snapshot.feesNative.plus(feesNative)
  snapshot.feesUSD = token.feesUSD.plus(feesUSD)
  snapshot.save()
}

function updateTokenDaySnapshot(
  timestamp: BigInt, 
  tokenId: string, 
  nativePrice: BigDecimal,
  volume: BigDecimal,
  feesNative: BigDecimal,
  feesUSD: BigDecimal,
  ): void {
  let token = getOrCreateToken(tokenId)
  let tokenPrice = getTokenPrice(tokenId)
  let id = generateTokenDaySnapshotId(tokenId, timestamp)
  let snapshot = TokenDaySnapshot.load(id)

  if (snapshot === null) {
    snapshot = new TokenDaySnapshot(id)
    snapshot.date = getDayStartDate(timestamp)
    snapshot.token = tokenId
    snapshot.transactionCount = BIG_INT_ZERO
    snapshot.liquidityNative = BIG_DECIMAL_ZERO
    snapshot.liquidityUSD = BIG_DECIMAL_ZERO
    snapshot.volume = BIG_DECIMAL_ZERO
    snapshot.volumeNative = BIG_DECIMAL_ZERO
    snapshot.volumeUSD = BIG_DECIMAL_ZERO
    snapshot.feesNative = BIG_DECIMAL_ZERO
    snapshot.feesUSD = BIG_DECIMAL_ZERO
  }

  snapshot.liquidity = convertTokenToDecimal(token.liquidity, token.decimals)
  snapshot.liquidityNative = token.liquidityNative
  snapshot.liquidityUSD = token.liquidityUSD
  snapshot.volume = snapshot.volume.plus(volume)
  snapshot.volumeNative = snapshot.volumeNative.plus(volume.times(tokenPrice.derivedNative))
  snapshot.volumeUSD = snapshot.volumeUSD.plus(volume.times(tokenPrice.derivedNative).times(nativePrice))
  snapshot.priceNative = tokenPrice.derivedNative
  snapshot.priceUSD = tokenPrice.derivedNative.times(nativePrice)
  snapshot.transactionCount = snapshot.transactionCount.plus(BIG_INT_ONE)
  snapshot.feesNative = snapshot.feesNative.plus(feesNative)
  snapshot.feesUSD = token.feesUSD.plus(feesUSD)
  snapshot.save()
}

function getDayStartDate(timestamp: BigInt): i32 {
  let dayIndex = timestamp.toI32() / DAY_IN_SECONDS // get unique day within unix history
  return dayIndex * DAY_IN_SECONDS // want the rounded effect
}

function generateTokenDaySnapshotId(tokenId: string, timestamp: BigInt): string {
  let startDate = getDayStartDate(timestamp)
  return tokenId.concat('-day-').concat(BigInt.fromI32(startDate).toString())
}

function getHourStartDate(timestamp: BigInt): i32 {
  let hourIndex = timestamp.toI32() / HOUR_IN_SECONDS // get unique day within unix history
  return hourIndex * HOUR_IN_SECONDS // want the rounded effect
}

function generateTokenHourSnapshotId(tokenId: string, timestamp: BigInt): string {
  let startDate = getHourStartDate(timestamp)
  return tokenId.concat('-hour-').concat(BigInt.fromI32(startDate).toString())
}
