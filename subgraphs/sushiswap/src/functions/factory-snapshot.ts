import { BigInt, ethereum } from '@graphprotocol/graph-ts'
import { FactoryDaySnapshot, Factory, FactoryHourSnapshot } from '../../generated/schema'
import { BIG_DECIMAL_ZERO, BIG_INT_ONE, BIG_INT_ZERO, DAY_IN_SECONDS, FACTORY_ADDRESS, HOUR_IN_SECONDS } from '../constants'
import { Volume } from '../update-price-tvl-volume'
import { getOrCreateFactory } from './factory'
import { getPair } from './pair'
import { isBlacklistedToken } from './token'

export function updateFactorySnapshots(
  event: ethereum.Event,
  volume: Volume = {
    volumeUSD: BIG_DECIMAL_ZERO,
    volumeNative: BIG_DECIMAL_ZERO,
    feesNative: BIG_DECIMAL_ZERO,
    feesUSD: BIG_DECIMAL_ZERO,
    amount0Total: BIG_DECIMAL_ZERO,
    amount1Total: BIG_DECIMAL_ZERO
  }
): void {
  const pair = getPair(event.address.toHex())
  if (isBlacklistedToken(pair.token0) || isBlacklistedToken(pair.token1)) {
    return
  }
  const factory = getOrCreateFactory()
  updateFactoryHourSnapshot(event, factory, volume)
  updateFactoryDaySnapshot(event, factory, volume)
}


function updateFactoryDaySnapshot(
  event: ethereum.Event,
  factory: Factory,
  volume: Volume
): void {
  let id = generateFactoryDaySnapshotId(event.block.timestamp)
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
    snapshot.feesNative = BIG_DECIMAL_ZERO
    snapshot.feesUSD = BIG_DECIMAL_ZERO
  }

  snapshot.liquidityNative = factory.liquidityNative
  snapshot.liquidityUSD = factory.liquidityUSD
  snapshot.volumeUSD = snapshot.volumeUSD.plus(volume.volumeUSD)
  snapshot.volumeNative = snapshot.volumeNative.plus(volume.volumeNative)
  snapshot.feesNative = snapshot.feesNative.plus(volume.feesNative)
  snapshot.feesUSD = snapshot.feesUSD.plus(volume.feesUSD)
  snapshot.transactionCount = snapshot.transactionCount.plus(BIG_INT_ONE)
  snapshot.save()
}


function updateFactoryHourSnapshot(
  event: ethereum.Event,
  factory: Factory,
  volume: Volume
): void {
  let id = generateFactoryHourSnapshotId(event.block.timestamp)
  let snapshot = FactoryHourSnapshot.load(id)
  if (snapshot === null) {
    snapshot = new FactoryHourSnapshot(id)
    snapshot.date = getHourStartDate(event.block.timestamp)
    snapshot.factory = factory.id
    snapshot.transactionCount = BIG_INT_ZERO
    snapshot.liquidityNative = BIG_DECIMAL_ZERO
    snapshot.liquidityUSD = BIG_DECIMAL_ZERO
    snapshot.volumeNative = BIG_DECIMAL_ZERO
    snapshot.volumeUSD = BIG_DECIMAL_ZERO
    snapshot.feesNative = BIG_DECIMAL_ZERO
    snapshot.feesUSD = BIG_DECIMAL_ZERO
  }

  snapshot.liquidityNative = factory.liquidityNative
  snapshot.liquidityUSD = factory.liquidityUSD
  snapshot.volumeUSD = snapshot.volumeUSD.plus(volume.volumeUSD)
  snapshot.volumeNative = snapshot.volumeNative.plus(volume.volumeNative)
  snapshot.feesNative = snapshot.feesNative.plus(volume.feesNative)
  snapshot.feesUSD = snapshot.feesUSD.plus(volume.feesUSD)
  snapshot.transactionCount = snapshot.transactionCount.plus(BIG_INT_ONE)
  snapshot.save()
}


function getHourStartDate(timestamp: BigInt): i32 {
  let dayIndex = timestamp.toI32() / HOUR_IN_SECONDS // get unique day within unix history
  return dayIndex * HOUR_IN_SECONDS // want the rounded effect
}

function generateFactoryHourSnapshotId(timestamp: BigInt): string {
  let startDate = getDayStartDate(timestamp)
  return FACTORY_ADDRESS.toHex().concat('-hour-').concat(BigInt.fromI32(startDate).toString())
}

function getDayStartDate(timestamp: BigInt): i32 {
  let dayIndex = timestamp.toI32() / DAY_IN_SECONDS // get unique day within unix history
  return dayIndex * DAY_IN_SECONDS // want the rounded effect
}

function generateFactoryDaySnapshotId(timestamp: BigInt): string {
  let startDate = getDayStartDate(timestamp)
  return FACTORY_ADDRESS.toHex().concat('-day-').concat(BigInt.fromI32(startDate).toString())
}

