import { ADDRESS_ZERO, NATIVE_ADDRESS, STABLE_POOL_ADDRESSES } from '../constants'
import { Address, BigDecimal, BigInt, ByteArray, Bytes, log } from '@graphprotocol/graph-ts'
import { Burn, Candle, Mint, Swap, TokenPrice, WhitelistedToken, TokenPricePair } from '../../generated/schema'
import {
  Burn as BurnEvent,
  Mint as MintEvent,
  Pair as PairContract,
  Swap as SwapEvent,
  Sync as SyncEvent,
  Transfer as TransferEvent,
} from '../../generated/templates/Pair/Pair'
import {
  createUsersIfNotExist,
  createWhitelistedPair,
  createWhitelistedToken,
  deleteWhitelistedToken,
  getFactory,
  getNativeTokenPrice,
  getOrCreateFactory,
  getOrCreateLiquidityPosition,
  getOrCreateToken,
  getOrCreateTokenPrice,
  getOrCreateTransaction,
  getOrCreateUser,
  getPairAsset,
  getPairKpi,
  getTokenKpi,
  getTokenPrice,
  updatePairDaySnapshot,
  updatePairHourSnapshot,
  updateTokenDaySnapshot,
  updateTokenPrice,
} from '../functions'

import { concat } from '@graphprotocol/graph-ts/helper-functions'

export function onMint(event: MintEvent): void {
  createUsersIfNotExist([event.transaction.from, event.transaction.to, event.params.sender])

  const factory = getOrCreateFactory()
  factory.transactionCount = factory.transactionCount.plus(BigInt.fromI32(1))

  const pairAddress = event.address.toHex()

  const pairKpi = getPairKpi(pairAddress)

  const asset0 = getPairAsset(pairAddress.concat(':asset:0'))

  const asset1 = getPairAsset(pairAddress.concat(':asset:1'))

  const token0 = getOrCreateToken(asset0.token)

  const amount0 = event.params.amount0.divDecimal(
    BigInt.fromI32(10)
      .pow(token0.decimals.toI32() as u8)
      .toBigDecimal()
  )

  const token0Kpi = getTokenKpi(asset0.token)
  token0Kpi.liquidity = token0Kpi.liquidity.plus(amount0)
  token0Kpi.transactionCount = token0Kpi.transactionCount.plus(BigInt.fromI32(1))

  const token1 = getOrCreateToken(asset1.token)

  const amount1 = event.params.amount1.divDecimal(
    BigInt.fromI32(10)
      .pow(token1.decimals.toI32() as u8)
      .toBigDecimal()
  )

  const token1Kpi = getTokenKpi(asset1.token)
  token1Kpi.liquidity = token1Kpi.liquidity.plus(amount1)
  token1Kpi.transactionCount = token1Kpi.transactionCount.plus(BigInt.fromI32(1))

  const transaction = getOrCreateTransaction(event)

  const mint = new Mint(transaction.id.toString() + ':' + pairKpi.transactionCount.toString())

  mint.transaction = transaction.id
  mint.pair = pairAddress
  mint.token0 = asset0.token
  mint.token1 = asset1.token
  mint.amount0 = amount0
  mint.amount1 = amount1
  mint.from = event.transaction.from
  mint.to = event.transaction.to
  mint.sender = event.params.sender

  mint.logIndex = event.logIndex

  pairKpi.transactionCount = pairKpi.transactionCount.plus(BigInt.fromI32(1))
  pairKpi.save()

  factory.save()
  token0.save()
  token1.save()
  token0Kpi.save()
  token1Kpi.save()
  mint.save()

  if (event.transaction.to !== null) {
    const to = event.transaction.to as Address
    getOrCreateLiquidityPosition(pairAddress.concat(':').concat(to.toHex()))
  }

  const nativePrice = getNativeTokenPrice()
  updatePairDaySnapshot(event.block.timestamp, pairKpi)
  updatePairHourSnapshot(event.block.timestamp, pairKpi)
  updateTokenDaySnapshot(event.block.timestamp, token0, token0Kpi, nativePrice)
  updateTokenDaySnapshot(event.block.timestamp, token1, token1Kpi, nativePrice)
}

