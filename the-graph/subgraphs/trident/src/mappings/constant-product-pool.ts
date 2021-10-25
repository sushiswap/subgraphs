import { Address, BigDecimal, BigInt, log } from '@graphprotocol/graph-ts'
import {
  Approval,
  Burn as BurnEvent,
  Mint as MintEvent,
  Swap as SwapEvent,
  Sync,
  Transfer,
} from '../../generated/templates/ConstantProductPool/ConstantProductPool'
import { Burn, Mint, Swap } from '../../generated/schema'
import {
  getConstantProductPool,
  getOrCreateConstantProductPoolFactory,
  getOrCreateToken,
  getOrCreateTokenMetaData,
  getOrCreateTransaction,
} from '../functions'

import { ADDRESS_ZERO } from '../constants'

export function onMint(event: MintEvent): void {
  log.debug('[ConstantProduct] onMint...', [])

  const factory = getOrCreateConstantProductPoolFactory()
  factory.transactionCount = factory.transactionCount.plus(BigInt.fromI32(1))

  const pool = getConstantProductPool(event.address)

  const token0 = getOrCreateToken(Address.fromString(pool.token0))
  const token0MetaData = getOrCreateTokenMetaData(Address.fromString(pool.token0))
  token0.transactionCount = token0.transactionCount.plus(BigInt.fromI32(1))

  const token1 = getOrCreateToken(Address.fromString(pool.token1))

  const token1MetaData = getOrCreateTokenMetaData(Address.fromString(pool.token1))
  token1.transactionCount = token1.transactionCount.plus(BigInt.fromI32(1))

  const amount0 = event.params.amount0.divDecimal(
    BigInt.fromI32(10)
      .pow(token0MetaData.decimals.toI32() as u8)
      .toBigDecimal()
  )
  token0.totalValueLocked = token0.totalValueLocked.plus(amount0)

  const amount1 = event.params.amount1.divDecimal(
    BigInt.fromI32(10)
      .pow(token1MetaData.decimals.toI32() as u8)
      .toBigDecimal()
  )
  token1.totalValueLocked = token1.totalValueLocked.plus(amount1)

  // pool.reserve0 = pool.reserve0.plus(amount0);
  // pool.reserve1 = pool.reserve1.plus(amount1);

  // TODO: Awaiting contract change

  // const liquidity = event.params.liquidity.divDecimal(
  //   BigInt.fromI32(10)
  //     .pow(18 as u8)
  //     .toBigDecimal()
  // );

  // pool.totalValueLocked = pool.totalValueLocked.plus(
  //   liquidity
  // );

  const transaction = getOrCreateTransaction(event)

  const mint = new Mint('constant-product:' + transaction.id.toString() + ':' + pool.transactionCount.toString())

  mint.transaction = transaction.id
  mint.pool = pool.id
  mint.token0 = pool.token0
  mint.token1 = pool.token1
  mint.amount0 = amount0
  mint.amount1 = amount1
  mint.recipient = event.params.recipient
  mint.sender = event.params.sender
  mint.logIndex = event.logIndex

  pool.transactionCount = pool.transactionCount.plus(BigInt.fromI32(1))

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

  const token0 = getOrCreateToken(Address.fromString(pool.token0))
  const token0MetaData = getOrCreateTokenMetaData(Address.fromString(pool.token0))

  token0.transactionCount = token0.transactionCount.plus(BigInt.fromI32(1))

  const token1 = getOrCreateToken(Address.fromString(pool.token1))
  const token1MetaData = getOrCreateTokenMetaData(Address.fromString(pool.token1))

  token1.transactionCount = token1.transactionCount.plus(BigInt.fromI32(1))

  const amount0 = event.params.amount0.divDecimal(
    BigInt.fromI32(10)
      .pow(token0MetaData.decimals.toI32() as u8)
      .toBigDecimal()
  )
  token0.totalValueLocked = token0.totalValueLocked.minus(amount0)

  const amount1 = event.params.amount1.divDecimal(
    BigInt.fromI32(10)
      .pow(token1MetaData.decimals.toI32() as u8)
      .toBigDecimal()
  )
  token1.totalValueLocked = token1.totalValueLocked.minus(amount1)

  // pool.reserve0 = pool.reserve0.plus(amount0);
  // pool.reserve1 = pool.reserve1.plus(amount1);

  // TODO: Awaiting contract change

  // const liquidity = event.params.liquidity.divDecimal(
  //   BigInt.fromI32(10)
  //     .pow(18 as u8)
  //     .toBigDecimal()
  // );

  // pool.liquidity = pool.liquidity.plus(
  //   liquidity
  // );

  const transaction = getOrCreateTransaction(event)

  const burn = new Burn('constant-product:' + transaction.id.toString() + ':' + pool.transactionCount.toString())

  burn.transaction = transaction.id
  burn.pool = pool.id
  burn.token0 = pool.token0
  burn.token1 = pool.token1
  burn.amount0 = amount0
  burn.amount1 = amount1
  burn.recipient = event.params.recipient
  burn.sender = event.params.sender
  burn.logIndex = event.logIndex

  pool.transactionCount = pool.transactionCount.plus(BigInt.fromI32(1))

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
  const token0MetaData = getOrCreateTokenMetaData(Address.fromString(pool.token0))
  const token1MetaData = getOrCreateTokenMetaData(Address.fromString(pool.token1))

  log.debug('[ConstantProduct] onSync [BEFORE] pool.reserve0: {} pool.reserve1: {}', [
    pool.reserve0.toString(),
    pool.reserve1.toString(),
  ])

  pool.reserve0 = event.params.reserve0.divDecimal(
    BigInt.fromI32(10)
      .pow(token0MetaData.decimals.toI32() as u8)
      .toBigDecimal()
  )

  pool.reserve1 = event.params.reserve1.divDecimal(
    BigInt.fromI32(10)
      .pow(token1MetaData.decimals.toI32() as u8)
      .toBigDecimal()
  )

  pool.reserves = [
    pool.reserve0,
    pool.reserve1
  ]

  log.debug('[ConstantProduct] onSync [AFTER] pool.reserve0: {} pool.reserve1: {}', [
    pool.reserve0.toString(),
    pool.reserve1.toString(),
  ])

  pool.save()
}

