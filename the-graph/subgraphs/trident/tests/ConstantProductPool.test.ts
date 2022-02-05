import { Address, BigDecimal, BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts'
import { assert, newMockEvent, test } from 'matchstick-as/assembly/index'
import { clearStore, logStore } from 'matchstick-as/assembly/store'
import { ConstantProductPoolFactory, MasterDeployer } from '../generated/schema'
import {
  ADDRESS_ZERO,
  CONSTANT_PRODUCT_POOL_FACTORY_ADDRESS,
  MASTER_DEPLOYER_ADDRESS,
  WHITELISTED_TOKEN_ADDRESSES,
} from '../src/constants/addresses'
import {
  getConstantProductPoolKpi,
  getPoolDaySnapshotId,
  getPoolHourSnapshotId,
  getTokenDaySnapshotId,
  getTokenKpi
} from '../src/functions'
import { createBurnId, createMintId, createSwapId, onBurn, onMint, onSwap, onSync, onTransfer } from '../src/mappings/constant-product-pool'
import { onAddToWhitelist, onDeployPool } from '../src/mappings/master-deployer'
import {
  createAddToWhitelistEvent,
  createBurnEvent,
  createDeployPoolEvent,
  createMintEvent,
  createSwapEvent,
  createSyncEvent,
  createTransferEvent,
  getOrCreateTokenMock,
} from './mocks'

const BIGINT_ETH_AMOUNT = BigInt.fromString('1000000000000000001')
const BIGINT_USD_AMOUNT = BigInt.fromString('3000000001')
const ETH_AMOUNT = '1.000000000000000001'
const USD_AMOUNT = '3000.000001'

const BENTOBOX_ADDRESS = Address.fromString('0xc381a85ed7C7448Da073b7d6C9d4cBf1Cbf576f0')
let poolAddress = Address.fromString('0x0000000000000000000000000000000000000420')
let constantProductPoolFactoryAddress = CONSTANT_PRODUCT_POOL_FACTORY_ADDRESS.toHexString()
let constantProductPoolFactory: ConstantProductPoolFactory
let masterDeployerOwner = Address.fromString('0x0000000000000000000000000000000000001337')
let masterDeployer: MasterDeployer
let alice = Address.fromString('0x0000000000000000000000000000000000080085')
let bob = Address.fromString('0x0000000000000000000000000000000000000b0b')

const TIMESTAMP1 = BigInt.fromString('1644011546') // Equivalent to	Fri Feb 04 2022 21:52:26 GMT+0000
const TIMESTAMP2 = BigInt.fromString('1644094346') // One day later than previous, Sat Feb 05 2022 20:52:26 GMT+0000
const TIMESTAMP3 = BigInt.fromString('1644097946') // One hour later than previous, Sat Feb 05 2022 21:52:26 GMT+0000

function setup(): void {
  clearStore()
  constantProductPoolFactory = new ConstantProductPoolFactory(constantProductPoolFactoryAddress)
  constantProductPoolFactory.pools = [poolAddress.toHex()]
  constantProductPoolFactory.save()

  masterDeployer = new MasterDeployer(MASTER_DEPLOYER_ADDRESS.toHexString())
  masterDeployer.factories = [constantProductPoolFactory.id]
  masterDeployer.pools = [poolAddress.toHex()]
  masterDeployer.owner = masterDeployerOwner
  masterDeployer.bento = BENTOBOX_ADDRESS
  masterDeployer.save()

  let addWhitelistEvent = createAddToWhitelistEvent(CONSTANT_PRODUCT_POOL_FACTORY_ADDRESS, masterDeployerOwner)
  let deployData = createDeployData(WHITELISTED_TOKEN_ADDRESSES[0], WHITELISTED_TOKEN_ADDRESSES[1], false)
  let deployPoolEvent = createDeployPoolEvent(
    poolAddress,
    MASTER_DEPLOYER_ADDRESS,
    CONSTANT_PRODUCT_POOL_FACTORY_ADDRESS,
    deployData
  )
  onAddToWhitelist(addWhitelistEvent)

  getOrCreateTokenMock(WHITELISTED_TOKEN_ADDRESSES[0], 18, 'Wrapped Ether', 'WETH')
  getOrCreateTokenMock(WHITELISTED_TOKEN_ADDRESSES[1], 6, 'USD Coin', 'USDC')

  onDeployPool(deployPoolEvent)
}

function cleanup(): void {
  clearStore()
}

test('Initial transfer is ignored', () => {
  setup()

  let mockEvent = newMockEvent()
  let transferEvent = createTransferEvent(mockEvent.transaction, poolAddress, ADDRESS_ZERO, BigInt.fromString("1000"))
  let transactionId = transferEvent.transaction.hash.toHex()
  onTransfer(transferEvent)

  assert.notInStore('Transaction', transactionId)

  cleanup()
})

test('Transaction', () => {
  setup()

  let burnEvent = createBurnEvent(
    poolAddress,
    ADDRESS_ZERO,
    BIGINT_ETH_AMOUNT,
    BIGINT_USD_AMOUNT,
    bob,
    BIGINT_ETH_AMOUNT
  )
  let transactionId = burnEvent.transaction.hash.toHex()
  let transferEvent = createTransferEvent(burnEvent.transaction, poolAddress, ADDRESS_ZERO, BIGINT_ETH_AMOUNT)

  onTransfer(transferEvent)
  onBurn(burnEvent)

  assert.fieldEquals('Transaction', transactionId, 'id', transactionId)
  assert.fieldEquals('Transaction', transactionId, 'gasLimit', transferEvent.transaction.gasLimit.toString())
  assert.fieldEquals('Transaction', transactionId, 'gasPrice', transferEvent.transaction.gasPrice.toString())
  assert.fieldEquals('Transaction', transactionId, 'block', transferEvent.block.number.toString())
  assert.fieldEquals('Transaction', transactionId, 'timestamp', transferEvent.block.timestamp.toString())

  cleanup()
})

test('onMint creates a mint object with the expected fields', () => {
  setup()
  let poolLiquidityInt = BigInt.fromString('3444444444444444444')
  let mintEvent = createMintEvent(
    poolAddress,
    ADDRESS_ZERO,
    BIGINT_ETH_AMOUNT,
    BIGINT_USD_AMOUNT,
    bob,
    poolLiquidityInt
  )
  let transferEvent = createTransferEvent(mintEvent.transaction, poolAddress, ADDRESS_ZERO, BIGINT_ETH_AMOUNT)
  let syncEvent = createSyncEvent(poolAddress, BIGINT_USD_AMOUNT, BIGINT_USD_AMOUNT)

  onTransfer(transferEvent)
  onSync(syncEvent)
  onMint(mintEvent)

  let transactionId = transferEvent.transaction.hash.toHex()
  let id = createMintId(transactionId, BigInt.fromString("0"))
  assert.fieldEquals('Mint', id, 'transaction', transactionId)
  assert.fieldEquals('Mint', id, 'pool', poolAddress.toHex())
  assert.fieldEquals('Mint', id, 'token0', WHITELISTED_TOKEN_ADDRESSES[0])
  assert.fieldEquals('Mint', id, 'token1', WHITELISTED_TOKEN_ADDRESSES[1])
  assert.fieldEquals('Mint', id, 'amount0', ETH_AMOUNT)
  assert.fieldEquals('Mint', id, 'amount1', USD_AMOUNT)
  assert.fieldEquals('Mint', id, 'recipient', mintEvent.params.recipient.toHex())
  assert.fieldEquals('Mint', id, 'origin', mintEvent.transaction.from.toHex())
  assert.fieldEquals('Mint', id, 'sender', mintEvent.params.sender.toHex())
  assert.fieldEquals('Mint', id, 'logIndex', mintEvent.logIndex.toString())

  cleanup()
})


test('Mint, assert KPIs and snapshots', () => {
  setup()

  let ethLiquidity = BigDecimal.fromString('14.000000000000000041')
  let usdLiquidity = BigDecimal.fromString('3300')
  updateTokenKpiLiquidity(ethLiquidity, usdLiquidity)

  let poolLiquidity = '5.555555555555555555'
  updatePoolLiquidity(poolAddress.toHex(), poolLiquidity)

  let poolLiquidityInt = BigInt.fromString('3444444444444444444')
  let mintEvent = createMintEvent(
    poolAddress,
    ADDRESS_ZERO,
    BIGINT_ETH_AMOUNT,
    BIGINT_USD_AMOUNT,
    bob,
    poolLiquidityInt
  )
  mintEvent.block.timestamp = TIMESTAMP1
  let transferEvent = createTransferEvent(mintEvent.transaction, poolAddress, ADDRESS_ZERO, BIGINT_ETH_AMOUNT)
  let syncEvent = createSyncEvent(poolAddress, BIGINT_USD_AMOUNT, BIGINT_USD_AMOUNT)

  onTransfer(transferEvent)
  onSync(syncEvent)
  onMint(mintEvent)

  assert.fieldEquals('TokenKpi', WHITELISTED_TOKEN_ADDRESSES[0], 'liquidity', '15.000000000000000042')
  assert.fieldEquals('TokenKpi', WHITELISTED_TOKEN_ADDRESSES[1], 'liquidity', '6300.000001')
  assert.fieldEquals('ConstantProductPoolKpi', poolAddress.toHex(), 'liquidity', '8.999999999999999999')

  let token0SnapshotId = getTokenDaySnapshotId(WHITELISTED_TOKEN_ADDRESSES[0], mintEvent.block.timestamp)
  let token1SnapshotId = getTokenDaySnapshotId(WHITELISTED_TOKEN_ADDRESSES[1], mintEvent.block.timestamp)
  let poolDaySnapshotId = getPoolDaySnapshotId(poolAddress.toHex(), mintEvent.block.timestamp)
  let poolHourSnapshotId = getPoolHourSnapshotId(poolAddress.toHex(), mintEvent.block.timestamp)

  // And: the Snapshots liquidity is increased
  assert.fieldEquals('TokenDaySnapshot', token0SnapshotId, 'liquidity', '15.000000000000000042')
  assert.fieldEquals('TokenDaySnapshot', token1SnapshotId, 'liquidity', '6300.000001')
  assert.fieldEquals('PoolDaySnapshot', poolDaySnapshotId, 'liquidity', '8.999999999999999999')
  assert.fieldEquals('PoolHourSnapshot', poolHourSnapshotId, 'liquidity', '8.999999999999999999')

  mintEvent.block.timestamp = TIMESTAMP2
  mintEvent.transaction.hash = Address.fromString('0xA16081F360e3847006dB660bae1c6d1b2e17eC2B') as Bytes
  transferEvent.transaction.hash = Address.fromString('0xA16081F360e3847006dB660bae1c6d1b2e17eC1A') as Bytes
  // When: Annother mint event is triggered (a day later)
  onTransfer(transferEvent)
  onSync(syncEvent)
  onMint(mintEvent)

  // Then: The previous snapshot should remain unchanged since second mint event occured a day after
  assert.fieldEquals('TokenDaySnapshot', token0SnapshotId, 'liquidity', '15.000000000000000042')
  assert.fieldEquals('TokenDaySnapshot', token1SnapshotId, 'liquidity', '6300.000001')
  assert.fieldEquals('PoolDaySnapshot', poolDaySnapshotId, 'liquidity', '8.999999999999999999')
  assert.fieldEquals('PoolHourSnapshot', poolHourSnapshotId, 'liquidity', '8.999999999999999999')

  let token0SnapshotId2 = getTokenDaySnapshotId(WHITELISTED_TOKEN_ADDRESSES[0], mintEvent.block.timestamp)
  let token1SnapshotId2 = getTokenDaySnapshotId(WHITELISTED_TOKEN_ADDRESSES[1], mintEvent.block.timestamp)
  let poolDaySnapshotId2 = getPoolDaySnapshotId(poolAddress.toHex(), mintEvent.block.timestamp)
  let poolHourSnapshotId2 = getPoolHourSnapshotId(poolAddress.toHex(), mintEvent.block.timestamp)

  // And: The new snapshots have increased liquidity
  assert.fieldEquals('TokenDaySnapshot', token0SnapshotId2, 'liquidity', '16.000000000000000043')
  assert.fieldEquals('TokenDaySnapshot', token1SnapshotId2, 'liquidity', '9300.000002')
  assert.fieldEquals('PoolDaySnapshot', poolDaySnapshotId2, 'liquidity', '12.444444444444444443')
  assert.fieldEquals('PoolHourSnapshot', poolHourSnapshotId2, 'liquidity', '12.444444444444444443')

  mintEvent.block.timestamp = TIMESTAMP3
  mintEvent.transaction.hash = Address.fromString('0xA16081F360e3847006dB660bae1c6d1b2e17eC2C') as Bytes
  transferEvent.transaction.hash = Address.fromString('0xA16081F360e3847006dB660bae1c6d1b2e17eC1B') as Bytes
  // When: Another mint event is triggered (an hour later)
  onTransfer(transferEvent)
  onSync(syncEvent)
  onMint(mintEvent)

  // And: The previous PoolHourSnapshot remains unchanged
  assert.fieldEquals('PoolHourSnapshot', poolHourSnapshotId2, 'liquidity', '12.444444444444444443')
  let poolHourSnapshotId3 = getPoolHourSnapshotId(poolAddress.toHex(), mintEvent.block.timestamp)

  // And: the latest burn event created a new PoolHourSnapshot with updated liquidity
  assert.fieldEquals('PoolHourSnapshot', poolHourSnapshotId3, 'liquidity', '15.888888888888888887')
    // logStore()
  cleanup()
})

test('onBurn creates a Burn object with the expected field values', () => {
  setup()
  let poolLiquidityInt = BigInt.fromString('1000')
  let burnEvent = createBurnEvent(
    poolAddress,
    ADDRESS_ZERO,
    BIGINT_ETH_AMOUNT,
    BIGINT_USD_AMOUNT,
    bob,
    poolLiquidityInt
  )

  let transactionId = burnEvent.transaction.hash.toHex()
  let id = createBurnId(transactionId, BigInt.fromString("0"))
  let transferEvent = createTransferEvent(burnEvent.transaction, poolAddress, ADDRESS_ZERO, BIGINT_ETH_AMOUNT)
  let transferEvent2 = createTransferEvent(burnEvent.transaction, poolAddress, ADDRESS_ZERO, BIGINT_USD_AMOUNT)
  let syncEvent = createSyncEvent(poolAddress, BIGINT_USD_AMOUNT, BIGINT_USD_AMOUNT)

  // When: A burn event is triggered
  onTransfer(transferEvent)
  onTransfer(transferEvent2)
  onSync(syncEvent)
  onBurn(burnEvent)

  // Then: All the burn fields match the expected values
  assert.fieldEquals('Burn', id, 'id', id)
  assert.fieldEquals('Burn', id, 'transaction', transactionId)
  assert.fieldEquals('Burn', id, 'pool', poolAddress.toHex())
  assert.fieldEquals('Burn', id, 'token0', WHITELISTED_TOKEN_ADDRESSES[0])
  assert.fieldEquals('Burn', id, 'token1', WHITELISTED_TOKEN_ADDRESSES[1])
  assert.fieldEquals('Burn', id, 'amount0', ETH_AMOUNT)
  assert.fieldEquals('Burn', id, 'amount1', USD_AMOUNT)
  assert.fieldEquals('Burn', id, 'recipient', burnEvent.params.recipient.toHex())
  assert.fieldEquals('Burn', id, 'sender', burnEvent.params.sender.toHex())
  assert.fieldEquals('Burn', id, 'origin', burnEvent.transaction.from.toHex())
  assert.fieldEquals('Burn', id, 'logIndex', burnEvent.logIndex.toString())

  cleanup()
})

test('Burn, assert KPIs and snapshots', () => {
  setup()
  let ethLiquidity = BigDecimal.fromString('14.000000000000000041')
  let usdLiquidity = BigDecimal.fromString('13300')
  updateTokenKpiLiquidity(ethLiquidity, usdLiquidity)

  let poolLiquidity = '5.55555555555555555'
  updatePoolLiquidity(poolAddress.toHex(), poolLiquidity)

  let poolLiquidityInt = BigInt.fromString('1000')
  let burnEvent = createBurnEvent(
    poolAddress,
    ADDRESS_ZERO,
    BIGINT_ETH_AMOUNT,
    BIGINT_USD_AMOUNT,
    bob,
    poolLiquidityInt
  )

  burnEvent.block.timestamp = TIMESTAMP1

  let transferEvent = createTransferEvent(burnEvent.transaction, poolAddress, ADDRESS_ZERO, BIGINT_ETH_AMOUNT)
  let transferEvent2 = createTransferEvent(burnEvent.transaction, poolAddress, ADDRESS_ZERO, BIGINT_USD_AMOUNT)

  let syncEvent = createSyncEvent(poolAddress, BIGINT_USD_AMOUNT, BIGINT_USD_AMOUNT)

  // When: A burn event is triggered
  onTransfer(transferEvent)
  onTransfer(transferEvent2)
  onSync(syncEvent)
  onBurn(burnEvent)

  // And: the KPIs liquidity are updated
  assert.fieldEquals('TokenKpi', WHITELISTED_TOKEN_ADDRESSES[0], 'liquidity', '13.00000000000000004')
  assert.fieldEquals('TokenKpi', WHITELISTED_TOKEN_ADDRESSES[1], 'liquidity', '10299.999999')
  assert.fieldEquals('ConstantProductPoolKpi', poolAddress.toHex(), 'liquidity', '5.55555555555555455')

  let token0SnapshotId = getTokenDaySnapshotId(WHITELISTED_TOKEN_ADDRESSES[0], burnEvent.block.timestamp)
  let token1SnapshotId = getTokenDaySnapshotId(WHITELISTED_TOKEN_ADDRESSES[1], burnEvent.block.timestamp)
  let poolDaySnapshotId = getPoolDaySnapshotId(poolAddress.toHex(), burnEvent.block.timestamp)
  let poolHourSnapshotId = getPoolHourSnapshotId(poolAddress.toHex(), burnEvent.block.timestamp)

  // And: the Snapshots liquidity is decreased
  assert.fieldEquals('TokenDaySnapshot', token0SnapshotId, 'liquidity', '13.00000000000000004')
  assert.fieldEquals('TokenDaySnapshot', token1SnapshotId, 'liquidity', '10299.999999')
  assert.fieldEquals('PoolDaySnapshot', poolDaySnapshotId, 'liquidity', '5.55555555555555455')
  assert.fieldEquals('PoolHourSnapshot', poolHourSnapshotId, 'liquidity', '5.55555555555555455')

  burnEvent.block.timestamp = TIMESTAMP2
  burnEvent.transaction.hash = Address.fromString('0xA16081F360e3847006dB660bae1c6d1b2e17eC2B') as Bytes
  transferEvent.transaction.hash = Address.fromString('0xA16081F360e3847006dB660bae1c6d1b2e17eC1A') as Bytes
  // When: Another burn event is triggered (a day later)
  onTransfer(transferEvent)
  onTransfer(transferEvent2)
  onSync(syncEvent)
  onBurn(burnEvent)

  // Then: The previous snapshot should remain unchanged since second burn event occured a day after
  assert.fieldEquals('TokenDaySnapshot', token0SnapshotId, 'liquidity', '13.00000000000000004')
  assert.fieldEquals('TokenDaySnapshot', token1SnapshotId, 'liquidity', '10299.999999')
  assert.fieldEquals('PoolDaySnapshot', poolDaySnapshotId, 'liquidity', '5.55555555555555455')
  assert.fieldEquals('PoolHourSnapshot', poolHourSnapshotId, 'liquidity', '5.55555555555555455')

  let token0SnapshotId2 = getTokenDaySnapshotId(WHITELISTED_TOKEN_ADDRESSES[0], burnEvent.block.timestamp)
  let token1SnapshotId2 = getTokenDaySnapshotId(WHITELISTED_TOKEN_ADDRESSES[1], burnEvent.block.timestamp)
  let poolDaySnapshotId2 = getPoolDaySnapshotId(poolAddress.toHex(), burnEvent.block.timestamp)
  let poolHourSnapshotId2 = getPoolHourSnapshotId(poolAddress.toHex(), burnEvent.block.timestamp)

  // And: The new snapshots have decreased liquidity
  assert.fieldEquals('TokenDaySnapshot', token0SnapshotId2, 'liquidity', '12.000000000000000039')
  assert.fieldEquals('TokenDaySnapshot', token1SnapshotId2, 'liquidity', '7299.999998')
  assert.fieldEquals('PoolDaySnapshot', poolDaySnapshotId2, 'liquidity', '5.55555555555555355')
  assert.fieldEquals('PoolHourSnapshot', poolHourSnapshotId2, 'liquidity', '5.55555555555555355')
  
  burnEvent.block.timestamp = TIMESTAMP3
  burnEvent.transaction.hash = Address.fromString('0xA16081F360e3847006dB660bae1c6d1b2e17eC2C') as Bytes
  transferEvent.transaction.hash = Address.fromString('0xA16081F360e3847006dB660bae1c6d1b2e17eC1B') as Bytes
  // When: Another burn event is triggered (an hour later)
  onTransfer(transferEvent)
  onTransfer(transferEvent2)
  onSync(syncEvent)
  onBurn(burnEvent)

  // And: The previous PoolHourSnapshot remains unchanged
  assert.fieldEquals('PoolHourSnapshot', poolHourSnapshotId2, 'liquidity', '5.55555555555555355')
  let poolHourSnapshotId3 = getPoolHourSnapshotId(poolAddress.toHex(), burnEvent.block.timestamp)

  // And: the latest burn event created a new PoolHourSnapshot with updated liquidity
  assert.fieldEquals('PoolHourSnapshot', poolHourSnapshotId3, 'liquidity', '5.55555555555555255')

  cleanup()
})

test('Swap', () => {
  setup()

  let token0Kpi = getTokenKpi(WHITELISTED_TOKEN_ADDRESSES[0])
  let token1Kpi = getTokenKpi(WHITELISTED_TOKEN_ADDRESSES[1])
  token0Kpi.liquidity = BigDecimal.fromString('14.000000000000000041')
  token0Kpi.save()
  token1Kpi.liquidity = BigDecimal.fromString('3300')
  token1Kpi.save()

  let mockEvent = newMockEvent()
  let tokenIn = Address.fromString(WHITELISTED_TOKEN_ADDRESSES[0])
  let tokenOut = Address.fromString(WHITELISTED_TOKEN_ADDRESSES[1])
  let swapEvent = createSwapEvent(poolAddress, bob, tokenIn, tokenOut, BIGINT_ETH_AMOUNT, BIGINT_USD_AMOUNT)


  let transactionId = swapEvent.transaction.hash.toHex()
  let id = createSwapId(transactionId, BigInt.fromString("0"))
  let transferEvent = createTransferEvent(mockEvent.transaction, poolAddress, ADDRESS_ZERO, BIGINT_ETH_AMOUNT)

  onTransfer(transferEvent)
  onSwap(swapEvent)

  assert.fieldEquals('Swap', id, 'id', id)
  assert.fieldEquals('Swap', id, 'transaction', transactionId)
  assert.fieldEquals('Swap', id, 'pool', poolAddress.toHex())
  assert.fieldEquals('Swap', id, 'tokenIn', swapEvent.params.tokenIn.toHex())
  assert.fieldEquals('Swap', id, 'tokenOut', swapEvent.params.tokenOut.toHex())
  assert.fieldEquals('Swap', id, 'amountIn', ETH_AMOUNT)
  assert.fieldEquals('Swap', id, 'amountOut', USD_AMOUNT)
  assert.fieldEquals('Swap', id, 'recipient', swapEvent.params.recipient.toHex())
  assert.fieldEquals('Swap', id, 'origin', swapEvent.transaction.from.toHex())
  assert.fieldEquals('Swap', id, 'logIndex', swapEvent.logIndex.toString())

  assert.fieldEquals('TokenKpi', WHITELISTED_TOKEN_ADDRESSES[0], 'liquidity', token0Kpi.liquidity.toString())
  assert.fieldEquals('TokenKpi', WHITELISTED_TOKEN_ADDRESSES[1], 'liquidity', token1Kpi.liquidity.toString())

  cleanup()
})

function updatePoolLiquidity(pool: string, poolLiquidity: string): void {
  let constantProductPoolKpi = getConstantProductPoolKpi(pool)
  constantProductPoolKpi.liquidity = BigDecimal.fromString(poolLiquidity)
  constantProductPoolKpi.save()
}

function updateTokenKpiLiquidity(liqudity0: BigDecimal, liqudity1: BigDecimal): void {
  let token0Kpi = getTokenKpi(WHITELISTED_TOKEN_ADDRESSES[0])
  let token1Kpi = getTokenKpi(WHITELISTED_TOKEN_ADDRESSES[1])
  token0Kpi.liquidity = liqudity0
  token0Kpi.save()
  token1Kpi.liquidity = liqudity1
  token1Kpi.save()
}

function createDeployData(tokenAddress1: string, tokenAddress2: string, twapEnabled: boolean): Bytes {
  let tupleArray: Array<ethereum.Value> = [
    ethereum.Value.fromAddress(Address.fromString(tokenAddress1)),
    ethereum.Value.fromAddress(Address.fromString(tokenAddress2)),
    ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(25)),
    ethereum.Value.fromBoolean(twapEnabled),
  ]
  return ethereum.encode(ethereum.Value.fromTuple(changetype<ethereum.Tuple>(tupleArray)))!
}