export function onBurn(event: BurnEvent): void {
  const sender = event.params.sender.toHex()
  getOrCreateUser(sender)

  const factory = getOrCreateFactory()
  factory.transactionCount = factory.transactionCount.plus(BigInt.fromI32(1))

  const pairAddress = event.address.toHex()
  const pairKpi = getPairKpi(pairAddress)
  const asset0 = getPairAsset(pairAddress.concat(':asset:0'))
  const asset1 = getPairAsset(pairAddress.concat(':asset:1'))

  const token0 = getOrCreateToken(asset0.token)
  const amount0 = event.params.amount0.divDecimal(
    BigInt.fromI32(10)
      .pow(token0.decimals.toI32() as u8)
      .toBigDecimal()
  )

  const token0Kpi = getTokenKpi(asset0.token)
  token0Kpi.liquidity = token0Kpi.liquidity.minus(amount0)
  token0Kpi.transactionCount = token0Kpi.transactionCount.plus(BigInt.fromI32(1))

  const token1 = getOrCreateToken(asset1.token)

  const amount1 = event.params.amount1.divDecimal(
    BigInt.fromI32(10)
      .pow(token1.decimals.toI32() as u8)
      .toBigDecimal()
  )

  const token1Kpi = getTokenKpi(asset1.token)
  token1Kpi.liquidity = token1Kpi.liquidity.minus(amount1)
  token1Kpi.transactionCount = token1Kpi.transactionCount.plus(BigInt.fromI32(1))

  const transaction = getOrCreateTransaction(event)

  // TODO: transaction count?
  const burn = new Burn(transaction.id.toString() + ':' + pairKpi.transactionCount.toString())

  burn.transaction = transaction.id
  burn.pair = pairAddress
  burn.token0 = asset0.token
  burn.token1 = asset1.token
  burn.amount0 = amount0
  burn.amount1 = amount1
  burn.from = event.transaction.from
  burn.to = event.params.to
  burn.sender = event.params.sender
  burn.logIndex = event.logIndex

  pairKpi.transactionCount = pairKpi.transactionCount.plus(BigInt.fromI32(1))
  pairKpi.save()

  factory.save()
  token0.save()
  token1.save()
  token0Kpi.save()
  token1Kpi.save()
  burn.save()

  getOrCreateLiquidityPosition(pairAddress.concat(':').concat(sender))

  const nativePrice = getNativeTokenPrice()
  updatePairDaySnapshot(event.block.timestamp, pairKpi)
  updatePairHourSnapshot(event.block.timestamp, pairKpi)
  updateTokenDaySnapshot(event.block.timestamp, token0, token0Kpi, nativePrice)
  updateTokenDaySnapshot(event.block.timestamp, token1, token1Kpi, nativePrice)
}

