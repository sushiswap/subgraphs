import { Address, ethereum } from '@graphprotocol/graph-ts'
import { UserKashiPair } from '../../generated/schema'

export function createUserKashiPair(user: Address, pair: Address, block: ethereum.Block): UserKashiPair {
  const id = getUserKashiPairId(user, pair)

  const userPair = new UserKashiPair(id)

  userPair.user = user.toHex()
  userPair.pair = pair.toHex()
  userPair.block = block.number
  userPair.timestamp = block.timestamp
  userPair.save()

  return userPair as UserKashiPair
}

export function getOrCreatUserKashiPair(user: Address, pair: Address, block: ethereum.Block): UserKashiPair {
  let userPair = UserKashiPair.load(getUserKashiPairId(user, pair))

  if (userPair === null) {
    userPair = createUserKashiPair(user, pair, block)
  }

  userPair.block = block.number
  userPair.timestamp = block.timestamp
  userPair.save()

  return userPair as UserKashiPair
}

function getUserKashiPairId(user: Address, pair: Address): string {
  return user.toHex().concat('-').concat(pair.toHex())
}
