import { BigDecimal, BigInt } from '@graphprotocol/graph-ts'
import { Token, TokenPrice } from '../generated/schema'
import {
  Swap as SwapEvent,
  Sync as SyncEvent,
  Transfer as TransferEvent
} from '../generated/templates/ConstantProductPool/ConstantProductPool'
import {
  BIG_DECIMAL_ZERO,
  BIG_INT_ZERO,
  PairType,
  WHITELISTED_TOKEN_ADDRESSES
} from './constants'
import {
  convertTokenToDecimal, getOrCreateBundle,
  getOrCreateFactory,
  getOrCreateToken,
  getPair,
  getRebase,
  getTokenPrice, toElastic
} from './functions'
import { getNativePriceInUSD, updateTokenPrice } from './pricing'
import { isBurn, isInitialTransfer, isMint } from './transfer'

export function updateTvlAndTokenPrices(event: SyncEvent): void {
  const pairId = event.address.toHex()
  const pair = getPair(pairId)
  const token0 = getOrCreateToken(pair.token0)
  const token1 = getOrCreateToken(pair.token1)
  const globalFactory = getOrCreateFactory(PairType.ALL)
  const factory = getOrCreateFactory(pair.type)

  // Reset token liquidity, will be updated again later when price is updated
  token0.liquidity = token0.liquidity.minus(pair.reserve0)
  token1.liquidity = token1.liquidity.minus(pair.reserve1)
  token0.save()
  token1.save()
  globalFactory.liquidityNative = globalFactory.liquidityNative.minus(pair.trackedLiquidityNative)
  factory.liquidityNative = factory.liquidityNative.minus(pair.trackedLiquidityNative)

  let reserve0: BigInt
  let reserve1: BigInt
  if (pair.type == PairType.CONSTANT_PRODUCT_POOL) {
    const rebase0 = getRebase(token0.id)
    const rebase1 = getRebase(token1.id)
    reserve0 = toElastic(rebase0, event.params.reserve0, false)
    reserve1 = toElastic(rebase1, event.params.reserve1, false)
  } else {
    reserve0 = event.params.reserve0
    reserve1 = event.params.reserve1
  }

  pair.reserve0 = reserve0
  pair.reserve1 = reserve1
  const reserve0Decimals = convertTokenToDecimal(pair.reserve0, token0.decimals)
  const reserve1Decimals = convertTokenToDecimal(pair.reserve1, token1.decimals)

  if (pair.reserve1.notEqual(BIG_INT_ZERO)) {
    if (pair.type == PairType.CONSTANT_PRODUCT_POOL) {
      pair.token0Price = reserve0Decimals.div(reserve1Decimals)
    } else if (pair.type == PairType.STABLE_POOL) {
      const token0Price = deriveTokenPrice(reserve0, reserve1, token0, token1, true)
      pair.token0Price = token0Price
    }
  } else {
    pair.token0Price = BIG_DECIMAL_ZERO
  }

  if (pair.reserve0.notEqual(BIG_INT_ZERO)) {
    if (pair.type == PairType.CONSTANT_PRODUCT_POOL) {
      pair.token1Price = reserve1Decimals.div(reserve0Decimals)
    } else if (pair.type == PairType.STABLE_POOL) {
      const token1Price = deriveTokenPrice(reserve0, reserve1, token0, token1, false)
      pair.token1Price = token1Price
    }
  } else {
    pair.token1Price = BIG_DECIMAL_ZERO
  }
  pair.save()

  const bundle = getOrCreateBundle()
  bundle.nativePrice = getNativePriceInUSD()
  bundle.save()

  const token0Price = updateTokenPrice(token0.id, bundle.nativePrice)
  const token1Price = updateTokenPrice(token1.id, bundle.nativePrice)


  // get tracked liquidity - will be 0 if neither is in whitelist
  let trackedLiquidityNative: BigDecimal
  if (bundle.nativePrice.notEqual(BIG_DECIMAL_ZERO)) {
    trackedLiquidityNative = getLiquidityUSD(reserve0Decimals, token0Price, reserve1Decimals, token1Price).div(
      bundle.nativePrice
    )
  } else {
    trackedLiquidityNative = BIG_DECIMAL_ZERO
  }

  // Set token liquidity with updated prices
  token0.liquidity = token0.liquidity.plus(pair.reserve0)
  token0.liquidityNative = convertTokenToDecimal(token0.liquidity, token0.decimals).times(
    token0Price.derivedNative
  )
  token0.liquidityUSD = token0.liquidityNative.times(bundle.nativePrice)

  token1.liquidity = token1.liquidity.plus(pair.reserve1)
  token1.liquidityNative = convertTokenToDecimal(token1.liquidity, token1.decimals).times(
    token1Price.derivedNative
  )
  token1.liquidityUSD = token1.liquidityNative.times(bundle.nativePrice)
  token0.save()
  token1.save()

  pair.trackedLiquidityNative = trackedLiquidityNative
  pair.liquidityNative = convertTokenToDecimal(pair.reserve0, token0.decimals)
    .times(token0Price.derivedNative)
    .plus(convertTokenToDecimal(pair.reserve1, token1.decimals).times(token1Price.derivedNative))

  pair.liquidityUSD = pair.liquidityNative.times(bundle.nativePrice)
  pair.save()


  globalFactory.liquidityNative = globalFactory.liquidityNative.plus(trackedLiquidityNative)
  globalFactory.liquidityUSD = globalFactory.liquidityNative.times(bundle.nativePrice)
  globalFactory.save()

  factory.liquidityNative = factory.liquidityNative.plus(trackedLiquidityNative)
  factory.liquidityUSD = factory.liquidityNative.times(bundle.nativePrice)
  factory.save()
}