export function onSync(event: SyncEvent): void {
  const pairAddress = event.address.toHex()
  const pairKpi = getPairKpi(pairAddress)

  const asset0 = getPairAsset(pairAddress.concat(':asset:0'))
  const asset1 = getPairAsset(pairAddress.concat(':asset:1'))

  const token0 = getOrCreateToken(asset0.token)
  const token1 = getOrCreateToken(asset1.token)

  const token0Kpi = getTokenKpi(asset0.token)
  const token1Kpi = getTokenKpi(asset1.token)

  token0Kpi.liquidity = token0Kpi.liquidity.minus(asset0.reserve)
  token1Kpi.liquidity = token1Kpi.liquidity.minus(asset1.reserve)

  const reserve0 = event.params.reserve0.toBigDecimal()
  const reserve1 = event.params.reserve1.toBigDecimal()

  asset0.reserve = reserve0.div(
    BigInt.fromI32(10)
      .pow(token0.decimals.toI32() as u8)
      .toBigDecimal()
  )

  asset1.reserve = reserve1.div(
    BigInt.fromI32(10)
      .pow(token1.decimals.toI32() as u8)
      .toBigDecimal()
  )

  if (asset1.reserve.notEqual(BigDecimal.fromString('0'))) {
    asset0.price = asset0.reserve.div(asset1.reserve)
  }

  if (asset0.reserve.notEqual(BigDecimal.fromString('0'))) {
    asset1.price = asset1.reserve.div(asset0.reserve)
  }

  asset0.save()
  asset1.save()

  let nativePrice: TokenPrice
  let token0Price: TokenPrice
  let token1Price: TokenPrice

  // If the pool is one in which we want to update the native price
  if (STABLE_POOL_ADDRESSES.includes(pairAddress)) {
    if (token0.id == NATIVE_ADDRESS) {
      token0Price = updateTokenPrice(token0)
      token1Price = updateTokenPrice(token1)
      nativePrice = token0Price
    } else {
      token1Price = updateTokenPrice(token1)
      token0Price = updateTokenPrice(token0)
      nativePrice = token1Price
    }
  } else {
    // Avoid making this call unless neccasary
    nativePrice = getOrCreateTokenPrice(NATIVE_ADDRESS)
    token0Price = updateTokenPrice(token0)
    token1Price = updateTokenPrice(token1)
  }

  const assets = [asset0, asset1]

  for (let i = 0; i < assets.length; i++) {
    const whitelisted = WhitelistedToken.load(assets[i].token)

    if (whitelisted && assets[Math.abs(i - 1) as i32].token != NATIVE_ADDRESS) {
      const address = assets[Math.abs(i - 1) as i32].token

      // Check if a relation is already defined between the token to price and pool
      if (TokenPricePair.load(address.concat(':').concat(pairAddress)) !== null) {
        continue
      }

      const tokenPrice = getOrCreateTokenPrice(address)

      const whitelistedPair = createWhitelistedPair(
        tokenPrice.token.concat(':').concat(tokenPrice.whitelistedPairCount.toString())
      )
      whitelistedPair.pair = pairAddress
      whitelistedPair.price = tokenPrice.id
      whitelistedPair.save()

      tokenPrice.whitelistedPairCount = tokenPrice.whitelistedPairCount.plus(BigInt.fromI32(1))
      tokenPrice.save()

      createWhitelistedToken(address)

      // Define relationship so we don't add it again here
      const tokenPricePair = new TokenPricePair(tokenPrice.token.concat(':').concat(pairAddress))
      tokenPricePair.save()
    }
  }

  const liquidityNative = asset0.reserve
    .times(token0Price.derivedNative)
    .plus(asset1.reserve.times(token1Price.derivedNative))

  const liquidityUSD = pairKpi.liquidityNative.times(nativePrice.derivedUSD)

  const factory = getFactory()
  factory.liquidityNative = factory.liquidityNative.minus(pairKpi.liquidityNative).plus(liquidityNative)
  factory.liquidityUSD = factory.liquidityNative.times(nativePrice.derivedUSD)
  factory.save()

  pairKpi.liquidityNative = liquidityNative
  pairKpi.liquidityUSD = liquidityUSD
  pairKpi.save()

  token0Kpi.liquidity = token0Kpi.liquidity.plus(reserve0)
  token0Kpi.liquidityNative = token0Kpi.liquidityNative.plus(reserve0.times(token0Price.derivedNative))
  token0Kpi.liquidityUSD = token0Kpi.liquidityUSD.plus(token0Kpi.liquidityNative.times(nativePrice.derivedUSD))
  token0Kpi.save()

  token1Kpi.liquidity = token1Kpi.liquidity.plus(reserve1)
  token1Kpi.liquidityNative = token1Kpi.liquidityNative.plus(reserve1.times(token1Price.derivedNative))
  token1Kpi.liquidityUSD = token1Kpi.liquidityUSD.plus(token1Kpi.liquidityNative.times(nativePrice.derivedUSD))
  token1Kpi.save()

  // TODO: Figure out how to automate whitelisted tokens entirely by programatically
  // adding and removing them, based on a threshold...

  // const whitelisted0 = WhitelistedToken.load(token0.id)

  // if (whitelisted0 === null && token0Kpi.liquidityUSD.gt(BigDecimal.fromString('10000'))) {
  //   createWhitelistedToken(token0.id)
  // } else if (whitelisted0 !== null && token0Kpi.liquidityUSD.lt(BigDecimal.fromString('10000'))) {
  //   deleteWhitelistedToken(token0.id)
  // }

  // const whitelisted1 = WhitelistedToken.load(token1.id)

  // if (whitelisted1 === null && token1Kpi.liquidityUSD.gt(BigDecimal.fromString('10000'))) {
  //   createWhitelistedToken(token1.id)
  // } else if (whitelisted1 !== null && token1Kpi.liquidityUSD.lt(BigDecimal.fromString('10000'))) {
  //   deleteWhitelistedToken(token1.id)
  // }
}

