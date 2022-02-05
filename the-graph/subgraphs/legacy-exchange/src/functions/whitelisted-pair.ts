import { WhitelistedPair } from '../../generated/schema'

export function getWhitelistedPair(id: string): WhitelistedPair {
  return WhitelistedPair.load(id) as WhitelistedPair
}

export function createWhitelistedPair(id: string): WhitelistedPair {
  return new WhitelistedPair(id)
}

export function getOrCreateWhitelistedPair(id: string): WhitelistedPair {
  const whitelistedPool = getWhitelistedPair(id)

  if (whitelistedPool === null) {
    return createWhitelistedPair(id)
  }

  return whitelistedPool as WhitelistedPair
}
