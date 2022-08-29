import { BigDecimal, BigInt, log } from "@graphprotocol/graph-ts";
import { StargatePool } from "../../generated/StargateUSDC/StargatePool";
import { Pool } from "../../generated/schema";
import { Swap } from "../../generated/StargateUSDC/StargatePool";
import { XSWAP_ADDRESS } from "../constants";
import { getOrCreateToken } from "../functions/token";

export function onSwap(event: Swap): void {
    if (event.params.from.equals(XSWAP_ADDRESS)) {
        const pool = getOrCreatePool(event)

        pool.swapCount = pool.swapCount.plus(BigInt.fromI32(1))
        pool.volume = pool.volume.plus(toDecimal(event.params.amountSD, BigInt.fromI32(6))) // Not sure why amountSD is always 6 decimals and not related to token decimal
        pool.save()
    }
}


function getOrCreatePool(event: Swap): Pool {
    let pool = Pool.load(event.address.toHex())
    if (pool == null) {
        pool = new Pool(event.address.toHex())
        pool.swapCount = BigInt.fromI32(0)
        pool.volume = BigDecimal.fromString('0')
        pool.token = StargatePool.bind(event.address).token().toHex()
        const token = getOrCreateToken(pool.token, event)
        pool.name = token.symbol
        pool.save()
    }
    return pool
}

export function toDecimal(amount: BigInt, decimals: BigInt): BigDecimal {
    return amount.divDecimal(
        BigInt.fromI32(10)
            .pow(decimals.toI32() as u8)
            .toBigDecimal()
    )
}
