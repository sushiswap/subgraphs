import { BigDecimal, BigInt, ByteArray, Bytes, log } from '@graphprotocol/graph-ts'
import { ADDRESS_ZERO, NATIVE_ADDRESS, STABLE_POOL_ADDRESSES } from '../constants'
import { TokenPrice, Mint, Burn, Swap, Candle, PairAsset } from '../../generated/schema'
import {
  Burn as BurnEvent,
  Mint as MintEvent,
  Pair as PairContract,
  Swap as SwapEvent,
  Sync as SyncEvent,
  Transfer as TransferEvent,
} from '../../generated/templates/Pair/Pair'
import {
  getFactory,
  getOrCreateUser,
  getPairKpi,
  getOrCreateToken,
  getPairAsset,
  getTokenKpi,
  getOrCreateTokenPrice,
  updateTokenPrice,
  getOrCreateTransaction,
  getOrCreateFactory,
  createUsersIfNotExist,
  updateCandles
} from '../functions'
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

  pairKpi.transactionCount = pairKpi.transactionCount.plus(BigInt.fromI32(1))

  pairKpi.save()

  // Increment factory count
  const factory = getFactory()
  factory.txCount = factory.txCount.plus(BigInt.fromI32(1))
  factory.save()
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


  pairKpi.liquidityNative = asset0.reserve
    .times(token0Price.derivedNative)
    .plus(asset1.reserve.times(token1Price.derivedNative))
  pairKpi.liquidityUSD = pairKpi.liquidityNative.times(nativePrice.derivedUSD)
  pairKpi.save()


  token0Kpi.liquidity = token0Kpi.liquidity.plus(reserve0)
  token0Kpi.liquidityNative = token0Kpi.liquidityNative.plus(reserve0.times(token0Price.derivedNative))
  token0Kpi.liquidityUSD = token0Kpi.liquidityUSD.plus(token0Kpi.liquidityNative.times(nativePrice.derivedUSD))
  token0Kpi.save()

  token1Kpi.liquidity = token1Kpi.liquidity.plus(reserve1)
  token1Kpi.liquidityNative = token1Kpi.liquidityNative.plus(reserve1.times(token1Price.derivedNative))
  token1Kpi.liquidityUSD = token1Kpi.liquidityUSD.plus(token1Kpi.liquidityNative.times(nativePrice.derivedUSD))
  token1Kpi.save()
}

export function onMint(event: MintEvent): void {
  createUsersIfNotExist([event.transaction.from, event.transaction.to, event.params.sender])

  const factory = getOrCreateFactory()
  factory.txCount = factory.txCount.plus(BigInt.fromI32(1))

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
}

export function onBurn(event: BurnEvent): void {
  const sender = event.params.sender.toHex()
  getOrCreateUser(sender)

  const factory = getOrCreateFactory()
  factory.txCount = factory.txCount.plus(BigInt.fromI32(1))

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

  // const liquidity = event.params.liquidity.divDecimal(BigDecimal.fromString('1e18'))

  // poolKpi.liquidity = poolKpi.liquidity.minus(liquidity)
  // poolKpi.transactionCount = poolKpi.transactionCount.plus(BigInt.fromI32(1))
  pairKpi.save()

  factory.save()
  token0.save()
  token1.save()
  token0Kpi.save()
  token1Kpi.save()
  burn.save()
}

export function onSwap(event: SwapEvent): void {
  const factory = getFactory()
  factory.txCount = factory.txCount.plus(BigInt.fromI32(1))
  factory.save()

  const pairAddress = event.address.toHex()

  const pairKpi = getPairKpi(pairAddress)

  const asset0 = getPairAsset(pairAddress.concat(':asset:0'))
  const asset1 = getPairAsset(pairAddress.concat(':asset:1'))

  const token0In = event.params.amount0In.notEqual(BigInt.fromI32(0))
  const token0Out = event.params.amount0Out.notEqual(BigInt.fromI32(0))

  const tokenInAddress = token0In ? asset0.token : asset1.token
  const tokenOutAddress = token0Out ? asset0.token : asset1.token

  const tokenIn = getOrCreateToken(tokenInAddress)

  const amountIn = (token0In ? event.params.amount0In : event.params.amount1In).divDecimal(
    BigInt.fromI32(10)
      .pow(tokenIn.decimals.toI32() as u8)
      .toBigDecimal()
  )

  const tokenInKpi = getTokenKpi(tokenInAddress)
  tokenInKpi.transactionCount = tokenInKpi.transactionCount.plus(BigInt.fromI32(1))
  tokenInKpi.save()

  const tokenOut = getOrCreateToken(tokenOutAddress)

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

  updateCandles(asset0, asset1, token0Amount, token1Amount, event, pairAddress)
}