export function onSwap(event: SwapEvent): void {
  log.debug('[ConstantProduct] onSwap...', [])

  const factory = getOrCreateConstantProductPoolFactory()
  factory.transactionCount = factory.transactionCount.plus(BigInt.fromI32(1))

  const pool = getConstantProductPool(event.address)

  const tokenIn = getOrCreateToken(event.params.tokenIn)
  const tokenInMetaData = getOrCreateTokenMetaData(event.params.tokenIn)

  tokenIn.transactionCount = tokenIn.transactionCount.plus(BigInt.fromI32(1))

  const tokenOut = getOrCreateToken(event.params.tokenOut)
  const tokenOutMetaData = getOrCreateTokenMetaData(event.params.tokenOut)
  tokenOut.transactionCount = tokenOut.transactionCount.plus(BigInt.fromI32(1))

  const transaction = getOrCreateTransaction(event)

  const swap = new Swap('constant-product:' + transaction.id.toString() + ':' + pool.transactionCount.toString())

  swap.transaction = transaction.id
  swap.pool = pool.id
  swap.tokenIn = tokenIn.id
  swap.tokenOut = tokenOut.id
  swap.amountIn = event.params.amountIn.divDecimal(
    BigInt.fromI32(10)
      .pow(tokenInMetaData.decimals.toI32() as u8)
      .toBigDecimal()
  )
  swap.amountOut = event.params.amountOut.divDecimal(
    BigInt.fromI32(10)
      .pow(tokenOutMetaData.decimals.toI32() as u8)
      .toBigDecimal()
  )
  swap.recipient = event.params.recipient
  swap.logIndex = event.logIndex

  pool.transactionCount = pool.transactionCount.plus(BigInt.fromI32(1))

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

  const pool = getConstantProductPool(event.address)

  // If sender is black hole, we're mintin'
  if (event.params.sender == ADDRESS_ZERO) {
    pool.totalSupply = pool.totalSupply.plus(event.params.amount)
  }

  // If recipient is black hole we're burnin'
  if (event.params.sender.toHex() == pool.id && event.params.recipient == ADDRESS_ZERO) {
    pool.totalSupply = pool.totalSupply.minus(event.params.amount)
  }

  pool.save()
}