export function onSwap(event: SwapEvent): void {
  const pairAddress = event.address.toHex()

  const pairKpi = getPairKpi(pairAddress)

  const asset0 = getPairAsset(pairAddress.concat(':asset:0'))
  const asset1 = getPairAsset(pairAddress.concat(':asset:1'))

  const token0In = event.params.amount0In.notEqual(BigInt.fromI32(0))
  const token0Out = event.params.amount0Out.notEqual(BigInt.fromI32(0))

  const tokenInAddress = token0In ? asset0.token : asset1.token
  const tokenOutAddress = token0Out ? asset0.token : asset1.token

  const tokenIn = getOrCreateToken(tokenInAddress)
  const tokenInPrice = getTokenPrice(tokenInAddress)

  const amountIn = (token0In ? event.params.amount0In : event.params.amount1In).divDecimal(
    BigInt.fromI32(10)
      .pow(tokenIn.decimals.toI32() as u8)
      .toBigDecimal()
  )

  const tokenInKpi = getTokenKpi(tokenInAddress)
  tokenInKpi.transactionCount = tokenInKpi.transactionCount.plus(BigInt.fromI32(1))
  tokenInKpi.save()

  const tokenOut = getOrCreateToken(tokenOutAddress)
  const tokenOutPrice = getTokenPrice(tokenOutAddress)

  const amountOut = (token0Out ? event.params.amount0Out : event.params.amount1Out).divDecimal(
    BigInt.fromI32(10)
      .pow(tokenOut.decimals.toI32() as u8)
      .toBigDecimal()
  )

  const tokenOutKpi = getTokenKpi(tokenOutAddress)
  tokenOutKpi.transactionCount = tokenOutKpi.transactionCount.plus(BigInt.fromI32(1))
  tokenOutKpi.save()

  const transaction = getOrCreateTransaction(event)

  const swap = new Swap(transaction.id.toString() + ':' + pairKpi.transactionCount.toString())

  swap.transaction = transaction.id
  swap.pair = pairAddress
  swap.tokenIn = tokenIn.id
  swap.tokenOut = tokenOut.id
  swap.amountIn = amountIn
  swap.amountOut = amountOut
  swap.from = event.transaction.from
  swap.to = event.params.to
  swap.sender = event.params.sender
  swap.logIndex = event.logIndex
  swap.save()

  const volumeNative = amountIn.times(tokenInPrice.derivedNative).plus(amountOut.times(tokenOutPrice.derivedNative))
  const volumeUSD = amountIn.times(tokenInPrice.derivedUSD).plus(amountOut.times(tokenOutPrice.derivedUSD))

  const feesNative = volumeNative.times(BigDecimal.fromString('30').div(BigDecimal.fromString('10000')))
  const feesUSD = volumeUSD.times(BigDecimal.fromString('30').div(BigDecimal.fromString('10000')))

  pairKpi.volumeNative = pairKpi.volumeNative.plus(volumeNative)
  pairKpi.volumeUSD = pairKpi.volumeUSD.plus(volumeUSD)
  pairKpi.feesNative = pairKpi.feesNative.plus(feesNative)
  pairKpi.feesUSD = pairKpi.feesUSD.plus(feesUSD)
  pairKpi.transactionCount = pairKpi.transactionCount.plus(BigInt.fromI32(1))
  pairKpi.save()

  const factory = getFactory()
  factory.volumeUSD = factory.volumeUSD.plus(volumeUSD)
  factory.volumeNative = factory.volumeNative.plus(volumeNative)
  factory.feesNative = factory.feesNative.plus(feesNative)
  factory.feesUSD = factory.feesUSD.plus(feesUSD)
  factory.transactionCount = factory.transactionCount.plus(BigInt.fromI32(1))
  factory.save()

  const nativePrice = getNativeTokenPrice()
  const pairDaySnapshot = updatePairDaySnapshot(event.block.timestamp, pairKpi)
  const pairHourSnapshot = updatePairHourSnapshot(event.block.timestamp, pairKpi)

  pairDaySnapshot.volumeNative = pairDaySnapshot.volumeNative.plus(volumeNative)
  pairDaySnapshot.volumeUSD = pairDaySnapshot.volumeUSD.plus(volumeUSD)
  pairDaySnapshot.feesNative = pairDaySnapshot.feesNative.plus(feesNative)
  pairDaySnapshot.feesUSD = pairDaySnapshot.feesUSD.plus(feesUSD)
  pairDaySnapshot.save()

  pairHourSnapshot.volumeNative = pairHourSnapshot.volumeNative.plus(volumeNative)
  pairHourSnapshot.volumeUSD = pairHourSnapshot.volumeUSD.plus(volumeUSD)
  pairHourSnapshot.feesNative = pairHourSnapshot.feesNative.plus(feesNative)
  pairHourSnapshot.feesUSD = pairHourSnapshot.feesUSD.plus(feesUSD)
  pairHourSnapshot.save()

  updateTokenDaySnapshot(event.block.timestamp, tokenIn, tokenInKpi, nativePrice)
  updateTokenDaySnapshot(event.block.timestamp, tokenOut, tokenOutKpi, nativePrice)

  // TODO: Rethink this to potentially use in/out from above instead?
  // or do we want to keep 0/1?

  const token0 = getOrCreateToken(asset0.token)
  const token1 = getOrCreateToken(asset1.token)

  const token0Amount = event.params.amount0In
    .minus(event.params.amount0Out)
    .abs()
    .divDecimal(
      BigInt.fromI32(10)
        .pow(token0.decimals.toI32() as u8)
        .toBigDecimal()
    )
  const token1Amount = event.params.amount1Out
    .minus(event.params.amount1In)
    .abs()
    .divDecimal(
      BigInt.fromI32(10)
        .pow(token1.decimals.toI32() as u8)
        .toBigDecimal()
    )

  if (token0Amount.equals(BigDecimal.fromString('0')) || token1Amount.equals(BigDecimal.fromString('0'))) {
    return
  }

  const token0Price = getTokenPrice(asset0.token)
  const token1Price = getTokenPrice(asset1.token)

  const price = token0Amount.div(token1Amount)
  const tokens = concat(ByteArray.fromHexString(asset0.token), ByteArray.fromHexString(asset1.token))
  const timestamp = event.block.timestamp.toI32()
  const periods: i32[] = [5 * 60, 15 * 60, 60 * 60, 4 * 60 * 60, 24 * 60 * 60, 7 * 24 * 60 * 60]
  for (let i = 0; i < periods.length; i++) {
    const timeId = timestamp / periods[i]
    const candleId = concat(concat(Bytes.fromI32(timeId), Bytes.fromI32(periods[i])), tokens).toHex()
    let candle = Candle.load(candleId)
    if (candle === null) {
      candle = new Candle(candleId)
      candle.pair = pairAddress
      candle.time = timestamp
      candle.period = periods[i]
      candle.token0 = asset0.token
      candle.token1 = asset1.token
      candle.open = price
      candle.openUSD = price.times(token0Price.derivedUSD)
      candle.openNative = price.times(token0Price.derivedNative)
      candle.low = price
      candle.high = price
    } else {
      if (price < candle.low) {
        candle.low = price
      }
      if (price > candle.high) {
        candle.high = price
      }
    }

    candle.lowUSD = candle.low.times(token0Price.derivedUSD)
    candle.lowNative = candle.low.times(token0Price.derivedNative)
    candle.highUSD = candle.high.times(token0Price.derivedUSD)
    candle.highNative = candle.high.times(token0Price.derivedNative)

    candle.close = price
    candle.closeUSD = price.times(token0Price.derivedUSD)
    candle.closeNative = price.times(token0Price.derivedNative)
    candle.lastBlock = event.block.number.toI32()
    candle.token0Amount = candle.token0Amount.plus(token0Amount)
    candle.token0AmountUSD = candle.token0Amount.times(token0Price.derivedUSD)
    candle.token0AmountNative = candle.token0Amount.times(token0Price.derivedNative)
    candle.token1Amount = candle.token1Amount.plus(token1Amount)
    candle.token1AmountUSD = candle.token1Amount.times(token1Price.derivedUSD)
    candle.token1AmountNative = candle.token1Amount.times(token1Price.derivedNative)
    candle.save()
  }
}

