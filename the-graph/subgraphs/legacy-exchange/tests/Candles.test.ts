import { Address, BigDecimal, BigInt, Bytes, log } from '@graphprotocol/graph-ts'
import { assert, clearStore, test } from 'matchstick-as/assembly/index'
import { NATIVE_ADDRESS } from '../src/constants/addresses'
import { TIME_FRAMES } from '../src/constants/time'
import { generateCandleId } from '../src/functions/candle'
import { getTokenPrice } from '../src/functions/index'
import { onSwap, onSync } from '../src/mappings/pair'
import { createStablePools, createSwapEvent, createSyncEvent } from './mocks'
import { TokenPrice } from '../generated/schema'
import { Swap } from '../generated/templates/Pair/Pair'
const USDC = Address.fromString('0xb7a4f3e9097c08da09517b5ab877f7a917224ede')
const TUSD = Address.fromString('0x07de306ff27a2b630b1141956844eb1552b956b5')
const WETH = Address.fromString(NATIVE_ADDRESS)
let PAIR: Address
const ALICE = Address.fromString('0x0000000000000000000000000000000000000001')
const BOB = Address.fromString('0x0000000000000000000000000000000000000b0b')

function setup(): void {
  // let pairCreatedEvent = createPairCreatedEvent(FACTORY_ADDRESS, USDC, WETH, PAIR)

  // getOrCreateTokenMock(USDC.toHex(), 6, 'USD Coin', 'USDC')
  // getOrCreateTokenMock(WETH.toHex(), 18, 'Wrapped ETH', 'WETH')
  // onPairCreated(pairCreatedEvent)
  PAIR = Address.fromString(createStablePools()[0])
}

function cleanup(): void {
  clearStore()
}

test('Candle creation', () => {
  setup()
  let amount0In = BigInt.fromString('2500000000')
  let amount0Out = BigInt.fromString('10000000')
  let amount1In = BigInt.fromString('25000000')
  let amount1Out = BigInt.fromString('1000000000000000000')
  let reserve0 = BigInt.fromString('5000000000')
  let reserve1 = BigInt.fromString('4000000000000000000')
  let time = BigInt.fromString('1645214443') // 	Fri Feb 18 2022 20:00:43 GMT+0000
  let time2 = BigInt.fromString('1645214683') // 	Fri Feb 18 2022 20:01:43 GMT+0000 (4 minutes later)
  let block = BigInt.fromString('1337')
  let block2 = BigInt.fromString('1338')

  let syncEvent = createSyncEvent(PAIR, reserve0, reserve1)
  let swapEvent = createSwapEvent(PAIR, amount0In, amount1In, amount0Out, amount1Out, ALICE)
  swapEvent.block.timestamp = time
  swapEvent.block.number = block

  // When: A swap occurs
  onSync(syncEvent)
  onSwap(swapEvent)

  let token0Amount = amount0In.minus(amount0Out).abs().divDecimal(BigInt.fromI32(10).pow(6).toBigDecimal())
  let token1Amount = amount1Out.minus(amount1In).abs().divDecimal(BigInt.fromI32(10).pow(18).toBigDecimal())
  // Then: Candles are created
  for (let i = 0; i < TIME_FRAMES.length; i++) {
    let candleId = generateCandleId(swapEvent.block.timestamp.toI32(), TIME_FRAMES[i], TUSD.toHex(), WETH.toHex())
    assertCandle(candleId, time, block, TIME_FRAMES[i])

    assertOHLC(candleId, token0Amount, token1Amount)
  }

  // When: Another swap occurs (4 minutes later)
  amount0In = BigInt.fromString('1500000000')
  amount0Out = BigInt.fromString('10000000')
  amount1In = BigInt.fromString('15000000')
  amount1Out = BigInt.fromString('750000000000000000')
  let swapEvent2 = createSwapEvent(PAIR, amount0In, amount1In, amount0Out, amount1Out, ALICE)
  let syncEvent2 = createSyncEvent(PAIR, reserve0, reserve1)
  swapEvent2.block.timestamp = time2
  swapEvent2.block.number = block2
  onSync(syncEvent2)
  onSwap(swapEvent2)

  // Then: The 1M-candle remains unchanged
  let candleId = generateCandleId(time.toI32(), TIME_FRAMES[0], TUSD.toHex(), WETH.toHex())
  assertCandle(candleId, time, block, TIME_FRAMES[0])

  assertOHLC(candleId, token0Amount, token1Amount)

  // And: a new 1M candle is created
  let token0Amount2 = amount0In.minus(amount0Out).abs().divDecimal(BigInt.fromI32(10).pow(6).toBigDecimal())
  let token1Amount2 = amount1Out.minus(amount1In).abs().divDecimal(BigInt.fromI32(10).pow(18).toBigDecimal())

  candleId = generateCandleId(swapEvent2.block.timestamp.toI32(), TIME_FRAMES[0], TUSD.toHex(), WETH.toHex())
  assertCandle(candleId, time2, block2, TIME_FRAMES[0])
  assertOHLC(candleId, token0Amount2, token1Amount2)

  // And: the rest of the candles are updated.
  for (let i = 1; i < TIME_FRAMES.length; i++) {
    let candleId = generateCandleId(time2.toI32(), TIME_FRAMES[i], TUSD.toHex(), WETH.toHex())
    assertCandle(candleId, time, block2, TIME_FRAMES[i])

    let token0Price = getTokenPrice(TUSD.toHex())
    assertOpen(candleId, token0Amount, token1Amount, token0Price)
    assertHigh(candleId, token0Amount, token1Amount, token0Price)
    assertLow(candleId, token0Amount2, token1Amount2, token0Price)
    assertClose(candleId, token0Amount2, token1Amount2, token0Price)
  }

  cleanup()
})

