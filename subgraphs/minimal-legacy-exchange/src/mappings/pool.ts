import { getOrCreateBundle, getOrCreateToken, getPool } from '../functions'
import { Sync } from '../../generated/Factory/Pair'
import { BIG_DECIMAL_ZERO } from '../constants'
import { BigDecimal, BigInt } from '@graphprotocol/graph-ts'
import { getPoolKpi } from '../functions/pool-data'
import { findEthPerToken, getNativePriceInUSD } from '../pricing'
import { getTokenKpi } from '../functions/token-data'

export function onSync(event: Sync): void {
  const poolId = event.address.toHex()
  const pool = getPool(poolId)
  const poolKpi = getPoolKpi(poolId)

  const token0 = getOrCreateToken(pool.token0)
  const token0Kpi = getTokenKpi(pool.token0)
  const token1 = getOrCreateToken(pool.token1)
  const token1Kpi = getTokenKpi(pool.token1)

  // reset token total liquidity amounts
  // token0.liquidity = token0.liquidity.minus(pair.reserve0)
  // token1.liquidity = token1.liquidity.minus(pair.reserve1)

  poolKpi.reserve0 = convertTokenToDecimal(event.params.reserve0, token0.decimals)
  poolKpi.reserve1 = convertTokenToDecimal(event.params.reserve1, token1.decimals)

  if (poolKpi.reserve1.notEqual(BIG_DECIMAL_ZERO)) {
    poolKpi.token0Price = poolKpi.reserve0.div(poolKpi.reserve1)
  } else {
    poolKpi.token0Price = BIG_DECIMAL_ZERO
  }

  if (poolKpi.reserve0.notEqual(BIG_DECIMAL_ZERO)) {
    poolKpi.token1Price = poolKpi.reserve1.div(poolKpi.reserve0)
  } else {
    poolKpi.token1Price = BIG_DECIMAL_ZERO
  }

  poolKpi.save()

  // update ETH price now that reserves could have changed
  const bundle = getOrCreateBundle()
  // Pass the block so we can get accurate price data before migration
  bundle.ethPrice = getNativePriceInUSD()
  bundle.save()

  token0Kpi.derivedETH = findEthPerToken(token0, token0Kpi)
  token0Kpi.derivedETH = findEthPerToken(token1, token1Kpi)
  token0.save()
  token1.save()

  poolKpi.reserveETH = poolKpi.reserve0
    .times(token0Kpi.derivedETH as BigDecimal)
    .plus(poolKpi.reserve1.times(token1Kpi.derivedETH as BigDecimal))
  // poolKpi.reserveUSD = poolKpi.reserveETH.times(bundle.ethPrice)

  // now correctly set liquidity amounts for each token
  // token0.liquidity = token0.liquidity.plus(pair.reserve0)
  // token1.liquidity = token1.liquidity.plus(pair.reserve1)

  pool.save()
  token0.save()
  token1.save()
}

export function exponentToBigDecimal(decimals: BigInt): BigDecimal {
  let bd = BigDecimal.fromString('1')
  for (let i = BigInt.fromI32(0); i.lt(decimals as BigInt); i = i.plus(BigInt.fromI32(1))) {
    bd = bd.times(BigDecimal.fromString('10'))
  }
  return bd
}

export function convertTokenToDecimal(tokenAmount: BigInt, exchangeDecimals: BigInt): BigDecimal {
  if (exchangeDecimals == BigInt.fromI32(0)) {
    return tokenAmount.toBigDecimal()
  }
  return tokenAmount.toBigDecimal().div(exponentToBigDecimal(exchangeDecimals))
}

// export function onTransfer(event: Transfer): void {
//   let pool = getLiquidityPool(event.address.toHexString())

//   // ignore initial transfers for first adds
//   if (isInitialTransfer(event)) {
//     return
//   }
//   // mints
//   if (isTransferMint(event)) {
//     // handleTransferMint(event, pool, event.params.value, event.params.to.toHexString())
//   }

//   if (isTransferToPoolBurn(event)) {
//     // handleTransferToPoolBurn(event, event.params.from.toHexString())
//   }
//   // burn
//   if (isTransferBurn(event)) {
//     // handleTransferBurn(event, pool, event.params.value, event.params.from.toHexString())
//   }
// }

// export function onMint(event: Mint): void {
//   createDeposit(event, event.params.amount0, event.params.amount1)
// }

// export function onBurn(event: Burn): void {
//   createWithdraw(event, event.params.amount0, event.params.amount1)
// }

// export function onSwap(event: Swap): void {

// }

// function isInitialTransfer(event: Transfer): boolean {
//   return event.params.to == ADDRESS_ZERO && event.params.value.equals(BigInt.fromI32(1000))
// }

// function isTransferMint(event: Transfer): boolean {
//   return event.params.from == ADDRESS_ZERO
// }

// /**
//  * Case where direct send first on native token withdrawls.
//  * For burns, mint tokens are first transferred to the pool before transferred for burn.
//  * This gets the EOA that made the burn loaded into the _Transfer.
//  * @param event Transfer event
//  * @returns
//  */
// function isTransferToPoolBurn(event: Transfer): boolean {
//   return event.params.to == event.address
// }

// function isTransferBurn(event: Transfer): boolean {
//   return event.params.to == ADDRESS_ZERO && event.params.from == event.address
// }