export function onTransfer(event: TransferEvent): void {
  if (event.params.to == ADDRESS_ZERO && event.params.value.equals(BigInt.fromI32(1000))) {
    return
  }

  const amount = event.params.value.divDecimal(BigDecimal.fromString('1e18'))

  const from = event.params.from.toHex()

  const to = event.params.to.toHex()

  getOrCreateUser(from)
  getOrCreateUser(to)

  const pairAddress = event.address.toHex()

  const pairKpi = getPairKpi(pairAddress)

  // If sender is black hole, we're mintin'
  if (event.params.from == ADDRESS_ZERO) {
    pairKpi.liquidity = pairKpi.liquidity.plus(amount)
  }

  // If recipient is black hole we're burnin'
  if (event.params.to == ADDRESS_ZERO) {
    pairKpi.liquidity = pairKpi.liquidity.minus(amount)
  }

  // Increment factory count
  const factory = getFactory()
  factory.transactionCount = factory.transactionCount.plus(BigInt.fromI32(1))
  factory.save()

  const senderLiquidityPosition = getOrCreateLiquidityPosition(pairAddress.concat(':').concat(from))
  const recipientLiquidityPosition = getOrCreateLiquidityPosition(pairAddress.concat(':').concat(to))

  if (event.params.from != ADDRESS_ZERO && from != pairAddress) {
    senderLiquidityPosition.balance = senderLiquidityPosition.balance.minus(amount)
    senderLiquidityPosition.save()
  }

  if (event.params.to != ADDRESS_ZERO && to != pairAddress) {
    recipientLiquidityPosition.balance = recipientLiquidityPosition.balance.plus(amount)
    recipientLiquidityPosition.save()
  }
}