export function updateVolume(event: SwapEvent): Volume {
  const pair = getPair(event.address.toHex())
  const tokenIn = getOrCreateToken(event.params.tokenIn.toHex())
  const tokenOut = getOrCreateToken(event.params.tokenOut.toHex())
  const amountIn = convertTokenToDecimal(event.params.amountIn, tokenIn.decimals)
  const amountOut = convertTokenToDecimal(event.params.amountOut, tokenOut.decimals)

  const isFirstToken = pair.token0 == event.params.tokenIn.toHex()
  const volumeUSD = getVolumeUSD(amountIn, amountOut, pair.id, isFirstToken)
  const bundle = getOrCreateBundle()

  let volumeNative: BigDecimal

  if (bundle.nativePrice.equals(BIG_DECIMAL_ZERO)) {
    volumeNative = BIG_DECIMAL_ZERO
  } else {
    volumeNative = volumeUSD.div(bundle.nativePrice)
  }

  const feesNative = volumeNative.times(pair.swapFee.divDecimal(BigDecimal.fromString('10000')))
  const feesUSD = volumeUSD.times(pair.swapFee.divDecimal(BigDecimal.fromString('10000')))

  tokenIn.volume = tokenIn.volume.plus(amountIn)
  tokenIn.volumeNative = tokenIn.volumeNative.plus(volumeNative)
  tokenIn.volumeUSD = tokenIn.volumeUSD.plus(volumeUSD)
  tokenIn.feesNative = tokenIn.feesNative.plus(feesNative)
  tokenIn.feesUSD = tokenIn.feesUSD.plus(feesUSD)
  tokenIn.save()

  tokenOut.volume = tokenOut.volume.plus(amountOut)
  tokenOut.volumeNative = tokenOut.volumeNative.plus(volumeNative)
  tokenOut.volumeUSD = tokenOut.volumeUSD.plus(volumeUSD)
  tokenOut.feesNative = tokenOut.feesNative.plus(feesNative)
  tokenOut.feesUSD = tokenOut.feesUSD.plus(feesUSD)
  tokenOut.save()


  pair.volumeNative = pair.volumeNative.plus(volumeNative)
  pair.volumeUSD = pair.volumeUSD.plus(volumeUSD)
  pair.volumeToken0 = pair.volumeToken0.plus(amountIn)
  pair.volumeToken1 = pair.volumeToken1.plus(amountOut)
  pair.feesNative = pair.feesNative.plus(feesNative)
  pair.feesUSD = pair.feesUSD.plus(feesUSD)
  pair.save()

  const factory = getOrCreateFactory(pair.type)
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

  return {
    volumeUSD,
    volumeNative,
    feesNative,
    feesUSD,
    amount0Total: amountIn,
    amount1Total: amountOut
  }
}

