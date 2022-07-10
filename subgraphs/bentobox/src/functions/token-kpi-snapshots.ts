import { BigInt } from '@graphprotocol/graph-ts'
import { TokenDailyKpi, TokenHourlyKpi } from '../../generated/schema'
import { DAY_INFIX, HOUR_INFIX } from '../constants'
import { DAY_IN_SECONDS, HOUR_IN_SECONDS } from '../constants/time'
import { getOrCreateTokenKpi } from './token-kpi'

function getOrCreateTokenHourlyKpi(tokenId: string, timestamp: BigInt): TokenHourlyKpi {
  let id = getTokenHourlyKpiId(tokenId, timestamp)

  let hourlyKpi = TokenHourlyKpi.load(id)

  if (hourlyKpi === null) {
    hourlyKpi = new TokenHourlyKpi(id)
    let tokenKpi = getOrCreateTokenKpi(tokenId)
    hourlyKpi.token = tokenId
    hourlyKpi.strategyCount = tokenKpi.strategyCount
    hourlyKpi.liquidity = tokenKpi.liquidity
    hourlyKpi.newStrategyCount = BigInt.fromU32(0)
    hourlyKpi.newLiquidity = BigInt.fromU32(0)
    hourlyKpi.save()
  }

  return hourlyKpi
}

function getOrCreateTokenDailyKpi(tokenId: string, timestamp: BigInt): TokenDailyKpi {
  let id = getTokenDailyKpiId(tokenId, timestamp)
  let dailyKpi = TokenDailyKpi.load(id)

  if (dailyKpi === null) {
    dailyKpi = new TokenDailyKpi(id)

    let tokenKpi = getOrCreateTokenKpi(tokenId)
    dailyKpi.token = tokenId
    dailyKpi.strategyCount = tokenKpi.strategyCount
    dailyKpi.liquidity = tokenKpi.liquidity
    dailyKpi.newStrategyCount = BigInt.fromU32(0)
    dailyKpi.newLiquidity = BigInt.fromU32(0)
    dailyKpi.save()
  }

  return dailyKpi
}

function getHourStartDate(timestamp: BigInt): i32 {
  let hourIndex = timestamp.toI32() / HOUR_IN_SECONDS // get unique hour within unix history
  return hourIndex * HOUR_IN_SECONDS // want the rounded effect
}

function getDayStartDate(timestamp: BigInt): i32 {
  let dayIndex = timestamp.toI32() / DAY_IN_SECONDS // get unique day within unix history
  return dayIndex * DAY_IN_SECONDS // want the rounded effect
}

function getTokenHourlyKpiId(tokenId: string, timestamp: BigInt): string {
  let startDate = getHourStartDate(timestamp)
  return tokenId.concat(HOUR_INFIX).concat(BigInt.fromI32(startDate).toString())
}

function getTokenDailyKpiId(tokenId: string, timestamp: BigInt): string {
  let startDate = getDayStartDate(timestamp)
  return tokenId.concat(DAY_INFIX).concat(BigInt.fromI32(startDate).toString())
}

export function increaseTokenSnapshotKpiLiquidity(tokenAddress: string, amount: BigInt, timestamp: BigInt): void {
  let hourlyKpi = getOrCreateTokenHourlyKpi(tokenAddress, timestamp)
  hourlyKpi.liquidity = hourlyKpi.liquidity.plus(amount)
  hourlyKpi.newLiquidity = hourlyKpi.newLiquidity.plus(amount)
  hourlyKpi.save()
  let dailyKpi = getOrCreateTokenDailyKpi(tokenAddress, timestamp)
  dailyKpi.liquidity = dailyKpi.liquidity.plus(amount)
  dailyKpi.newLiquidity = dailyKpi.newLiquidity.plus(amount)
  dailyKpi.save()
}

export function decreaseTokenSnapshotKpiLiquidity(tokenAddress: string, amount: BigInt, timestamp: BigInt): void {
  let hourlyKpi = getOrCreateTokenHourlyKpi(tokenAddress, timestamp)
  hourlyKpi.liquidity = hourlyKpi.liquidity.minus(amount)
  hourlyKpi.newLiquidity = hourlyKpi.newLiquidity.minus(amount)
  hourlyKpi.save()
  let dailyKpi = getOrCreateTokenDailyKpi(tokenAddress, timestamp)
  dailyKpi.liquidity = dailyKpi.liquidity.minus(amount)
  dailyKpi.newLiquidity = dailyKpi.newLiquidity.minus(amount)
  dailyKpi.save()
}

export function increaseTokenSnapshotKpiStrategyCount(tokenAddress: string, timestamp: BigInt): void {
  let hourlyKpi = getOrCreateTokenHourlyKpi(tokenAddress, timestamp)
  hourlyKpi.strategyCount = hourlyKpi.strategyCount.plus(BigInt.fromU32(1))
  hourlyKpi.newStrategyCount = hourlyKpi.newStrategyCount.plus(BigInt.fromU32(1))
  hourlyKpi.save()
  let dailyKpi = getOrCreateTokenDailyKpi(tokenAddress, timestamp)
  dailyKpi.strategyCount = dailyKpi.strategyCount.plus(BigInt.fromU32(1))
  dailyKpi.newStrategyCount = dailyKpi.newStrategyCount.plus(BigInt.fromU32(1))
  dailyKpi.save()
}
