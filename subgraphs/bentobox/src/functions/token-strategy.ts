import { TokenStrategy } from '../../generated/schema'

export function getTokenStrategy(tokenAddress: string): TokenStrategy {
  return TokenStrategy.load(tokenAddress) as TokenStrategy
}