export function updateLiquidity(event: TransferEvent): void {
  if (isInitialTransfer(event)) {
    return
  }
  const pair = getPair(event.address.toHex())

  if (isMint(event)) {
    pair.liquidity = pair.liquidity.plus(event.params.amount)
  }

  if (isBurn(event)) {
    pair.liquidity = pair.liquidity.minus(event.params.amount)
  }

  pair.save()
}


/**
 * Accepts tokens and amounts, return tracked amount based on token whitelist
 * If one token on whitelist, return amount in that token converted to USD.
 * If both are, return average of two amounts
 * If neither is, return 0
 */
export function getVolumeUSD(
  amountIn: BigDecimal,
  amountOut: BigDecimal,
  pairAddress: string,
  isFirstToken: boolean
): BigDecimal {
  const bundle = getOrCreateBundle()

  const pair = getPair(pairAddress)
  const tokenIn = getOrCreateToken(isFirstToken ? pair.token0 : pair.token1)
  const tokenOut = getOrCreateToken(!isFirstToken ? pair.token0 : pair.token1)
  const tokenInPrice = getTokenPrice(tokenIn.id)
  const tokenOutPrice = getTokenPrice(tokenOut.id)
  const tokenInUSD = tokenInPrice.derivedNative.times(bundle.nativePrice)
  const tokenOutUSD = tokenOutPrice.derivedNative.times(bundle.nativePrice)

  // both are whitelist tokens, take average of both amounts
  if (WHITELISTED_TOKEN_ADDRESSES.includes(tokenIn.id) && WHITELISTED_TOKEN_ADDRESSES.includes(tokenOut.id)) {
    return amountIn
      .times(tokenInUSD)
      .plus(amountOut.times(tokenOutUSD))
      .div(BigDecimal.fromString('2'))
  }

  // take full value of the whitelisted token amount
  if (WHITELISTED_TOKEN_ADDRESSES.includes(tokenIn.id) && !WHITELISTED_TOKEN_ADDRESSES.includes(tokenOut.id)) {
    return amountIn.times(tokenInUSD)
  }

  // take full value of the whitelisted token amount
  if (!WHITELISTED_TOKEN_ADDRESSES.includes(tokenIn.id) && WHITELISTED_TOKEN_ADDRESSES.includes(tokenOut.id)) {
    return amountOut.times(tokenOutUSD)
  }

  // neither token is on white list, tracked volume is 0
  return BIG_DECIMAL_ZERO
}


/**
 * Accepts tokens and amounts, return tracked amount based on token whitelist
 * If one token on whitelist, return amount in that token converted to USD * 2.
 * If both are, return sum of two amounts
 * If neither is, return 0
 */
export function getLiquidityUSD(
  tokenAmount0: BigDecimal,
  token0Price: TokenPrice,
  tokenAmount1: BigDecimal,
  token1Price: TokenPrice
): BigDecimal {
  const bundle = getOrCreateBundle()
  let price0 = token0Price.derivedNative.times(bundle.nativePrice)
  let price1 = token1Price.derivedNative.times(bundle.nativePrice)

  // both are whitelist tokens, take average of both amounts
  if (WHITELISTED_TOKEN_ADDRESSES.includes(token0Price.id) && WHITELISTED_TOKEN_ADDRESSES.includes(token1Price.id)) {
    return tokenAmount0.times(price0).plus(tokenAmount1.times(price1))
  }

  // take double value of the whitelisted token amount
  if (WHITELISTED_TOKEN_ADDRESSES.includes(token0Price.id) && !WHITELISTED_TOKEN_ADDRESSES.includes(token1Price.id)) {
    return tokenAmount0.times(price0).times(BigDecimal.fromString('2'))
  }

  // take double value of the whitelisted token amount
  if (!WHITELISTED_TOKEN_ADDRESSES.includes(token0Price.id) && WHITELISTED_TOKEN_ADDRESSES.includes(token1Price.id)) {
    return tokenAmount1.times(price1).times(BigDecimal.fromString('2'))
  }

  // neither token is on white list, tracked volume is 0
  return BIG_DECIMAL_ZERO
}

