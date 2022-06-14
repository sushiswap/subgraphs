import { Address, ethereum } from '@graphprotocol/graph-ts'
import { LiquidityPosition } from '../../generated/schema'

export function getOrCreateLiquidityPosition(user: Address, pair: Address, block: ethereum.Block): LiquidityPosition {
  const pairAddress = pair.toHex()

  const userAddress = user.toHex()

  const id = pairAddress.concat('-').concat(userAddress)

  let liquidityPosition = LiquidityPosition.load(id)

  if (liquidityPosition === null) {
    const timestamp = block.timestamp.toI32()

    liquidityPosition = new LiquidityPosition(id)

    liquidityPosition.user = userAddress
    liquidityPosition.pair = pairAddress

    liquidityPosition.block = block.number.toI32()
    liquidityPosition.timestamp = timestamp

    liquidityPosition.save()
  }

  return liquidityPosition as LiquidityPosition
}
