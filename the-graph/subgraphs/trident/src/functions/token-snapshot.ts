import { Token, TokenDaySnapshot, TokenKpi, TokenPrice } from '../../generated/schema'
import { BigInt } from '@graphprotocol/graph-ts'
import { getTokenPrice } from './token-price'

export function updateTokenDaySnapshot(
  timestamp: BigInt,
  token: Token,
  tokenKpi: TokenKpi,
  nativeTokenPrice: TokenPrice
): void {
  let tokenPrice = getTokenPrice(token.id)

  let dayID = timestamp.toI32() / 86400

  let dayStartTimestamp = dayID * 86400

  let tokenDayID = token.id.toString().concat('-').concat(BigInt.fromI32(dayID).toString())

  let snapshot = TokenDaySnapshot.load(tokenDayID)

  if (snapshot === null) {
    snapshot = new TokenDaySnapshot(tokenDayID)
    snapshot.date = dayStartTimestamp
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
