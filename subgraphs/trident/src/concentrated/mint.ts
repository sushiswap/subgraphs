import { BigDecimal, BigInt } from '@graphprotocol/graph-ts'
import { getConcentratedLiquidityInfo } from '../functions'
import { Mint } from '../../generated/schema'
import { Mint as MintEvent } from '../../generated/templates/ConcentratedLiquidityPool/ConcentratedLiquidityPool'
import { BIG_DECIMAL_ZERO, BIG_INT_ONE, PairType } from '../constants'
import {
  convertTokenToDecimal,
  getOrCreateBundle,
  getOrCreateFactory,
  getOrCreateToken, getOrCreateTransaction, getPair,
  getTokenPrice,
  increaseFactoryTransactionCount
} from '../functions'
import { updateDerivedTVLAmounts } from './tvl'

export function handleMint(event: MintEvent): Mint | null {

  getOrCreateTransaction(event)

  const pair = getPair(event.address.toHex())

  const token0 = getOrCreateToken(pair.token0)
  const token1 = getOrCreateToken(pair.token1)
  const token0Price = getTokenPrice(pair.token0)
  const token1Price = getTokenPrice(pair.token1)

  const amount0 = convertTokenToDecimal(event.params.amount0, token0.decimals)
  const amount1 = convertTokenToDecimal(event.params.amount1, token1.decimals)
  const concentratedLiquidity = getConcentratedLiquidityInfo(pair.id)
  
  // Update TVL values.
  let oldLiquidityNative = pair.liquidityNative
  token0.liquidity = token0.liquidity.plus(event.params.amount0)
  token1.liquidity = token1.liquidity.plus(event.params.amount1)
  pair.reserve0 = pair.reserve0.plus(event.params.amount0)
  pair.reserve1 = pair.reserve1.plus(event.params.amount1)
  updateDerivedTVLAmounts(pair, oldLiquidityNative)

  
  // Pools liquidity tracks the currently active liquidity given pools current tick.
  // We only want to update it on mint if the new position includes the current tick.
  if (
    concentratedLiquidity.tick !== null &&
    BigInt.fromI32(event.params.tickLower).le(concentratedLiquidity.tick as BigInt) &&
    BigInt.fromI32(event.params.tickUpper).gt(concentratedLiquidity.tick as BigInt)
  ) {
    pair.liquidity = pair.liquidity.plus(event.params.liquidityAmount)
  }



  // get new amounts of USD and ETH for tracking
  const bundle = getOrCreateBundle()
  const amountTotalUSD = token1Price.derivedNative
    .times(amount1)
    .plus(token0Price.derivedNative.times(amount0))
    .times(bundle.nativePrice)

  const id = event.transaction.hash.toHex().concat('-cl-').concat(pair.txCount.toString())
  let mint = Mint.load(id)
  if (mint === null) {
    mint = new Mint(id)
    mint.transaction = event.transaction.hash.toHex()
    mint.timestamp = event.block.timestamp
    mint.pair = event.address.toHex()
    mint.to = event.params.owner.toHex()
    mint.liquidity = BIG_DECIMAL_ZERO // Must be set to be compatible with current schema
    // mint.sender?
    mint.amount0 = amount0
    mint.amount1 = amount1
    mint.amountUSD = amountTotalUSD
    mint.logIndex = event.logIndex
    mint.save()
  }

  pair.txCount = pair.txCount.plus(BIG_INT_ONE)
  pair.save()
  token0.txCount = token0.txCount.plus(BIG_INT_ONE)
  token0.save()
  token1.txCount = token1.txCount.plus(BIG_INT_ONE)
  token1.save()

  increaseFactoryTransactionCount(PairType.CONCENTRATED_LIQUIDITY_POOL)
  return mint
}
