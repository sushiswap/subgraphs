import { Address, ethereum } from '@graphprotocol/graph-ts'
import { LiquidityPosition } from '../../generated/schema'
import { BIG_DECIMAL_ZERO } from '../constants'

export function createLiquidityPosition(user: Address, pair: Address, block: ethereum.Block): LiquidityPosition {
  const pairAddress = pair.toHex()

  const userAddress = user.toHex()

  const id = pairAddress.concat('-').concat(userAddress)

  let liquidityPosition = LiquidityPosition.load(id)

  if (liquidityPosition === null) {
    const timestamp = block.timestamp.toI32()

    liquidityPosition = new LiquidityPosition(id)
    liquidityPosition.liquidityTokenBalance = BIG_DECIMAL_ZERO

    liquidityPosition.user = userAddress
    liquidityPosition.pair = pairAddress

    liquidityPosition.block = block.number.toI32()
    liquidityPosition.timestamp = timestamp

    liquidityPosition.save()
  }

  return liquidityPosition as LiquidityPosition
}
