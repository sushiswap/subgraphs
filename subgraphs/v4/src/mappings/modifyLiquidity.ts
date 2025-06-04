import { BigInt, log } from '@graphprotocol/graph-ts'

import { ModifyLiquidity as ModifyLiquidityEvent } from '../../generated/PoolManager/PoolManager'
import { Bundle, ModifyLiquidity, Pool, PoolManager, Tick, Token } from '../../generated/schema'
import { ONE_BI } from '../constants'
import { convertTokenToDecimal, loadTransaction } from '../utils/index'
import {
  updatePoolDayData,
  updatePoolHourData,
  updateTokenDayData,
  updateTokenHourData,
  updateUniswapDayData,
} from '../utils/intervalUpdates'
import { getAmount0, getAmount1 } from '../utils/liquidityMath/liquidityAmounts'
import { calculateAmountUSD } from '../utils/pricing'
import { createTick } from '../utils/tick'
import { getSubgraphConfig, SubgraphConfig } from '../utils/chains'

export function handleModifyLiquidity(event: ModifyLiquidityEvent): void {
  handleModifyLiquidityHelper(event)
}

export function handleModifyLiquidityHelper(
  event: ModifyLiquidityEvent,
  subgraphConfig: SubgraphConfig = getSubgraphConfig(),
  
): void {
  const poolManagerAddress = subgraphConfig.poolManagerAddress

  const bundle = Bundle.load('1')!
  const poolId = event.params.id.toHexString()
  const pool = Pool.load(poolId)
  const poolManager = PoolManager.load(poolManagerAddress)

  if (pool === null) {
    log.debug('handleModifyLiquidityHelper: pool not found {}', [poolId])
    return
  }

  if (poolManager === null) {
    log.debug('handleModifyLiquidityHelper: pool manager not found {}', [poolManagerAddress])
    return
  }

  const token0 = Token.load(pool.token0)
  const token1 = Token.load(pool.token1)

  if (token0 && token1) {
    const currTick: i32 = pool.tick!.toI32()
    const currSqrtPriceX96 = pool.sqrtPrice

    // Get the amounts using the getAmounts function
    const amount0Raw = getAmount0(
      event.params.tickLower,
      event.params.tickUpper,
      currTick,
      event.params.liquidityDelta,
      currSqrtPriceX96,
    )
    const amount1Raw = getAmount1(
      event.params.tickLower,
      event.params.tickUpper,
      currTick,
      event.params.liquidityDelta,
      currSqrtPriceX96,
    )
    const amount0 = convertTokenToDecimal(amount0Raw, token0.decimals)
    const amount1 = convertTokenToDecimal(amount1Raw, token1.decimals)

    const amountUSD = calculateAmountUSD(amount0, amount1, token0.derivedETH, token1.derivedETH, bundle.ethPriceUSD)

    // reset tvl aggregates until new amounts calculated
    poolManager.totalValueLockedETH = poolManager.totalValueLockedETH.minus(pool.totalValueLockedETH)

    // update globals
    poolManager.txCount = poolManager.txCount.plus(ONE_BI)

    // update token0 data
    token0.txCount = token0.txCount.plus(ONE_BI)
    token0.totalValueLocked = token0.totalValueLocked.plus(amount0)
    token0.totalValueLockedUSD = token0.totalValueLocked.times(token0.derivedETH.times(bundle.ethPriceUSD))

    // update token1 data
    token1.txCount = token1.txCount.plus(ONE_BI)
    token1.totalValueLocked = token1.totalValueLocked.plus(amount1)
    token1.totalValueLockedUSD = token1.totalValueLocked.times(token1.derivedETH.times(bundle.ethPriceUSD))

    // pool data
    pool.txCount = pool.txCount.plus(ONE_BI)

    // Pools liquidity tracks the currently active liquidity given pools current tick.
    // We only want to update it if the new position includes the current tick.
    if (
      pool.tick !== null &&
      BigInt.fromI32(event.params.tickLower).le(pool.tick as BigInt) &&
      BigInt.fromI32(event.params.tickUpper).gt(pool.tick as BigInt)
    ) {
      pool.liquidity = pool.liquidity.plus(event.params.liquidityDelta)
    }

    pool.totalValueLockedToken0 = pool.totalValueLockedToken0.plus(amount0)
    pool.totalValueLockedToken1 = pool.totalValueLockedToken1.plus(amount1)
    pool.totalValueLockedETH = pool.totalValueLockedToken0
      .times(token0.derivedETH)
      .plus(pool.totalValueLockedToken1.times(token1.derivedETH))
    pool.totalValueLockedUSD = pool.totalValueLockedETH.times(bundle.ethPriceUSD)

    // reset aggregates with new amounts
    poolManager.totalValueLockedETH = poolManager.totalValueLockedETH.plus(pool.totalValueLockedETH)
    poolManager.totalValueLockedUSD = poolManager.totalValueLockedETH.times(bundle.ethPriceUSD)

    const transaction = loadTransaction(event)
    const modifyLiquidity = new ModifyLiquidity(transaction.id.toString() + '-' + event.logIndex.toString())
    modifyLiquidity.transaction = transaction.id
    modifyLiquidity.timestamp = transaction.timestamp
    modifyLiquidity.pool = pool.id
    modifyLiquidity.token0 = pool.token0
    modifyLiquidity.token1 = pool.token1
    modifyLiquidity.sender = event.params.sender
    modifyLiquidity.origin = event.transaction.from
    modifyLiquidity.amount = event.params.liquidityDelta
    modifyLiquidity.amount0 = amount0
    modifyLiquidity.amount1 = amount1
    modifyLiquidity.amountUSD = amountUSD
    modifyLiquidity.tickLower = BigInt.fromI32(event.params.tickLower)
    modifyLiquidity.tickUpper = BigInt.fromI32(event.params.tickUpper)
    modifyLiquidity.logIndex = event.logIndex

    // tick entities
    const lowerTickIdx = event.params.tickLower
    const upperTickIdx = event.params.tickUpper

    const lowerTickId = poolId + '#' + BigInt.fromI32(event.params.tickLower).toString()
    const upperTickId = poolId + '#' + BigInt.fromI32(event.params.tickUpper).toString()

    let lowerTick = Tick.load(lowerTickId)
    let upperTick = Tick.load(upperTickId)

    if (lowerTick === null) {
      lowerTick = createTick(lowerTickId, lowerTickIdx, pool.id, event)
    }

    if (upperTick === null) {
      upperTick = createTick(upperTickId, upperTickIdx, pool.id, event)
    }

    const amount = event.params.liquidityDelta
    lowerTick.liquidityGross = lowerTick.liquidityGross.plus(amount)
    lowerTick.liquidityNet = lowerTick.liquidityNet.plus(amount)
    upperTick.liquidityGross = upperTick.liquidityGross.plus(amount)
    upperTick.liquidityNet = upperTick.liquidityNet.minus(amount)

    lowerTick.save()
    upperTick.save()

    lowerTick.save()
    upperTick.save()

    updateUniswapDayData(event, poolManagerAddress)
    updatePoolDayData(event.params.id.toHexString(), event)
    updatePoolHourData(event.params.id.toHexString(), event)
    updateTokenDayData(token0, event)
    updateTokenDayData(token1, event)
    updateTokenHourData(token0, event)
    updateTokenHourData(token1, event)

    token0.save()
    token1.save()
    pool.save()
    poolManager.save()
    modifyLiquidity.save()
  }
}
