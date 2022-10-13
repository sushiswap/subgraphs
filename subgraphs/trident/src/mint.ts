import { BigDecimal } from '@graphprotocol/graph-ts'
import { Mint, Transaction } from '../generated/schema'
import { Mint as MintEvent } from '../generated/templates/ConstantProductPool/ConstantProductPool'
import { BIG_INT_ONE, PairType } from './constants'
import {
  convertTokenToDecimal,
  getOrCreateBundle,
  getOrCreateToken,
  getPair,
  getTokenPrice,
  increaseFactoryTransactionCount as increaseFactoryTransactionCount
} from './functions'

export function handleMint(event: MintEvent): Mint | null {
  const transaction = Transaction.load(event.transaction.hash.toHex())

  if (transaction === null) {
    return null
  }

  const mints = transaction.mints

  if (mints == null) {
    return null
  }

  const mint = Mint.load(mints[mints.length - 1])

  const pair = getPair(event.address.toHex())

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

  if (mint !== null) {
    mint.sender = event.params.sender
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

  increaseFactoryTransactionCount(pair.type)
  return mint
}
