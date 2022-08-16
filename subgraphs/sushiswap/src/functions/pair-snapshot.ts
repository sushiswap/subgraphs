
import { Address, BigInt } from '@graphprotocol/graph-ts'
import { Volume } from '../update-price-tvl-volume'
import { Pair, PairDaySnapshot, PairHourSnapshot } from '../../generated/schema'
import { BIG_DECIMAL_ZERO, BIG_INT_ONE, BIG_INT_ZERO, DAY_IN_SECONDS, HOUR_IN_SECONDS } from '../constants'
import { convertTokenToDecimal } from './number-converter'
import { getPair } from './pair'


export function updatePairSnapshots(
  timestamp: BigInt,
  pairAddress: Address,
  volume: Volume = {volumeUSD: BIG_DECIMAL_ZERO, amount0Total: BIG_DECIMAL_ZERO, amount1Total: BIG_DECIMAL_ZERO},
): void {
  let pair = getPair(pairAddress.toHex())
  updatePairHourSnapshot(timestamp, pair, volume)
  updatePairDaySnapshot(timestamp, pair, volume)
}

function updatePairHourSnapshot(
  timestamp: BigInt,
  pair: Pair,
  volume: Volume
  ): void {
  let id = getPairHourSnapshotId(pair.id, timestamp)

  let snapshot = PairHourSnapshot.load(id)

  if (snapshot === null) {
    snapshot = new PairHourSnapshot(id)
    snapshot.date = getHourStartDate(timestamp)
    snapshot.pair = pair.id
    snapshot.transactionCount = BIG_INT_ZERO
    snapshot.volumeToken0 = BIG_DECIMAL_ZERO
    snapshot.volumeToken1 = BIG_DECIMAL_ZERO
    snapshot.volumeUSD = BIG_DECIMAL_ZERO
  }
  snapshot.liquidity = convertTokenToDecimal(pair.liquidity, BigInt.fromU32(18))
  snapshot.liquidityNative = pair.liquidityNative
  snapshot.liquidityUSD = pair.liquidityUSD
  snapshot.volumeUSD = snapshot.volumeUSD.plus(volume.volumeUSD)
  snapshot.volumeToken0 = snapshot.volumeToken0.plus(volume.amount0Total)
  snapshot.volumeToken1 = snapshot.volumeToken1.plus(volume.amount1Total)
  snapshot.feesNative = pair.feesNative
  snapshot.feesUSD = pair.feesUSD
  snapshot.apr = pair.apr
  snapshot.transactionCount = snapshot.transactionCount.plus(BIG_INT_ONE)
  snapshot.save()
}

function updatePairDaySnapshot(
  timestamp: BigInt, 
  pair: Pair,
  volume: Volume
  ): void {
  let id = getPairDaySnapshotId(pair.id, timestamp)
  let snapshot = PairDaySnapshot.load(id)

  if (snapshot === null) {
    snapshot = new PairDaySnapshot(id)
    snapshot.date = getHourStartDate(timestamp)
    snapshot.pair = pair.id
    snapshot.transactionCount = BIG_INT_ZERO
    snapshot.volumeToken0 = BIG_DECIMAL_ZERO
    snapshot.volumeToken1 = BIG_DECIMAL_ZERO
    snapshot.volumeUSD = BIG_DECIMAL_ZERO
  }
  snapshot.liquidity = convertTokenToDecimal(pair.liquidity, BigInt.fromU32(18))
  snapshot.liquidityNative = pair.liquidityNative
  snapshot.liquidityUSD = pair.liquidityUSD
  snapshot.volumeUSD = snapshot.volumeUSD.plus(volume.volumeUSD)
  snapshot.volumeToken0 = snapshot.volumeToken0.plus(volume.amount0Total)
  snapshot.volumeToken1 = snapshot.volumeToken1.plus(volume.amount1Total)
  snapshot.feesNative = pair.feesNative
  snapshot.feesUSD = pair.feesUSD
  snapshot.apr = pair.apr
  snapshot.transactionCount = snapshot.transactionCount.plus(BIG_INT_ONE)
  snapshot.save()
}

function getHourStartDate(timestamp: BigInt): i32 {
  let hourIndex = timestamp.toI32() / HOUR_IN_SECONDS // get unique hour within unix history
  return hourIndex * HOUR_IN_SECONDS // want the rounded effect
}

function getDayStartDate(timestamp: BigInt): i32 {
  let dayIndex = timestamp.toI32() / DAY_IN_SECONDS // get unique day within unix history
  return dayIndex * DAY_IN_SECONDS // want the rounded effect
}

export function getPairHourSnapshotId(pairId: string, timestamp: BigInt): string {
  let startDate = getHourStartDate(timestamp)
  return pairId.concat('-hour-').concat(BigInt.fromI32(startDate).toString())
}

export function getPairDaySnapshotId(pairId: string, timestamp: BigInt): string {
  let startDate = getDayStartDate(timestamp)
  return pairId.concat('-day-').concat(BigInt.fromI32(startDate).toString())
}

/**
 * Get the last active hour snapshot for a pair, starting at 24 hours ago. If no snapshot is found,
 * iterate between 24-48 hours ago until a snapshot is found or else return null. 
 * @param pairId 
 * @param timestamp 
 * @returns 
 */
export function getAprSnapshot(pairId: string, timestamp: BigInt): PairHourSnapshot | null {
  for (let i = 23; i <= 47; i++) {
    let startTime = BigInt.fromI32(timestamp.minus(BigInt.fromI32(i * HOUR_IN_SECONDS)).toI32())
    let id = getPairHourSnapshotId(pairId, startTime)
    let snapshot = PairHourSnapshot.load(id)
    if (snapshot !== null) {
      return snapshot
    }
  }
  return null
}


