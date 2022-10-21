import { BigDecimal } from "@graphprotocol/graph-ts"
import { getOrCreateBundle, getTokenPrice } from "../functions"
import { Token } from "../../generated/schema"
import { BIG_DECIMAL_ZERO } from "../constants"


export class AmountType {
    eth: BigDecimal
    usd: BigDecimal
}

export function getAdjustedAmounts(
    tokenAmount0: BigDecimal,
    token0: Token,
    tokenAmount1: BigDecimal,
    token1: Token
): AmountType {
    let token0Price = getTokenPrice(token0.id)
    let token1Price = getTokenPrice(token1.id)

    let derivedNative0 = token0Price.derivedNative
    let derivedNative1 = token1Price.derivedNative
    let bundle = getOrCreateBundle()

    let native = BIG_DECIMAL_ZERO

    if (token0Price.derivedNative.gt(BIG_DECIMAL_ZERO) && token1Price.derivedNative.gt(BIG_DECIMAL_ZERO)) {
        native = tokenAmount0.times(derivedNative0).plus(tokenAmount1.times(derivedNative1)).div(BigDecimal.fromString('2'))
    }

    // take full value of the priced token
    if (token0Price.derivedNative.gt(BIG_DECIMAL_ZERO) && !token1Price.derivedNative.gt(BIG_DECIMAL_ZERO)) {
        native = tokenAmount0.times(derivedNative0)
    }

    // take full value of the priced token
    if (!token0Price.derivedNative.gt(BIG_DECIMAL_ZERO) && token1Price.derivedNative.gt(BIG_DECIMAL_ZERO)) {
        native = tokenAmount1.times(derivedNative1)
    }

    // Define USD values based on ETH derived values.
    let usd = native.times(bundle.nativePrice)

    return { eth: native, usd }
}
