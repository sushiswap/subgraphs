import { LiquidityPosition } from '../../generated/schema'

export function createLiquidityPosition(id: string): LiquidityPosition {
  const position = new LiquidityPosition(id)
  const split = id.split(':')
  const pair = split[0]
  const user = split[1]
  position.pair = pair
  position.user = user
  position.save()
  return position
}

export function getLiquidityPosition(id: string): LiquidityPosition {
  return LiquidityPosition.load(id) as LiquidityPosition
}

export function getOrCreateLiquidityPosition(id: string): LiquidityPosition {
  const position = LiquidityPosition.load(id)

  if (position === null) {
    return createLiquidityPosition(id)
  }

  return position as LiquidityPosition
}
