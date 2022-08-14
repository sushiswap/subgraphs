import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts'
import { TokenDaySnapshot } from '../../generated/schema'
import { BIG_DECIMAL_ZERO, BIG_INT_ONE, BIG_INT_ZERO, DAY_IN_SECONDS } from '../constants'
import { getOrCreateBundle } from './bundle'
import { convertTokenToDecimal } from './number-converter'
import { getPair } from './pair'
import { getOrCreateToken } from './token'
import { getTokenPrice } from './token-price'

export function updateTokenDaySnapshots(timestamp: BigInt, pairAddress: Address): void {
  let pair = getPair(pairAddress.toHex())
  let bundle = getOrCreateBundle()
  updateTokenDaySnapshot(timestamp, pair.token0, bundle.nativePrice)
  updateTokenDaySnapshot(timestamp, pair.token1, bundle.nativePrice)
}


function updateTokenDaySnapshot(timestamp: BigInt, tokenId: string, nativePrice: BigDecimal): void {
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
  }

  snapshot.liquidity = convertTokenToDecimal(token.liquidity, token.decimals)
  snapshot.liquidityNative = token.liquidityNative
  snapshot.liquidityUSD = token.liquidityUSD
  snapshot.volume = token.volume
  snapshot.volumeUSD = token.volumeUSD
  snapshot.priceNative = tokenPrice.derivedNative
  snapshot.untrackedVolumeUSD = token.untrackedVolumeUSD
  snapshot.priceUSD = tokenPrice.derivedNative.times(nativePrice)
  snapshot.transactionCount = snapshot.transactionCount.plus(BIG_INT_ONE)
  snapshot.feesNative = token.feesNative
  snapshot.feesUSD = token.feesUSD
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