test('Candle creates upper and lower shadows', () => {})

function assertCandle(
  candleId: string,
  timestamp: BigInt,
  block: BigInt,
  period: i32
): void {
  assert.fieldEquals('Candle', candleId, 'id', candleId)
  assert.fieldEquals('Candle', candleId, 'pair', PAIR.toHex())
  assert.fieldEquals('Candle', candleId, 'time', timestamp.toString())
  assert.fieldEquals('Candle', candleId, 'period', period.toString())
  assert.fieldEquals('Candle', candleId, 'token0', TUSD.toHex())
  assert.fieldEquals('Candle', candleId, 'token1', WETH.toHex())
  assert.fieldEquals('Candle', candleId, 'lastBlock', block.toString())
}

function assertOHLC(
  candleId: string,
  token0Amount: BigDecimal,
  token1Amount: BigDecimal
): void {
  let token0Price = getTokenPrice(TUSD.toHex())
  assertOpen(candleId, token0Amount, token1Amount, token0Price)
  assertClose(candleId, token0Amount, token1Amount, token0Price)
  assertHigh(candleId, token0Amount, token1Amount, token0Price)
  assertLow(candleId, token0Amount, token1Amount, token0Price)
}

function assertOpen(
  candleId: string,
  token0Amount: BigDecimal,
  token1Amount: BigDecimal,
  token0Price: TokenPrice
): void {
  const price = token0Amount.div(token1Amount)
  assert.fieldEquals('Candle', candleId, 'open', price.toString())
  assert.fieldEquals('Candle', candleId, 'openUSD', price.times(token0Price.derivedUSD).toString())
  assert.fieldEquals('Candle', candleId, 'openNative', price.times(token0Price.derivedNative).toString())
}

function assertHigh(
  candleId: string,
  token0Amount: BigDecimal,
  token1Amount: BigDecimal,
  token0Price: TokenPrice
): void {
  const price = token0Amount.div(token1Amount)
  assert.fieldEquals('Candle', candleId, 'high', price.toString())
  assert.fieldEquals('Candle', candleId, 'highUSD', price.times(token0Price.derivedUSD).toString())
  assert.fieldEquals('Candle', candleId, 'highNative', price.times(token0Price.derivedNative).toString())
}

function assertLow(
  candleId: string,
  token0Amount: BigDecimal,
  token1Amount: BigDecimal,
  token0Price: TokenPrice
): void {
  const price = token0Amount.div(token1Amount)
  assert.fieldEquals('Candle', candleId, 'low', price.toString())
  assert.fieldEquals('Candle', candleId, 'lowUSD', price.times(token0Price.derivedUSD).toString())
  assert.fieldEquals('Candle', candleId, 'lowNative', price.times(token0Price.derivedNative).toString())
}

function assertClose(
  candleId: string,
  token0Amount: BigDecimal,
  token1Amount: BigDecimal,
  token0Price: TokenPrice
): void {
  const price = token0Amount.div(token1Amount)
  assert.fieldEquals('Candle', candleId, 'close', price.toString())
  assert.fieldEquals('Candle', candleId, 'closeUSD', price.times(token0Price.derivedUSD).toString())
  assert.fieldEquals('Candle', candleId, 'closeNative', price.times(token0Price.derivedNative).toString())
}
