import { BigInt, ethereum } from '@graphprotocol/graph-ts'
import { FactoryDaySnapshot } from '../../generated/schema'
import { BIG_DECIMAL_ZERO, BIG_INT_ONE, BIG_INT_ZERO, DAY_IN_SECONDS, PairType } from '../constants'
import { Volume } from '../update-price-tvl-volume'
import { getOrCreateFactory } from './factory'
import { getPair } from './pair'
import { isBlacklistedToken } from './token'


export function updateFactoryDaySnapshot(
  event: ethereum.Event,
  volume: Volume = {
    volumeUSD: BIG_DECIMAL_ZERO,
    volumeNative: BIG_DECIMAL_ZERO,
    feesNative: BIG_DECIMAL_ZERO,
    feesUSD: BIG_DECIMAL_ZERO,
    untrackedVolumeUSD: BIG_DECIMAL_ZERO,
    amount0Total: BIG_DECIMAL_ZERO,
    amount1Total: BIG_DECIMAL_ZERO
  }
): void {
  const pair = getPair(event.address.toHex())
  if (isBlacklistedToken(pair.token0) || isBlacklistedToken(pair.token1)) {
    return
  }
  const factory = getOrCreateFactory(PairType.CONSTANT_PRODUCT_POOL)
  let id = generateFactoryDaySnapshotId(factory.id, event.block.timestamp)
  let snapshot = FactoryDaySnapshot.load(id)

  if (snapshot === null) {
    snapshot = new FactoryDaySnapshot(id)
    snapshot.date = getDayStartDate(event.block.timestamp)
    snapshot.factory = factory.id
    snapshot.transactionCount = BIG_INT_ZERO
    snapshot.liquidityNative = BIG_DECIMAL_ZERO
    snapshot.liquidityUSD = BIG_DECIMAL_ZERO
    snapshot.volumeNative = BIG_DECIMAL_ZERO
    snapshot.volumeUSD = BIG_DECIMAL_ZERO
    snapshot.untrackedVolumeUSD = BIG_DECIMAL_ZERO
    snapshot.feesNative = BIG_DECIMAL_ZERO
    snapshot.feesUSD = BIG_DECIMAL_ZERO
  }

  snapshot.liquidityNative = factory.liquidityNative
  snapshot.liquidityUSD = factory.liquidityUSD
  snapshot.volumeUSD = snapshot.volumeUSD.plus(volume.volumeUSD)
  snapshot.volumeNative = snapshot.volumeNative.plus(volume.volumeNative)
  snapshot.untrackedVolumeUSD = snapshot.untrackedVolumeUSD.plus(volume.untrackedVolumeUSD)
  snapshot.feesNative = snapshot.feesNative.plus(volume.feesNative)
  snapshot.feesUSD = snapshot.feesUSD.plus(volume.feesUSD)
  snapshot.transactionCount = snapshot.transactionCount.plus(BIG_INT_ONE)
  snapshot.save()
}

function getDayStartDate(timestamp: BigInt): i32 {
  let dayIndex = timestamp.toI32() / DAY_IN_SECONDS // get unique day within unix history
  return dayIndex * DAY_IN_SECONDS // want the rounded effect
}

function generateFactoryDaySnapshotId(factoryId: string, timestamp: BigInt): string {
  let startDate = getDayStartDate(timestamp)
  return factoryId.concat('-day-').concat(BigInt.fromI32(startDate).toString())
}
