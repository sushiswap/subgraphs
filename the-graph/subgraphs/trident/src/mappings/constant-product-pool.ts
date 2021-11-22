import { Address, BigDecimal, BigInt, log } from '@graphprotocol/graph-ts'
import {
  Approval,
  Burn as BurnEvent,
  Mint as MintEvent,
  Swap as SwapEvent,
  Sync,
  Transfer,
} from '../../generated/templates/ConstantProductPool/ConstantProductPool'
import { Burn, Mint, Swap, TokenPrice } from '../../generated/schema'
import {
  getConstantProductPool,
  getConstantProductPoolKpi,
  getOrCreateConstantProductPoolFactory,
  getOrCreateToken,
  getTokenKpi,
  getOrCreateTransaction,
  getConstantProductPoolAsset,
} from '../functions'

import { ADDRESS_ZERO, STABLE_POOL_ADDRESSES, NATIVE_ADDRESS } from '../constants/addresses'
import { updateTokenPrice } from '../modules/pricing'

export function onMint(event: MintEvent): void {
  log.debug('[ConstantProduct] onMint...', [])

  const factory = getOrCreateConstantProductPoolFactory()
  factory.transactionCount = factory.transactionCount.plus(BigInt.fromI32(1))

  const pool = getConstantProductPool(event.address)
  const poolKpi = getConstantProductPoolKpi(event.address)

  const asset0 = getConstantProductPoolAsset(pool.id.concat(':asset:0'))
  const asset1 = getConstantProductPoolAsset(pool.id.concat(':asset:1'))

  const token0 = getOrCreateToken(Address.fromString(asset0.token))
  const amount0 = event.params.amount0.divDecimal(
    BigInt.fromI32(10)
      .pow(token0.decimals.toI32() as u8)
      .toBigDecimal()
  )

  const token0Kpi = getTokenKpi(Address.fromString(asset0.token))
  token0Kpi.totalValueLocked = token0Kpi.totalValueLocked.plus(amount0)
  token0Kpi.transactionCount = token0Kpi.transactionCount.plus(BigInt.fromI32(1))

  const token1 = getOrCreateToken(Address.fromString(asset1.token))

  const amount1 = event.params.amount1.divDecimal(
    BigInt.fromI32(10)
      .pow(token1.decimals.toI32() as u8)
      .toBigDecimal()
  )

  const token1Kpi = getTokenKpi(Address.fromString(asset1.token))
  token1Kpi.totalValueLocked = token1Kpi.totalValueLocked.plus(amount1)
  token1Kpi.transactionCount = token1Kpi.transactionCount.plus(BigInt.fromI32(1))

  const liquidity = event.params.liquidity.divDecimal(BigInt.fromI32(10).pow(18).toBigDecimal())

  poolKpi.totalValueLocked = poolKpi.totalValueLocked.plus(liquidity)

  const transaction = getOrCreateTransaction(event)

  const mint = new Mint('constant-product:' + transaction.id.toString() + ':' + poolKpi.transactionCount.toString())

  mint.transaction = transaction.id
  mint.pool = pool.id
  mint.token0 = asset0.token
  mint.token1 = asset1.token
  mint.amount0 = amount0
  mint.amount1 = amount1
  mint.recipient = event.params.recipient
  mint.sender = event.params.sender
  mint.sender = event.params.sender
  mint.origin = event.transaction.from

  mint.logIndex = event.logIndex

  poolKpi.transactionCount = poolKpi.transactionCount.plus(BigInt.fromI32(1))
  poolKpi.save()

  factory.save()
  token0.save()
  token1.save()
  mint.save()
  pool.save()
}

export function onBurn(event: BurnEvent): void {
  log.debug('[ConstantProduct] onBurn...', [])

  const factory = getOrCreateConstantProductPoolFactory()
  factory.transactionCount = factory.transactionCount.plus(BigInt.fromI32(1))

  const pool = getConstantProductPool(event.address)
  const asset0 = getConstantProductPoolAsset(pool.id.concat(':asset:0'))
  const asset1 = getConstantProductPoolAsset(pool.id.concat(':asset:1'))

  const poolKpi = getConstantProductPoolKpi(event.address)

  const token0 = getOrCreateToken(Address.fromString(asset0.token))
  const amount0 = event.params.amount0.divDecimal(
    BigInt.fromI32(10)
      .pow(token0.decimals.toI32() as u8)
      .toBigDecimal()
  )

  const token0Kpi = getTokenKpi(Address.fromString(asset0.token))
  token0Kpi.totalValueLocked = token0Kpi.totalValueLocked.minus(amount0)
  token0Kpi.transactionCount = token0Kpi.transactionCount.plus(BigInt.fromI32(1))

  const token1 = getOrCreateToken(Address.fromString(asset1.token))

  const amount1 = event.params.amount1.divDecimal(
    BigInt.fromI32(10)
      .pow(token1.decimals.toI32() as u8)
      .toBigDecimal()
  )

  const token1Kpi = getTokenKpi(Address.fromString(asset1.token))
  token1Kpi.totalValueLocked = token1Kpi.totalValueLocked.minus(amount1)
  token1Kpi.transactionCount = token1Kpi.transactionCount.plus(BigInt.fromI32(1))

  const liquidity = event.params.liquidity.divDecimal(BigInt.fromI32(10).pow(18).toBigDecimal())

  poolKpi.totalValueLocked = poolKpi.totalValueLocked.minus(liquidity)

  const transaction = getOrCreateTransaction(event)

  const burn = new Burn('constant-product:' + transaction.id.toString() + ':' + poolKpi.transactionCount.toString())

  burn.transaction = transaction.id
  burn.pool = pool.id
  burn.token0 = asset0.token
  burn.token1 = asset0.token
  burn.amount0 = amount0
  burn.amount1 = amount1
  burn.recipient = event.params.recipient
  burn.sender = event.params.sender
  burn.origin = event.transaction.from
  burn.logIndex = event.logIndex

  poolKpi.transactionCount = poolKpi.transactionCount.plus(BigInt.fromI32(1))
  poolKpi.save()

  factory.save()
  token0.save()
  token1.save()
  burn.save()
  pool.save()
}

