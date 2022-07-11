import { BIG_DECIMAL_ZERO } from '../constants'
import { TokenKpi } from '../../generated/schema'

export function createTokenKpi(id: string): TokenKpi {
  let tokenKpi = new TokenKpi(id)
  tokenKpi.derivedETH = BIG_DECIMAL_ZERO
  tokenKpi.pools = []
  tokenKpi.save()

  return tokenKpi as TokenKpi
}

export function getTokenKpi(id: string): TokenKpi {
  return TokenKpi.load(id) as TokenKpi
}
