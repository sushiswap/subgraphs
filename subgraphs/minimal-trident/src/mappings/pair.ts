import { BigDecimal, BigInt, log } from '@graphprotocol/graph-ts'
import {
  Burn as BurnEvent,
  Mint as MintEvent,
  Sync,
  Transfer,
} from '../../generated/templates/ConstantProductPool/ConstantProductPool'
import { ADDRESS_ZERO, BIG_DECIMAL_ZERO } from '../constants'
import {
  convertTokenToDecimal,
  getOrCreateBundle,
  getOrCreateToken,
  getPair,
  getPairKpi,
  getRebase,
  getTokenPrice,
  toAmount,
} from '../functions'
import { getNativePriceInUSD, updateTokenPrice } from '../pricing'

export function onSync(event: Sync): void {
  const pairId = event.address.toHex()
  const pair = getPair(pairId)
  const pairKpi = getPairKpi(pairId)

  const token0 = getOrCreateToken(pair.token0)
  const token1 = getOrCreateToken(pair.token1)

  let token0Price = getTokenPrice(pair.token0)
  let token1Price = getTokenPrice(pair.token1)

  // Reset liquidity
  token0Price.liquidity = token0Price.liquidity.minus(pairKpi.token0Liquidity)
  token1Price.liquidity = token1Price.liquidity.minus(pairKpi.token1Liquidity)

  const rebase0 = getRebase(token0.id)
  const rebase1 = getRebase(token1.id)
  
  const newLiquidity0 = toAmount(event.params.reserve0, rebase0).div(
    BigInt.fromI32(10)
      .pow(token0.decimals.toI32() as u8)
      .toBigDecimal()
  )
  const newLiquidity1 = toAmount(event.params.reserve1, rebase1).div(
    BigInt.fromI32(10)
      .pow(token1.decimals.toI32() as u8)
      .toBigDecimal()
  )


  pairKpi.token0Liquidity = newLiquidity0
  pairKpi.token1Liquidity = newLiquidity1

  if (pairKpi.token1Liquidity.notEqual(BIG_DECIMAL_ZERO)) {
    pairKpi.token0Price = pairKpi.token0Liquidity.div(pairKpi.token1Liquidity)
  } else {
    pairKpi.token0Price = BIG_DECIMAL_ZERO
  }

  if (pairKpi.token0Liquidity.notEqual(BIG_DECIMAL_ZERO)) {
    pairKpi.token1Price = pairKpi.token1Liquidity.div(pairKpi.token0Liquidity)
  } else {
    pairKpi.token1Price = BIG_DECIMAL_ZERO
  }

  const bundle = getOrCreateBundle()
  bundle.nativePrice = getNativePriceInUSD()
  bundle.save()

  token0Price = updateTokenPrice(token0Price, bundle.nativePrice)
  token1Price = updateTokenPrice(token1Price, bundle.nativePrice)
  token0Price.liquidity = token0Price.liquidity.plus(newLiquidity0)
  token1Price.liquidity = token1Price.liquidity.plus(newLiquidity1)
  token0Price.save()
  token1Price.save()

  pairKpi.liquidityNative = pairKpi.token0Liquidity
    .times(token0Price.derivedNative as BigDecimal)
    .plus(pairKpi.token1Liquidity.times(token1Price.derivedNative as BigDecimal))

  pairKpi.liquidityUSD = pairKpi.liquidityNative.times(bundle.nativePrice)
  pairKpi.save()
}

export function onMint(event: MintEvent): void {
  const pairAddress = event.address.toHex()

  const pair = getPair(pairAddress)
  const token0 = getOrCreateToken(pair.token0)
  const token1 = getOrCreateToken(pair.token1)

  const amount0 = event.params.amount0.divDecimal(
    BigInt.fromI32(10)
      .pow(token0.decimals.toI32() as u8)
      .toBigDecimal()
  )
  const token0Price = getTokenPrice(token0.id)
  token0Price.liquidity = token0Price.liquidity.plus(amount0)

  const amount1 = event.params.amount1.divDecimal(
    BigInt.fromI32(10)
      .pow(token1.decimals.toI32() as u8)
      .toBigDecimal()
  )
  const token1Price = getTokenPrice(token1.id)
  token1Price.liquidity = token1Price.liquidity.plus(amount1)

  token0Price.save()
  token1Price.save()
}

export function onBurn(event: BurnEvent): void {
  const pairAddress = event.address.toHex()
  const pair = getPair(pairAddress)
  const token0 = getOrCreateToken(pair.token0)
  const token1 = getOrCreateToken(pair.token1)

  const amount0 = event.params.amount0.divDecimal(
    BigInt.fromI32(10)
      .pow(token0.decimals.toI32() as u8)
      .toBigDecimal()
  )
   const token0Price = getTokenPrice(token0.id)
  token0Price.liquidity = token0Price.liquidity.minus(amount0)

  const amount1 = event.params.amount1.divDecimal(
    BigInt.fromI32(10)
      .pow(token1.decimals.toI32() as u8)
      .toBigDecimal()
  )
  const token1Price = getTokenPrice(token1.id)
  token1Price.liquidity = token1Price.liquidity.minus(amount1)

  token0Price.save()
  token1Price.save()
}

export function onTransfer(event: Transfer): void {
  if (isInitialTransfer(event)) {
    return
  }

  const pairAddress = event.address.toHex()
  const pairKpi = getPairKpi(pairAddress)

  const liquidity = event.params.amount.divDecimal(BigDecimal.fromString('1e18'))

  if (isMint(event)) {
    pairKpi.liquidity = pairKpi.liquidity.plus(liquidity)
  }

  if (isBurn(event)) {
    pairKpi.liquidity = pairKpi.liquidity.minus(liquidity)
  }

  pairKpi.save()
}

function isInitialTransfer(event: Transfer): boolean {
  return event.params.recipient == ADDRESS_ZERO && event.params.amount.equals(BigInt.fromI32(1000))
}

function isMint(event: Transfer): boolean {
  return event.params.sender == ADDRESS_ZERO
}

function isBurn(event: Transfer): boolean {
  return event.params.recipient == ADDRESS_ZERO
}