export function onSync(event: Sync): void {
  log.debug('[ConstantProduct] onSync...... event.reserve0: {} event.reserve1: {}', [
    event.params.reserve0.toString(),
    event.params.reserve1.toString(),
  ])

  const pool = getConstantProductPool(event.address)

  const asset0 = getConstantProductPoolAsset(pool.id.concat(':asset:0'))
  const asset1 = getConstantProductPoolAsset(pool.id.concat(':asset:1'))

  log.debug('[ConstantProduct] onSync...... pool.assets[0]: {} pool.assets[1]: {}', [asset0.id, asset1.id])

  const token0 = getOrCreateToken(Address.fromString(asset0.token))
  const token1 = getOrCreateToken(Address.fromString(asset1.token))

  log.debug('[ConstantProduct] onSync [BEFORE] pool.reserve0: {} pool.reserve1: {}', [
    asset0.reserve.toString(),
    asset1.reserve.toString(),
  ])

  asset0.reserve = event.params.reserve0.divDecimal(
    BigInt.fromI32(10)
      .pow(token0.decimals.toI32() as u8)
      .toBigDecimal()
  )

  asset1.reserve = event.params.reserve1.divDecimal(
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

  log.debug('[ConstantProduct] onSync [AFTER] asset0.price: {} asset1.price: {}', [
    asset0.price.toString(),
    asset1.price.toString(),
  ])

  // If the pool is one in which we care about the reserves changing, update the native price.
  if (STABLE_POOL_ADDRESSES.includes(pool.id)) {
    const nativeToken = getOrCreateToken(NATIVE_ADDRESS)
    updateTokenPrice(nativeToken)
  }

  updateTokenPrice(token0)
  updateTokenPrice(token1)

  asset0.save()
  asset1.save()

  pool.save()
}

export function onSwap(event: SwapEvent): void {
  log.debug('[ConstantProduct] onSwap...', [])

  const factory = getOrCreateConstantProductPoolFactory()
  factory.transactionCount = factory.transactionCount.plus(BigInt.fromI32(1))

  const pool = getConstantProductPool(event.address)
  const poolKpi = getConstantProductPoolKpi(event.address)

  const tokenIn = getOrCreateToken(event.params.tokenIn)

  const tokenInKpi = getTokenKpi(event.params.tokenIn)
  tokenInKpi.transactionCount = tokenInKpi.transactionCount.plus(BigInt.fromI32(1))

  const tokenOut = getOrCreateToken(event.params.tokenOut)

  const tokenOutKpi = getTokenKpi(event.params.tokenOut)
  tokenOutKpi.transactionCount = tokenOutKpi.transactionCount.plus(BigInt.fromI32(1))

  const transaction = getOrCreateTransaction(event)

  const swap = new Swap('constant-product:' + transaction.id.toString() + ':' + poolKpi.transactionCount.toString())

  swap.transaction = transaction.id
  swap.pool = pool.id
  swap.tokenIn = tokenIn.id
  swap.tokenOut = tokenOut.id
  swap.amountIn = event.params.amountIn.divDecimal(
    BigInt.fromI32(10)
      .pow(tokenIn.decimals.toI32() as u8)
      .toBigDecimal()
  )
  swap.amountOut = event.params.amountOut.divDecimal(
    BigInt.fromI32(10)
      .pow(tokenOut.decimals.toI32() as u8)
      .toBigDecimal()
  )
  swap.recipient = event.params.recipient
  swap.origin = event.transaction.from
  swap.logIndex = event.logIndex

  poolKpi.transactionCount = poolKpi.transactionCount.plus(BigInt.fromI32(1))
  poolKpi.save()

  factory.save()
  tokenIn.save()
  tokenOut.save()
  swap.save()
  pool.save()
}

export function onApproval(event: Approval): void {
  log.debug('[ConstantProduct] onApproval...', [])
}

export function onTransfer(event: Transfer): void {
  log.debug('[ConstantProduct] onTransfer... {} {} {}', [
    event.params.amount.divDecimal(BigDecimal.fromString('1e18')).toString(),
    event.params.recipient.toHex(),
    event.params.sender.toHex(),
  ])

  const poolKpi = getConstantProductPoolKpi(event.address)

  // If sender is black hole, we're mintin'
  if (event.params.sender == ADDRESS_ZERO) {
    poolKpi.totalSupply = poolKpi.totalSupply.plus(event.params.amount)
  }

  // If recipient is black hole we're burnin'
  if (event.params.sender.toHex() == poolKpi.id && event.params.recipient == ADDRESS_ZERO) {
    poolKpi.totalSupply = poolKpi.totalSupply.minus(event.params.amount)
  }

  poolKpi.save()
}
