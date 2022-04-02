import { Token, TokenDaySnapshot, TokenKpi, TokenPrice } from '../../generated/schema'

import { BigInt } from '@graphprotocol/graph-ts'
import { DAY_IN_SECONDS } from '../constants'
import { getTokenPrice } from './token-price'

export function updateTokenDaySnapshot(
  timestamp: BigInt,
  token: Token,
  tokenKpi: TokenKpi,
  nativeTokenPrice: TokenPrice
): void {
  let tokenPrice = getTokenPrice(token.id)
  let id = getTokenDaySnapshotId(token.id, timestamp)

  let snapshot = TokenDaySnapshot.load(id)

  if (snapshot === null) {
    snapshot = new TokenDaySnapshot(id)
    snapshot.date = getDayStartDate(timestamp)
    snapshot.token = token.id
  }

  snapshot.liquidity = tokenKpi.liquidity
  snapshot.liquidityNative = tokenKpi.liquidityNative.times(tokenPrice.derivedNative)
  snapshot.liquidityUSD = snapshot.liquidityNative.times(nativeTokenPrice.derivedUSD)
  snapshot.priceNative = tokenPrice.derivedNative
  snapshot.priceUSD = tokenPrice.derivedNative.times(nativeTokenPrice.derivedUSD)
  snapshot.transactionCount = snapshot.transactionCount.plus(BigInt.fromI32(1))
  snapshot.save()
}

function getDayStartDate(timestamp: BigInt): i32 {
  let dayIndex = timestamp.toI32() / DAY_IN_SECONDS // get unique day within unix history
  return dayIndex * DAY_IN_SECONDS // want the rounded effect
}

export function getTokenDaySnapshotId(tokenId: string, timestamp: BigInt): string {
  let startDate = getDayStartDate(timestamp)
  return tokenId.concat('-').concat(BigInt.fromI32(startDate).toString())
}
