import { BigInt } from '@graphprotocol/graph-ts'
import { TokenKpi } from '../../generated/schema'
import {
  decreaseTokenSnapshotKpiLiquidity,
  increaseTokenSnapshotKpiLiquidity,
  increaseTokenSnapshotKpiStrategyCount,
} from './token-kpi-snapshots'

function createTokenKpi(id: string): TokenKpi {
  const kpi = new TokenKpi(id)
  kpi.strategyCount = BigInt.fromU32(0)
  kpi.liquidity = BigInt.fromU32(0)
  kpi.token = id
  kpi.save()
  return kpi as TokenKpi
}

export function getOrCreateTokenKpi(id: string): TokenKpi {
  const kpi = TokenKpi.load(id)
  if (kpi === null) {
    return createTokenKpi(id)
  }
  return kpi
}

export function increaseTokenKpiLiquidity(tokenAddress: string, amount: BigInt, timestamp: BigInt): void {
  const kpi = getOrCreateTokenKpi(tokenAddress)
  kpi.liquidity = kpi.liquidity.plus(amount)
  kpi.save()
  increaseTokenSnapshotKpiLiquidity(tokenAddress, amount, timestamp)
}

export function decreaseTokenKpiLiquidity(tokenAddress: string, amount: BigInt, timestamp: BigInt): void {
  const kpi = getOrCreateTokenKpi(tokenAddress)
  kpi.liquidity = kpi.liquidity.minus(amount)
  kpi.save()
  decreaseTokenSnapshotKpiLiquidity(tokenAddress, amount, timestamp)
}

export function increaseTokenKpiStrategyCount(tokenAddress: string, timestamp: BigInt): void {
  const kpi = getOrCreateTokenKpi(tokenAddress)
  kpi.strategyCount = kpi.strategyCount.plus(BigInt.fromU32(1))
  kpi.save()
  increaseTokenSnapshotKpiStrategyCount(tokenAddress, timestamp)
}
