import { TokenKpi } from '../../generated/schema'
import { BIG_DECIMAL_ZERO, BIG_INT_ZERO } from '../constants'

export function createTokenKpi(id: string): TokenKpi {
  let kpi = new TokenKpi(id)
  kpi.token = id
  kpi.liquidity = BIG_INT_ZERO
  kpi.liquidityNative = BIG_DECIMAL_ZERO
  kpi.liquidityUSD = BIG_DECIMAL_ZERO
  kpi.pairCount = BIG_INT_ZERO
  kpi.volumeUSD = BIG_DECIMAL_ZERO
  kpi.volume = BIG_DECIMAL_ZERO
  kpi.save()

  return kpi as TokenKpi
}

export function getTokenKpi(id: string): TokenKpi {
  return TokenKpi.load(id) as TokenKpi
}
