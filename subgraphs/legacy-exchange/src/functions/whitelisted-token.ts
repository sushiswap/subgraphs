import { WhitelistedToken } from '../../generated/schema'
import { store } from '@graphprotocol/graph-ts'

export function createWhitelistedToken(id: string): WhitelistedToken {
  const whitelisted = new WhitelistedToken(id)
  // whitelisted.token = id
  // whitelisted.price = id
  whitelisted.save()
  return whitelisted
}

export function getWhitelistedToken(id: string): WhitelistedToken {
  return WhitelistedToken.load(id) as WhitelistedToken
}

export function getOrCreateWhitelistedToken(id: string): WhitelistedToken {
  const token = WhitelistedToken.load(id)

  if (token === null) {
    return createWhitelistedToken(id)
  }

  return token as WhitelistedToken
}

export function deleteWhitelistedToken(id: string): void {
  store.remove('WhitelistedToken', id)
  //
}

export function createWhitelistedTokenIfNotExist(id: string): void {
  //
}
