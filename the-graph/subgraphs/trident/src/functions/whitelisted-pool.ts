import { WhitelistedPool } from '../../generated/schema'

export function getWhitelistedPool(id: string): WhitelistedPool | null {
  return WhitelistedPool.load(id)
}

export function createWhitelistedPool(id: string): WhitelistedPool {
  const whitelistedPool = new WhitelistedPool(id)
  return whitelistedPool
}

export function getOrCreateWhitelistedPool(id: string): WhitelistedPool {
  const whitelistedPool = getWhitelistedPool(id)

  if (whitelistedPool === null) {
    return createWhitelistedPool(id)
  }

  return whitelistedPool as WhitelistedPool
}
