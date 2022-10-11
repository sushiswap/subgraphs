import { BigInt, ethereum } from '@graphprotocol/graph-ts'
import { Rebase, Token, TokenDaySnapshot, TokenHourSnapshot } from '../../generated/schema'
import { BIG_INT_ONE, BIG_INT_ZERO, DAY, HOUR } from '../constants'

import { getOrCreateRebase, toElastic } from './rebase'
import { getOrCreateToken } from './token'


export function updateTokenSnapshots(
  event: ethereum.Event,
  tokenId: string
): void {
  const token = getOrCreateToken(tokenId, event)
  const rebase = getOrCreateRebase(token.id)
  updateTokenHourSnapshot(event.block.timestamp, token, rebase)
  updateTokenDaySnapshot(event.block.timestamp, token, rebase)
 }

 
function updateTokenHourSnapshot(
  timestamp: BigInt,
  token: Token,
  rebase: Rebase
  ): void {
  let id = generateTokenHourSnapshotId(token.id, timestamp)
  let snapshot = TokenHourSnapshot.load(id)

  if (snapshot === null) {
    snapshot = new TokenHourSnapshot(id)
    snapshot.date = getHourStartDate(timestamp)
    snapshot.token = token.id
    snapshot.transactionCount = BIG_INT_ZERO
  }

  snapshot.transactionCount = snapshot.transactionCount.plus(BIG_INT_ONE)
  snapshot.cumulativeLiquidityAmount = toElastic(rebase, token.liquidityShares, false)
  snapshot.cumulativeLiquidityShares = token.liquidityShares
  snapshot.save()
}

function updateTokenDaySnapshot(
  timestamp: BigInt,
  token: Token,
  rebase: Rebase
  ): void {
  let id = generateTokenDaySnapshotId(token.id, timestamp)
  let snapshot = TokenDaySnapshot.load(id)

  if (snapshot === null) {
    snapshot = new TokenDaySnapshot(id)
    snapshot.date = getDayStartDate(timestamp)
    snapshot.token = token.id
    snapshot.transactionCount = BIG_INT_ZERO
  }

  snapshot.transactionCount = snapshot.transactionCount.plus(BIG_INT_ONE)
  snapshot.cumulativeLiquidityAmount = toElastic(rebase, token.liquidityShares, false)
  snapshot.cumulativeLiquidityShares = token.liquidityShares
  snapshot.save()
}



function getDayStartDate(timestamp: BigInt): i32 {
  let dayIndex = timestamp.toI32() / DAY // get unique day within unix history
  return dayIndex * DAY // want the rounded effect
}

function generateTokenDaySnapshotId(tokenId: string, timestamp: BigInt): string {
  let startDate = getDayStartDate(timestamp)
  return tokenId.concat('-day-').concat(BigInt.fromI32(startDate).toString())
}

function getHourStartDate(timestamp: BigInt): i32 {
  let hourIndex = timestamp.toI32() / HOUR // get unique day within unix history
  return hourIndex * HOUR // want the rounded effect
}

function generateTokenHourSnapshotId(tokenId: string, timestamp: BigInt): string {
  let startDate = getHourStartDate(timestamp)
  return tokenId.concat('-hour-').concat(BigInt.fromI32(startDate).toString())
}
