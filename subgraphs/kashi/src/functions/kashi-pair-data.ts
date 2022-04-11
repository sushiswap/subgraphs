import { BigInt, ethereum } from '@graphprotocol/graph-ts'

import { KashiPairDayData, KashiPairHourData, KashiPair } from '../../generated/schema'

export function updateKashiPairDayData(event: ethereum.Event): KashiPairDayData {
  let timestamp = event.block.timestamp.toI32()
  let dayID = timestamp / 86400
  let dayStartTimestamp = dayID * 86400
  let dayPairID = event.address.toHex().concat('-').concat(BigInt.fromI32(dayID).toString())

  let pair = KashiPair.load(event.address.toHex()) as KashiPair
  let data = KashiPairDayData.load(dayPairID)
  if (data === null) {
    data = new KashiPairDayData(dayPairID)
    data.date = dayStartTimestamp
    data.pair = pair.id
    data.avgExchangeRate = pair.exchangeRate
    data.avgUtilization = pair.utilization
    data.avgInterestPerSecond = pair.interestPerSecond
  }

  data.totalAssetElastic = pair.totalAssetElastic
  data.totalAssetBase = pair.totalAssetBase
  data.totalCollateralShare = pair.totalCollateralShare
  data.totalBorrowElastic = pair.totalBorrowElastic
  data.totalBorrowBase = pair.totalBorrowBase
  data.avgExchangeRate = data.avgExchangeRate.plus(pair.exchangeRate).div(BigInt.fromI32(2))
  data.avgUtilization = data.avgUtilization.plus(pair.utilization).div(BigInt.fromI32(2))
  data.avgInterestPerSecond = data.avgInterestPerSecond.plus(pair.interestPerSecond).div(BigInt.fromI32(2))
  data.save()

  return data as KashiPairDayData
}

export function updateKashiPairHourData(event: ethereum.Event): KashiPairHourData {
  let timestamp = event.block.timestamp.toI32()
  let hourIndex = timestamp / 3600 // get unique hour within unix history
  let hourStartUnix = hourIndex * 3600 // want the rounded effect
  let hourPairID = event.address.toHex().concat('-').concat(BigInt.fromI32(hourIndex).toString())

  let pair = KashiPair.load(event.address.toHex()) as KashiPair
  let data = KashiPairHourData.load(hourPairID)
  if (data === null) {
    data = new KashiPairHourData(hourPairID)
    data.hourStartUnix = hourStartUnix
    data.pair = pair.id
    data.avgExchangeRate = pair.exchangeRate
    data.avgUtilization = pair.utilization
    data.avgInterestPerSecond = pair.interestPerSecond
  }

  data.totalAssetElastic = pair.totalAssetElastic
  data.totalAssetBase = pair.totalAssetBase
  data.totalCollateralShare = pair.totalCollateralShare
  data.totalBorrowElastic = pair.totalBorrowElastic
  data.totalBorrowBase = pair.totalBorrowBase
  data.avgExchangeRate = data.avgExchangeRate.plus(pair.exchangeRate).div(BigInt.fromI32(2))
  data.avgUtilization = data.avgUtilization.plus(pair.utilization).div(BigInt.fromI32(2))
  data.avgInterestPerSecond = data.avgInterestPerSecond.plus(pair.interestPerSecond).div(BigInt.fromI32(2))
  data.save()

  return data as KashiPairHourData
}
