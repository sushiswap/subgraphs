import { BigInt } from '@graphprotocol/graph-ts'
import { Balance } from '../../generated/schema'

export function getBalanceId(userId: string, tokenId: string): string {
  return userId.concat('-').concat(tokenId)
}

export function createBalance(userId: string, tokenId: string): Balance {
  const id = getBalanceId(userId, tokenId)

  let balance = Balance.load(id)

  if (balance === null) {
    balance = new Balance(id)
    balance.user = userId
    balance.token = tokenId
    balance.share = BigInt.fromU32(0)
    balance.save()
  }

  return balance as Balance
}

export function getOrCreateBalance(userId: string, tokenId: string): Balance {
  const id = getBalanceId(userId, tokenId)

  const balance = Balance.load(id)

  if (balance === null) {
    return createBalance(userId, tokenId)
  }

  return balance
}