export class Volume {
  volumeUSD: BigDecimal
  volumeNative: BigDecimal
  feesNative: BigDecimal
  feesUSD: BigDecimal
  amount0Total: BigDecimal
  amount1Total: BigDecimal
}


function deriveTokenPrice(
  reserve0: BigInt, reserve1: BigInt,
  token0: Token, token1: Token,
  direction: boolean
): BigDecimal {
  if (reserve0.equals(BIG_INT_ZERO) || reserve1.equals(BIG_INT_ZERO)) {
    return BIG_DECIMAL_ZERO
  }

  const _reserve0 = parseInt(reserve0.times(BigInt.fromString('1000000000000')).div(BigInt.fromString('10').pow(token0.decimals.toI32() as u8)).toString())
  const _reserve1 = parseInt(reserve1.times(BigInt.fromString('1000000000000')).div(BigInt.fromString('10').pow(token1.decimals.toI32() as u8)).toString())
  const _reserve0_BI = BigDecimal.fromString(_reserve0.toString())
  const _reserve1_BI = BigDecimal.fromString(_reserve1.toString())

  const calcDirection = _reserve0_BI.gt(_reserve1_BI)
  const xBN = calcDirection ? _reserve0 : _reserve1
  const x = parseInt(xBN.toString())

  const k = parseInt(_reserve0_BI.times(_reserve1_BI).times(_reserve0_BI.times(_reserve0_BI).plus(_reserve1_BI.times(_reserve1_BI))).toString())
  const q = k / x / 2
  const qD = -q / x // devivative of q
  const Q = Math.pow(x, 6) / 27 + q * q
  const QD = (6 * Math.pow(x, 5)) / 27 + 2 * q * qD // derivative of Q
  const sqrtQ = Math.sqrt(Q)
  const sqrtQD = (1.0 / 2.0 / sqrtQ) * QD // derivative of sqrtQ
  const a = sqrtQ + q
  const aD = sqrtQD + qD
  const b = sqrtQ - q
  const bD = sqrtQD - qD
  const a3 = Math.pow(a, 1.0 / 3.0)
  const a3D = (((1.0 / 3.0) * a3) / a) * aD
  const b3 = Math.pow(b, 1.0 / 3.0)
  const b3D = (((1.0 / 3.0) * b3) / b) * bD
  const yD = a3D - b3D

  // KEEP THIS FOR DEBUGGING
  // log.debug('{ calcDirection: {} xBN: {} x: {} k: {} q: {} qD: {} Q: {} QD: {} sqrtQ: {} sqrtQD: {} a: {} aD: {} b: {} bD: {} a3: {} a3D: {} b3: {} b3D: {} yD: {} }', [
  //   calcDirection.toString(),
  //   xBN.toString(),
  //   x.toString(),
  //   k.toString(),
  //   q.toString(),
  //   qD.toString(),
  //   Q.toString(),
  //   QD.toString(),
  //   sqrtQ.toString(),
  //   sqrtQD.toString(),
  //   a.toString(),
  //   aD.toString(),
  //   b.toString(),
  //   bD.toString(),
  //   a3.toString(),
  //   a3D.toString(),
  //   b3.toString(),
  //   b3D.toString(),
  //   yD.toString()
  // ])
  const rebase0 = getRebase(token0.id)
  const rebase1 = getRebase(token1.id)

  const elastic2Base0 = rebase0.base.isZero() || rebase0.elastic.isZero() ? 1 : parseInt(rebase0.elastic.toString()) / parseInt(rebase0.base.toString())
  const elastic2Base1 = rebase1.base.isZero() || rebase1.elastic.isZero() ? 1 : parseInt(rebase1.elastic.toString()) / parseInt(rebase1.base.toString())

  const ydS0 = (yD * elastic2Base0) / elastic2Base0
  const ydS1 = (yD * elastic2Base1) / elastic2Base1

  const yDShares = calcDirection ? ydS0 : ydS1

  const price = calcDirection == direction ? -yDShares : -1 / yDShares

  return BigDecimal.fromString(price.toString())
}

