import { Address, ethereum } from '@graphprotocol/graph-ts'
import { getOrCreateToken } from '.'
import { Pair } from '../../generated/schema'
import { Pair as PairContract } from '../../generated/templates/Pair/Pair'
import { FACTORY_ADDRESS, WHITELISTED_TOKEN_ADDRESSES } from '../constants/index'

export function getOrCreatePair(address: Address, block: ethereum.Block = null): Pair {
  let pair = Pair.load(address.toHex())

  if (pair === null) {
    const pairContract = PairContract.bind(address)

    const token0Address = pairContract.token0()
    const token0 = getOrCreateToken(token0Address.toHex())
    const token1Address = pairContract.token1()
    const token1 = getOrCreateToken(token1Address.toHex())

    pair = new Pair(address.toHex())

    if (WHITELISTED_TOKEN_ADDRESSES.includes(token0.id)) {
      const newPairs = token1.whitelistPairs
      newPairs.push(pair.id)
      token1.whitelistPairs = newPairs
    }
    if (WHITELISTED_TOKEN_ADDRESSES.includes(token1.id)) {
      const newPairs = token0.whitelistPairs
      newPairs.push(pair.id)
      token0.whitelistPairs = newPairs
    }

    token0.save()
    token1.save()

    pair.factory = FACTORY_ADDRESS.toHex()

    pair.name = token0.symbol.concat('-').concat(token1.symbol)

    pair.token0 = token0.id
    pair.token1 = token1.id

    pair.timestamp = block.timestamp
    pair.block = block.number
  }

  return pair as Pair
}
