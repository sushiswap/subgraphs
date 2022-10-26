import { BigDecimal, BigInt, ethereum } from "@graphprotocol/graph-ts"
import { Tick } from "../../generated/schema"
import { BIG_DECIMAL_ONE, BIG_INT_ZERO } from "../constants"
import { bigDecimalExponated, safeDiv } from "./number-converter"

export function getOrCreateTick(pairId: string, tickNumber: i32, block: ethereum.Block): Tick {
    const id = pairId.concat('#').concat(tickNumber.toString())
    
    let tick = Tick.load(id)
    if (tick === null) {
        tick = new Tick(id)
        tick.tickIdx = BigInt.fromI32(tickNumber)
        tick.pair = pairId
        tick.poolAddress = pairId
    
        tick.createdAtTimestamp = block.timestamp
        tick.createdAtBlockNumber = block.number
        tick.liquidityGross = BIG_INT_ZERO
        tick.liquidityNet = BIG_INT_ZERO
    
        tick.price0 = BIG_DECIMAL_ONE
        tick.price1 = BIG_DECIMAL_ONE
    
        // 1.0001^tick is token1/token0.
        let price0 = bigDecimalExponated(BigDecimal.fromString('1.0001'), BigInt.fromI32(tickNumber))
        tick.price0 = price0
        tick.price1 = safeDiv(BIG_DECIMAL_ONE, price0)
    }
    
    return tick
}
export function feeTierToTickSpacing(feeTier: BigInt): BigInt {
    // TODO: calculate? can be other fee tiers.
    if (feeTier.equals(BigInt.fromI32(10000))) {
        return BigInt.fromI32(200)
      }
      if (feeTier.equals(BigInt.fromI32(3000))) {
        return BigInt.fromI32(60)
      }
      if (feeTier.equals(BigInt.fromI32(1000))) {
        return BigInt.fromI32(20)
      }
      if (feeTier.equals(BigInt.fromI32(500))) {
        return BigInt.fromI32(10)
      }
      if (feeTier.equals(BigInt.fromI32(100))) {
        return BigInt.fromI32(1)
      }

    throw Error('Unexpected fee tier')
}