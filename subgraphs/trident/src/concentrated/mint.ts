import { BigDecimal, BigInt } from '@graphprotocol/graph-ts'
import { Mint } from '../../generated/schema'
import { Mint as MintEvent } from '../../generated/templates/ConcentratedLiquidityPool/ConcentratedLiquidityPool'
import { BIG_DECIMAL_ZERO, BIG_INT_ONE, PairType } from '../constants'
import {
  convertTokenToDecimal,
  getOrCreateBundle,
  getOrCreateToken, getOrCreateTransaction, getPair,
  getTokenPrice,
  increaseFactoryTransactionCount
} from '../functions'

export function handleMint(event: MintEvent): Mint | null {

  getOrCreateTransaction(event)

  const pair = getPair(event.address.toHex())

  const id = event.transaction.hash.toHex().concat('-cl-').concat(pair.txCount.toString().toString())


  const token0 = getOrCreateToken(pair.token0)
  const token1 = getOrCreateToken(pair.token1)
  const token0Price = getTokenPrice(pair.token0)
  const token1Price = getTokenPrice(pair.token1)

  const token0Amount = convertTokenToDecimal(event.params.amount0, token0.decimals)
  const token1Amount = convertTokenToDecimal(event.params.amount1, token1.decimals)


  // get new amounts of USD and ETH for tracking
  const bundle = getOrCreateBundle()
  const amountTotalUSD = token1Price.derivedNative
    .times(token1Amount)
    .plus(token0Price.derivedNative.times(token0Amount))
    .times(bundle.nativePrice)

  let mint = Mint.load(id)
  if (mint === null) {
    mint = new Mint(id)
    mint.pair = event.address.toHex()
    mint.to = event.params.owner.toHex()
    mint.liquidity = BIG_DECIMAL_ZERO
    mint.timestamp = event.block.timestamp
    mint.transaction = event.transaction.hash.toHex()
    // mint.save()
    // mint.sender = event.params.
    mint.amount0 = token0Amount as BigDecimal
    mint.amount1 = token1Amount as BigDecimal
    mint.logIndex = event.logIndex
    mint.amountUSD = amountTotalUSD as BigDecimal
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
