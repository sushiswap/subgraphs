import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts'
import { IncreaseLiquidity } from '../../generated/ConcentratedLiquidityPoolManager/ConcentratedLiquidityPoolManager'
import { NftPosition } from '../../generated/schema'
import { BIG_INT_ZERO } from '../constants'

export function getOrCreateNftPosition(user: Address, pair: Address, positionId: BigInt, block: ethereum.Block): NftPosition {
  const pairAddress = pair.toHex()
  const userAddress = user.toHex()
  const id = pairAddress.concat(':').concat(positionId.toString())

  let position = NftPosition.load(id)

  if (position === null) {
    position = new NftPosition(id)

    position.user = userAddress
    position.pair = pairAddress
    position.balance = BIG_INT_ZERO
    position.createdAtBlock = block.number
    position.createdAtTimestamp = block.timestamp

    position.save()
  }

  return position as NftPosition
}
