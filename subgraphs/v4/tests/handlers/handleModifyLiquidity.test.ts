import { Address, BigDecimal, BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts'
import { afterEach, beforeEach, clearStore, describe, test } from 'matchstick-as'

import { handleModifyLiquidityHelper } from '../../src/mappings/modifyLiquidity'
import { ModifyLiquidity } from '../../generated/PoolManager/PoolManager'
import { Bundle, Pool, Token } from '../../generated/schema'
import { ONE_BD } from '../../src/constants'
import { convertTokenToDecimal, fastExponentiation, safeDiv } from '../../src/utils/index'
import { TickMath } from '../../src/utils/liquidityMath/tickMath'
import {
  assertObjectMatches,
  invokePoolCreatedWithMockedEthCalls,
  MOCK_EVENT,
  TEST_CONFIG,
  TEST_ETH_PRICE_USD,
  TEST_USDC_DERIVED_ETH,
  TEST_WETH_DERIVED_ETH,
  USDC_MAINNET_FIXTURE,
  USDC_WETH_POOL_ID,
  WETH_MAINNET_FIXTURE,
} from './constants'

class ModifyLiquidityFixture {
  id: string
  sender: Address
  tickLower: i32
  tickUpper: i32
  liquidityDelta: BigInt
}

const MODIFY_LIQUIDITY_FIXTURE_ADD: ModifyLiquidityFixture = {
  id: USDC_WETH_POOL_ID,
  sender: Address.fromString('0x39BF2eFF94201cfAA471932655404F63315147a4'), // Provided sender address
  tickLower: -600,
  tickUpper: 600,
  liquidityDelta: BigInt.fromString('10000000000000000000000'), // Provided liquidity delta
}

const MODIFY_LIQUIDITY_FIXTURE_REMOVE: ModifyLiquidityFixture = {
  id: USDC_WETH_POOL_ID,
  sender: Address.fromString('0x39BF2eFF94201cfAA471932655404F63315147a4'), // Provided sender address
  tickLower: -600,
  tickUpper: 600,
  liquidityDelta: BigInt.fromString('-10000000000000000000000'), // Provided liquidity delta
}

const id = Bytes.fromHexString(USDC_WETH_POOL_ID) as Bytes

const MODIFY_LIQUIDITY_EVENT_ADD = new ModifyLiquidity(
  MOCK_EVENT.address,
  MOCK_EVENT.logIndex,
  MOCK_EVENT.transactionLogIndex,
  MOCK_EVENT.logType,
  MOCK_EVENT.block,
  MOCK_EVENT.transaction,
  [
    new ethereum.EventParam('id', ethereum.Value.fromFixedBytes(id)),
    new ethereum.EventParam('sender', ethereum.Value.fromAddress(MODIFY_LIQUIDITY_FIXTURE_ADD.sender)),
    new ethereum.EventParam('tickLower', ethereum.Value.fromI32(MODIFY_LIQUIDITY_FIXTURE_ADD.tickLower as i32)),
    new ethereum.EventParam('tickUpper', ethereum.Value.fromI32(MODIFY_LIQUIDITY_FIXTURE_ADD.tickUpper as i32)),
    new ethereum.EventParam(
      'liquidityDelta',
      ethereum.Value.fromSignedBigInt(MODIFY_LIQUIDITY_FIXTURE_ADD.liquidityDelta),
    ),
  ],
  MOCK_EVENT.receipt,
)

const MODIFY_LIQUIDITY_EVENT_REMOVE = new ModifyLiquidity(
  MOCK_EVENT.address,
  MOCK_EVENT.logIndex,
  MOCK_EVENT.transactionLogIndex,
  MOCK_EVENT.logType,
  MOCK_EVENT.block,
  MOCK_EVENT.transaction,
  [
    new ethereum.EventParam('id', ethereum.Value.fromFixedBytes(id)),
    new ethereum.EventParam('sender', ethereum.Value.fromAddress(MODIFY_LIQUIDITY_FIXTURE_REMOVE.sender)),
    new ethereum.EventParam('tickLower', ethereum.Value.fromI32(MODIFY_LIQUIDITY_FIXTURE_REMOVE.tickLower as i32)),
    new ethereum.EventParam('tickUpper', ethereum.Value.fromI32(MODIFY_LIQUIDITY_FIXTURE_REMOVE.tickUpper as i32)),
    new ethereum.EventParam(
      'liquidityDelta',
      ethereum.Value.fromSignedBigInt(MODIFY_LIQUIDITY_FIXTURE_REMOVE.liquidityDelta),
    ),
  ],
  MOCK_EVENT.receipt,
)

describe('handleModifyLiquidity', () => {
  beforeEach(() => {
    invokePoolCreatedWithMockedEthCalls(MOCK_EVENT, TEST_CONFIG)

    const bundle = new Bundle('1')
    bundle.ethPriceUSD = TEST_ETH_PRICE_USD
    bundle.save()

    const usdcEntity = Token.load(USDC_MAINNET_FIXTURE.address)!
    usdcEntity.derivedETH = TEST_USDC_DERIVED_ETH
    usdcEntity.save()

    const wethEntity = Token.load(WETH_MAINNET_FIXTURE.address)!
    wethEntity.derivedETH = TEST_WETH_DERIVED_ETH
    wethEntity.save()
  })

  afterEach(() => {
    clearStore()
  })

  test('success - add liquidity event, pool tick is between tickUpper and tickLower', () => {
    // put the pools tick in range
    const pool = Pool.load(USDC_WETH_POOL_ID)!
    pool.tick = BigInt.fromI32(MODIFY_LIQUIDITY_FIXTURE_ADD.tickLower + MODIFY_LIQUIDITY_FIXTURE_ADD.tickUpper).div(
      BigInt.fromI32(2),
    )
    pool.sqrtPrice = TickMath.getSqrtRatioAtTick(pool.tick!.toI32())
    pool.save()

    handleModifyLiquidityHelper(MODIFY_LIQUIDITY_EVENT_ADD, TEST_CONFIG)

    const amountToken0 = convertTokenToDecimal(
      BigInt.fromString('295530108791371696809'),
      BigInt.fromString(USDC_MAINNET_FIXTURE.decimals),
    )
    const amountToken1 = convertTokenToDecimal(
      BigInt.fromString('295530108791371696809'),
      BigInt.fromString(WETH_MAINNET_FIXTURE.decimals),
    )

    const poolTotalValueLockedETH = amountToken0
      .times(TEST_USDC_DERIVED_ETH)
      .plus(amountToken1.times(TEST_WETH_DERIVED_ETH))
    const poolTotalValueLockedUSD = poolTotalValueLockedETH.times(TEST_ETH_PRICE_USD)

    assertObjectMatches('PoolManager', TEST_CONFIG.poolManagerAddress, [
      ['txCount', '1'],
      ['totalValueLockedETH', poolTotalValueLockedETH.toString()],
      ['totalValueLockedUSD', poolTotalValueLockedUSD.toString()],
    ])

    assertObjectMatches('Pool', USDC_WETH_POOL_ID, [
      ['txCount', '1'],
      ['liquidity', MODIFY_LIQUIDITY_FIXTURE_ADD.liquidityDelta.toString()],
      ['totalValueLockedToken0', amountToken0.toString()],
      ['totalValueLockedToken1', amountToken1.toString()],
      ['totalValueLockedETH', poolTotalValueLockedETH.toString()],
      ['totalValueLockedUSD', poolTotalValueLockedUSD.toString()],
    ])

    assertObjectMatches('Token', USDC_MAINNET_FIXTURE.address, [
      ['txCount', '1'],
      ['totalValueLocked', amountToken0.toString()],
      ['totalValueLockedUSD', amountToken0.times(TEST_USDC_DERIVED_ETH.times(TEST_ETH_PRICE_USD)).toString()],
    ])

    assertObjectMatches('Token', WETH_MAINNET_FIXTURE.address, [
      ['txCount', '1'],
      ['totalValueLocked', amountToken1.toString()],
      ['totalValueLockedUSD', amountToken1.times(TEST_WETH_DERIVED_ETH.times(TEST_ETH_PRICE_USD)).toString()],
    ])
    assertObjectMatches(
      'ModifyLiquidity',
      MOCK_EVENT.transaction.hash.toHexString() + '-' + MOCK_EVENT.logIndex.toString(),
      [
        ['transaction', MOCK_EVENT.transaction.hash.toHexString()],
        ['timestamp', MOCK_EVENT.block.timestamp.toString()],
        ['pool', USDC_WETH_POOL_ID],
        ['token0', USDC_MAINNET_FIXTURE.address],
        ['token1', WETH_MAINNET_FIXTURE.address],
        // ['owner', MODIFY_LIQUIDITY_FIXTURE.owner.toHexString()],
        ['sender', MODIFY_LIQUIDITY_FIXTURE_ADD.sender.toHexString()],
        ['origin', MOCK_EVENT.transaction.from.toHexString()],
        ['amount', MODIFY_LIQUIDITY_FIXTURE_ADD.liquidityDelta.toString()],
        ['amount0', amountToken0.toString()],
        ['amount1', amountToken1.toString()],
        ['amountUSD', poolTotalValueLockedUSD.toString()],
        ['tickUpper', MODIFY_LIQUIDITY_FIXTURE_ADD.tickUpper.toString()],
        ['tickLower', MODIFY_LIQUIDITY_FIXTURE_ADD.tickLower.toString()],
        ['logIndex', MOCK_EVENT.logIndex.toString()],
      ],
    )

    const lowerTickPrice = fastExponentiation(BigDecimal.fromString('1.0001'), MODIFY_LIQUIDITY_FIXTURE_ADD.tickLower)
    assertObjectMatches('Tick', USDC_WETH_POOL_ID + '#' + MODIFY_LIQUIDITY_FIXTURE_ADD.tickLower.toString(), [
      ['tickIdx', MODIFY_LIQUIDITY_FIXTURE_ADD.tickLower.toString()],
      ['pool', USDC_WETH_POOL_ID],
      ['poolAddress', USDC_WETH_POOL_ID],
      ['createdAtTimestamp', MOCK_EVENT.block.timestamp.toString()],
      ['createdAtBlockNumber', MOCK_EVENT.block.number.toString()],
      ['liquidityGross', MODIFY_LIQUIDITY_FIXTURE_ADD.liquidityDelta.toString()],
      ['liquidityNet', MODIFY_LIQUIDITY_FIXTURE_ADD.liquidityDelta.toString()],
      ['price0', lowerTickPrice.toString()],
      ['price1', safeDiv(ONE_BD, lowerTickPrice).toString()],
    ])

    const upperTickPrice = fastExponentiation(BigDecimal.fromString('1.0001'), MODIFY_LIQUIDITY_FIXTURE_ADD.tickUpper)
    assertObjectMatches('Tick', USDC_WETH_POOL_ID + '#' + MODIFY_LIQUIDITY_FIXTURE_ADD.tickUpper.toString(), [
      ['tickIdx', MODIFY_LIQUIDITY_FIXTURE_ADD.tickUpper.toString()],
      ['pool', USDC_WETH_POOL_ID],
      ['poolAddress', USDC_WETH_POOL_ID],
      ['createdAtTimestamp', MOCK_EVENT.block.timestamp.toString()],
      ['createdAtBlockNumber', MOCK_EVENT.block.number.toString()],
      ['liquidityGross', MODIFY_LIQUIDITY_FIXTURE_ADD.liquidityDelta.toString()],
      ['liquidityNet', MODIFY_LIQUIDITY_FIXTURE_ADD.liquidityDelta.neg().toString()],
      ['price0', upperTickPrice.toString()],
      ['price1', safeDiv(ONE_BD, upperTickPrice).toString()],
    ])
  })

  test('success - remove liquidity event, pool tick is between tickUpper and tickLower', () => {
    // put the pools tick in range
    const pool = Pool.load(USDC_WETH_POOL_ID)!
    pool.tick = BigInt.fromI32(
      MODIFY_LIQUIDITY_FIXTURE_REMOVE.tickLower + MODIFY_LIQUIDITY_FIXTURE_REMOVE.tickUpper,
    ).div(BigInt.fromI32(2))
    pool.sqrtPrice = TickMath.getSqrtRatioAtTick(pool.tick!.toI32())
    pool.save()

    handleModifyLiquidityHelper(MODIFY_LIQUIDITY_EVENT_REMOVE, TEST_CONFIG)

    const amountToken0 = convertTokenToDecimal(
      BigInt.fromString('-295530108791371696808'),
      BigInt.fromString(USDC_MAINNET_FIXTURE.decimals),
    )
    const amountToken1 = convertTokenToDecimal(
      BigInt.fromString('-295530108791371696808'),
      BigInt.fromString(WETH_MAINNET_FIXTURE.decimals),
    )
    const poolTotalValueLockedETH = amountToken0
      .times(TEST_USDC_DERIVED_ETH)
      .plus(amountToken1.times(TEST_WETH_DERIVED_ETH))
    const poolTotalValueLockedUSD = poolTotalValueLockedETH.times(TEST_ETH_PRICE_USD)

    assertObjectMatches('PoolManager', TEST_CONFIG.poolManagerAddress, [
      ['txCount', '1'],
      ['totalValueLockedETH', poolTotalValueLockedETH.toString()],
      ['totalValueLockedUSD', poolTotalValueLockedUSD.toString()],
    ])

    assertObjectMatches('Pool', USDC_WETH_POOL_ID, [
      ['txCount', '1'],
      ['liquidity', MODIFY_LIQUIDITY_FIXTURE_REMOVE.liquidityDelta.toString()],
      ['totalValueLockedToken0', amountToken0.toString()],
      ['totalValueLockedToken1', amountToken1.toString()],
      ['totalValueLockedETH', poolTotalValueLockedETH.toString()],
      ['totalValueLockedUSD', poolTotalValueLockedUSD.toString()],
    ])

    assertObjectMatches('Token', USDC_MAINNET_FIXTURE.address, [
      ['txCount', '1'],
      ['totalValueLocked', amountToken0.toString()],
      ['totalValueLockedUSD', amountToken0.times(TEST_USDC_DERIVED_ETH.times(TEST_ETH_PRICE_USD)).toString()],
    ])

    assertObjectMatches('Token', WETH_MAINNET_FIXTURE.address, [
      ['txCount', '1'],
      ['totalValueLocked', amountToken1.toString()],
      ['totalValueLockedUSD', amountToken1.times(TEST_WETH_DERIVED_ETH.times(TEST_ETH_PRICE_USD)).toString()],
    ])
    assertObjectMatches(
      'ModifyLiquidity',
      MOCK_EVENT.transaction.hash.toHexString() + '-' + MOCK_EVENT.logIndex.toString(),
      [
        ['transaction', MOCK_EVENT.transaction.hash.toHexString()],
        ['timestamp', MOCK_EVENT.block.timestamp.toString()],
        ['pool', USDC_WETH_POOL_ID],
        ['token0', USDC_MAINNET_FIXTURE.address],
        ['token1', WETH_MAINNET_FIXTURE.address],
        ['sender', MODIFY_LIQUIDITY_FIXTURE_REMOVE.sender.toHexString()],
        ['origin', MOCK_EVENT.transaction.from.toHexString()],
        ['amount', MODIFY_LIQUIDITY_FIXTURE_REMOVE.liquidityDelta.toString()],
        ['amount0', amountToken0.toString()],
        ['amount1', amountToken1.toString()],
        ['amountUSD', poolTotalValueLockedUSD.toString()],
        ['tickUpper', MODIFY_LIQUIDITY_FIXTURE_REMOVE.tickUpper.toString()],
        ['tickLower', MODIFY_LIQUIDITY_FIXTURE_REMOVE.tickLower.toString()],
        ['logIndex', MOCK_EVENT.logIndex.toString()],
      ],
    )

    const lowerTickPrice = fastExponentiation(
      BigDecimal.fromString('1.0001'),
      MODIFY_LIQUIDITY_FIXTURE_REMOVE.tickLower,
    )
    assertObjectMatches('Tick', USDC_WETH_POOL_ID + '#' + MODIFY_LIQUIDITY_FIXTURE_REMOVE.tickLower.toString(), [
      ['tickIdx', MODIFY_LIQUIDITY_FIXTURE_REMOVE.tickLower.toString()],
      ['pool', USDC_WETH_POOL_ID],
      ['poolAddress', USDC_WETH_POOL_ID],
      ['createdAtTimestamp', MOCK_EVENT.block.timestamp.toString()],
      ['createdAtBlockNumber', MOCK_EVENT.block.number.toString()],
      ['liquidityGross', MODIFY_LIQUIDITY_FIXTURE_REMOVE.liquidityDelta.toString()],
      ['liquidityNet', MODIFY_LIQUIDITY_FIXTURE_REMOVE.liquidityDelta.toString()],
      ['price0', lowerTickPrice.toString()],
      ['price1', safeDiv(ONE_BD, lowerTickPrice).toString()],
    ])

    const upperTickPrice = fastExponentiation(
      BigDecimal.fromString('1.0001'),
      MODIFY_LIQUIDITY_FIXTURE_REMOVE.tickUpper,
    )
    assertObjectMatches('Tick', USDC_WETH_POOL_ID + '#' + MODIFY_LIQUIDITY_FIXTURE_REMOVE.tickUpper.toString(), [
      ['tickIdx', MODIFY_LIQUIDITY_FIXTURE_REMOVE.tickUpper.toString()],
      ['pool', USDC_WETH_POOL_ID],
      ['poolAddress', USDC_WETH_POOL_ID],
      ['createdAtTimestamp', MOCK_EVENT.block.timestamp.toString()],
      ['createdAtBlockNumber', MOCK_EVENT.block.number.toString()],
      ['liquidityGross', MODIFY_LIQUIDITY_FIXTURE_REMOVE.liquidityDelta.toString()],
      ['liquidityNet', MODIFY_LIQUIDITY_FIXTURE_REMOVE.liquidityDelta.neg().toString()],
      ['price0', upperTickPrice.toString()],
      ['price1', safeDiv(ONE_BD, upperTickPrice).toString()],
    ])
  })

  test('success - add liquidity event, pool tick is not between tickUpper and tickLower', () => {
    // put the pools tick out of range
    const pool = Pool.load(USDC_WETH_POOL_ID)!
    pool.tick = BigInt.fromI32(MODIFY_LIQUIDITY_FIXTURE_ADD.tickLower - 1)
    const liquidityBeforeModifyLiquidity = pool.liquidity
    pool.save()

    handleModifyLiquidityHelper(MODIFY_LIQUIDITY_EVENT_ADD, TEST_CONFIG)

    // liquidity should not be updated
    assertObjectMatches('Pool', USDC_WETH_POOL_ID, [['liquidity', liquidityBeforeModifyLiquidity.toString()]])
  })

  test('success - amounts are correct for remove liquidity event with currentTick just under upper tick', () => {
    const FIXTURE: ModifyLiquidityFixture = {
      id: USDC_WETH_POOL_ID,
      sender: Address.fromString('0x39BF2eFF94201cfAA471932655404F63315147a4'),
      tickLower: 16080,
      tickUpper: 21180,
      liquidityDelta: BigInt.fromString('-171307279129958064896084173'),
    }

    const event = new ModifyLiquidity(
      MOCK_EVENT.address,
      MOCK_EVENT.logIndex,
      MOCK_EVENT.transactionLogIndex,
      MOCK_EVENT.logType,
      MOCK_EVENT.block,
      MOCK_EVENT.transaction,
      [
        new ethereum.EventParam('id', ethereum.Value.fromFixedBytes(id)),
        new ethereum.EventParam('sender', ethereum.Value.fromAddress(FIXTURE.sender)),
        new ethereum.EventParam('tickLower', ethereum.Value.fromI32(FIXTURE.tickLower)),
        new ethereum.EventParam('tickUpper', ethereum.Value.fromI32(FIXTURE.tickUpper)),
        new ethereum.EventParam('liquidityDelta', ethereum.Value.fromSignedBigInt(FIXTURE.liquidityDelta)),
      ],
      MOCK_EVENT.receipt,
    )

    const pool = Pool.load(USDC_WETH_POOL_ID)!
    pool.tick = BigInt.fromI32(21179)
    pool.sqrtPrice = BigInt.fromString('228441206771431211303324095474')
    pool.save()

    handleModifyLiquidityHelper(event, TEST_CONFIG)

    const expectedAmount0 = BigDecimal.fromString('-0.000000002367391256')
    const expectedAmount1 = BigDecimal.fromString('-111171964.475622427888514086')
    assertObjectMatches(
      'ModifyLiquidity',
      MOCK_EVENT.transaction.hash.toHexString() + '-' + MOCK_EVENT.logIndex.toString(),
      [
        ['amount0', expectedAmount0.toString()],
        ['amount1', expectedAmount1.toString()],
      ],
    )
  })
})
