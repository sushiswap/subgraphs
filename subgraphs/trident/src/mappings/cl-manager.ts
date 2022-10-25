import { getOrCreateNftPosition } from "src/functions/nft-position"
import { DecreaseLiquidity, IncreaseLiquidity } from "../../generated/ConcentratedLiquidityPoolManager/ConcentratedLiquidityPoolManager"


export function onIncreaseLiquidity(event: IncreaseLiquidity): void {
    const position = getOrCreateNftPosition(event.params.owner, event.params.pool, event.params.positionId, event.block)
    position.balance = position.balance.plus(event.params.liquidity)
    position.save()
  }
  
  
  export function onDecreaseLiquidity(event: DecreaseLiquidity): void {
    const position = getOrCreateNftPosition(event.params.owner, event.params.pool, event.params.positionId, event.block)
    position.balance = position.balance.minus(event.params.liquidity)
    position.save()
    
  }
  