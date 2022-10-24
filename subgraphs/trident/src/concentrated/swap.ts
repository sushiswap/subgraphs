import { BigDecimal, BigInt } from '@graphprotocol/graph-ts'
import { Swap } from '../../generated/schema'
import { Swap as SwapEvent } from '../../generated/templates/ConcentratedLiquidityPool/ConcentratedLiquidityPool'
import { BIG_INT_ONE, PairType } from '../constants'
import {
    convertTokenToDecimal, getConcentratedLiquidityInfo, getOrCreateBundle, getOrCreateFactory, getOrCreateToken, getOrCreateTransaction, getPair, increaseFactoryTransactionCount,
    sqrtPriceX96ToTokenPrices
} from '../functions'
import { getNativePriceInUSD, updateTokenPrice } from '../pricing'
import { Volume } from '../update-price-tvl-volume'
import { getAdjustedAmounts } from './pricing'
import { updateDerivedTVLAmounts } from './tvl'

export function handleSwap(event: SwapEvent): Volume {

    getOrCreateTransaction(event)

    const pair = getPair(event.address.toHex())
    const tokenIn = getOrCreateToken(event.params.tokenIn.toHex())
    const tokenOut = getOrCreateToken(event.params.tokenOut.toHex())

    const isTokenInFirstToken = pair.token0 == tokenIn.id

    const amountIn = convertTokenToDecimal(event.params.amountIn, tokenIn.decimals)
    const amountOut = convertTokenToDecimal(event.params.amountOut, tokenOut.decimals)

    const amounts = getAdjustedAmounts(amountIn, tokenIn, amountOut, tokenOut)
    const volumeNative = amounts.native.div(BigDecimal.fromString('2'))
    const volumeUSD = amounts.usd.div(BigDecimal.fromString('2'))


    const feesNative = volumeNative.times(pair.swapFee.divDecimal(BigDecimal.fromString('10000')))
    const feesUSD = volumeUSD.times(pair.swapFee.divDecimal(BigDecimal.fromString('10000')))

    const factory = getOrCreateFactory(PairType.CONCENTRATED_LIQUIDITY_POOL)
    factory.volumeUSD = factory.volumeUSD.plus(volumeUSD)
    factory.volumeNative = factory.volumeNative.plus(volumeNative)
    factory.feesNative = factory.feesNative.plus(feesNative)
    factory.feesUSD = factory.feesUSD.plus(feesUSD)
    factory.save()

    const globalFactory = getOrCreateFactory(PairType.ALL)
    globalFactory.volumeUSD = globalFactory.volumeUSD.plus(volumeUSD)
    globalFactory.volumeNative = globalFactory.volumeNative.plus(volumeNative)
    globalFactory.feesNative = globalFactory.feesNative.plus(feesNative)
    globalFactory.feesUSD = globalFactory.feesUSD.plus(feesUSD)
    globalFactory.save()


    const concentratedLiquidity = getConcentratedLiquidityInfo(pair.id)
    pair.liquidity = event.params.totalLiquidity
    concentratedLiquidity.tick = BigInt.fromI32(event.params.tick)
    concentratedLiquidity.sqrtPrice = event.params.price
    concentratedLiquidity.save()

    const prices = sqrtPriceX96ToTokenPrices(concentratedLiquidity.sqrtPrice, tokenIn, tokenOut)
    pair.token0Price = isTokenInFirstToken ? prices[0] : prices[1]
    pair.token1Price = isTokenInFirstToken ? prices[1] : prices[0]
    pair.save()

    const bundle = getOrCreateBundle()
    bundle.nativePrice = getNativePriceInUSD() // TODO: generate native/stable pool addresses for CL, include if block > ?
    bundle.save()
    updateTokenPrice(pair.token0, bundle.nativePrice)
    updateTokenPrice(pair.token1, bundle.nativePrice)

    let oldLiquidityNative = pair.liquidityNative

    // TODO: check if this is correct, but if you swap 1 token for another, the liquidity should decrease for one
    tokenIn.liquidity = tokenIn.liquidity.plus(event.params.amountIn)
    tokenOut.liquidity = tokenOut.liquidity.minus(event.params.amountOut)
    pair.reserve0 = isTokenInFirstToken ? pair.reserve0.plus(event.params.amountIn) : pair.reserve0.minus(event.params.amountOut)
    pair.reserve1 = isTokenInFirstToken ? pair.reserve1.minus(event.params.amountOut) : pair.reserve1.plus(event.params.amountIn)

    updateDerivedTVLAmounts(pair, oldLiquidityNative)

    const id = event.transaction.hash.toHex().concat('-cl-').concat(pair.txCount.toString())
    let swap = Swap.load(id)
    if (swap === null) {
        swap = new Swap(id)
        swap.transaction = event.transaction.hash.toHex()
        swap.timestamp = event.block.timestamp
        swap.pair = event.address.toHex()
        swap.sender = event.transaction.from.toHex()
        swap.tokenIn = event.params.tokenIn.toHex()
        swap.tokenOut = event.params.tokenOut.toHex()
        swap.amountIn = amountIn
        swap.amountOut = amountOut
        swap.amountUSD = volumeUSD
        swap.to = event.transaction.to!.toHex()
        swap.logIndex = event.logIndex
        // swap.sqrtPriceX96 = event.params.sqrtPriceX96 // TODO: missing
        // swap.tick = event.BigInt.fromI32(event.params.tick as i32) // TODO: missing
        swap.save()
    }

    pair.txCount = pair.txCount.plus(BIG_INT_ONE)
    pair.save()
    tokenIn.txCount = tokenIn.txCount.plus(BIG_INT_ONE)
    tokenIn.save()
    tokenOut.txCount = tokenOut.txCount.plus(BIG_INT_ONE)
    tokenOut.save()

    increaseFactoryTransactionCount(PairType.CONCENTRATED_LIQUIDITY_POOL)
    return {
        volumeUSD,
        volumeNative,
        feesNative,
        feesUSD,
        amount0Total: amountIn,
        amount1Total: amountOut
    }
}
