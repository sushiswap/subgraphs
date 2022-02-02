import { Address, BigDecimal, BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts'
import { assert, newMockEvent, test } from 'matchstick-as/assembly/index'
import { clearStore } from 'matchstick-as/assembly/store'
import { ConstantProductPoolFactory, MasterDeployer } from '../generated/schema'
import {
  ADDRESS_ZERO,
  CONSTANT_PRODUCT_POOL_FACTORY_ADDRESS,
  MASTER_DEPLOYER_ADDRESS,
  WHITELISTED_TOKEN_ADDRESSES,
} from '../src/constants/addresses'
import { onBurn, onMint, onSwap, onTransfer } from '../src/mappings/constant-product-pool'
import { onAddToWhitelist, onDeployPool } from '../src/mappings/master-deployer'
import {
  createAddToWhitelistEvent,
  createBurnEvent,
  createDeployPoolEvent,
  createMintEvent,
  createSwapEvent,
  createTransferEvent,
  getOrCreateTokenMock,
} from './mocks'

const BIGINT_ZERO = BigInt.fromI32(0)
const BIGDECIMAL_ZERO = new BigDecimal(BIGINT_ZERO)
const BENTOBOX_ADDRESS = Address.fromString('0xc381a85ed7C7448Da073b7d6C9d4cBf1Cbf576f0')
let poolAddress = Address.fromString('0x0000000000000000000000000000000000000420')
let constantProductPoolFactoryAddress = CONSTANT_PRODUCT_POOL_FACTORY_ADDRESS.toHexString()
let constantProductPoolFactory: ConstantProductPoolFactory
let masterDeployerOwner = Address.fromString('0x0000000000000000000000000000000000001337')
let masterDeployer: MasterDeployer
let alice = Address.fromString('0x0000000000000000000000000000000000080085')
let bob = Address.fromString('0x0000000000000000000000000000000000000b0b')

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
  getOrCreateTokenMock(WHITELISTED_TOKEN_ADDRESSES[1], 18, 'USD Coin', 'USDC')

  onDeployPool(deployPoolEvent)
}

function cleanup(): void {
  clearStore()
}

test('Initial transfer is ignored', () => {
  setup()

  let mockEvent = newMockEvent()
  let transferEvent = createTransferEvent(mockEvent.transaction, poolAddress, ADDRESS_ZERO, 1000)
  let transactionId = transferEvent.transaction.hash.toHex()
  onTransfer(transferEvent)

  assert.notInStore('Transaction', transactionId)

  cleanup()
})

test('Transaction', () => {
  setup()

  let burnEvent = createBurnEvent(poolAddress, ADDRESS_ZERO, 100000000, 100000000, bob, 10000)
  let transactionId = burnEvent.transaction.hash.toHex()
  let transferEvent = createTransferEvent(burnEvent.transaction, poolAddress, ADDRESS_ZERO, 1000)

  onTransfer(transferEvent)
  onBurn(burnEvent)

  assert.fieldEquals('Transaction', transactionId, 'id', transactionId)
  assert.fieldEquals('Transaction', transactionId, 'gasLimit', transferEvent.transaction.gasLimit.toString())
  assert.fieldEquals('Transaction', transactionId, 'gasPrice', transferEvent.transaction.gasPrice.toString())
  assert.fieldEquals('Transaction', transactionId, 'block', transferEvent.block.number.toString())
  assert.fieldEquals('Transaction', transactionId, 'timestamp', transferEvent.block.timestamp.toString())

  cleanup()
})

test('Burn', () => {
  setup()

  let burnEvent = createBurnEvent(poolAddress, ADDRESS_ZERO, 100, 1000, bob, 10000)
  let id = 'constant-product:' + burnEvent.transaction.hash.toHex() + ':0'
  let transactionId = burnEvent.transaction.hash.toHex()
  let transferEvent = createTransferEvent(burnEvent.transaction, poolAddress, ADDRESS_ZERO, 1000)

  onTransfer(transferEvent)
  onBurn(burnEvent)

  assert.fieldEquals('Burn', id, 'id', id)
  assert.fieldEquals('Burn', id, 'transaction', transactionId)
  assert.fieldEquals('Burn', id, 'pool', poolAddress.toHex())
  assert.fieldEquals('Burn', id, 'token0', WHITELISTED_TOKEN_ADDRESSES[0])
  assert.fieldEquals('Burn', id, 'token1', WHITELISTED_TOKEN_ADDRESSES[1])
  assert.fieldEquals('Burn', id, 'amount0', '0.0000000000000001')
  assert.fieldEquals('Burn', id, 'amount1', '0.000000000000001')
  assert.fieldEquals('Burn', id, 'recipient', burnEvent.params.recipient.toHex())
  assert.fieldEquals('Burn', id, 'sender', burnEvent.params.sender.toHex())
  assert.fieldEquals('Burn', id, 'origin', burnEvent.transaction.from.toHex())
  assert.fieldEquals('Burn', id, 'logIndex', burnEvent.logIndex.toString())

  cleanup()
})

test('Swap', () => {
  setup()

  let mockEvent = newMockEvent()
  let tokenIn = Address.fromString(WHITELISTED_TOKEN_ADDRESSES[0])
  let tokenOut = Address.fromString(WHITELISTED_TOKEN_ADDRESSES[1])
  let amountIn = 50000
  let amountOut = 15000000
  let swapEvent = createSwapEvent(poolAddress, bob, tokenIn, tokenOut, amountIn, amountOut)

  let id = 'constant-product:' + swapEvent.transaction.hash.toHex() + ':1'
  let transactionId = swapEvent.transaction.hash.toHex()
  let transferEvent = createTransferEvent(mockEvent.transaction, poolAddress, ADDRESS_ZERO, 1000)

  onTransfer(transferEvent)
  onSwap(swapEvent)

  assert.fieldEquals('Swap', id, 'id', id)
  assert.fieldEquals('Swap', id, 'transaction', transactionId)
  assert.fieldEquals('Swap', id, 'pool', poolAddress.toHex())
  assert.fieldEquals('Swap', id, 'tokenIn', swapEvent.params.tokenIn.toHex())
  assert.fieldEquals('Swap', id, 'tokenOut', swapEvent.params.tokenOut.toHex())
  assert.fieldEquals('Swap', id, 'amountIn', '0.00000000000005')
  assert.fieldEquals('Swap', id, 'amountOut', '0.000000000015')
  assert.fieldEquals('Swap', id, 'recipient', swapEvent.params.recipient.toHex())
  assert.fieldEquals('Swap', id, 'origin', swapEvent.transaction.from.toHex())
  assert.fieldEquals('Swap', id, 'logIndex', swapEvent.logIndex.toString())

  cleanup()
})

test('Mint', () => {
  setup()
  let mintEvent = createMintEvent(poolAddress, ADDRESS_ZERO, 1, 2222, bob, 1)
  let transferEvent = createTransferEvent(mintEvent.transaction, poolAddress, bob, 1)
  onTransfer(transferEvent)
  onMint(mintEvent)

  let transactionId = mintEvent.transaction.hash.toHex()
  let id = 'constant-product:' + transactionId + ':0'
  assert.fieldEquals('Mint', id, 'transaction', transactionId)
  assert.fieldEquals('Mint', id, 'pool', poolAddress.toHex())
  assert.fieldEquals('Mint', id, 'token0', WHITELISTED_TOKEN_ADDRESSES[0])
  assert.fieldEquals('Mint', id, 'token1', WHITELISTED_TOKEN_ADDRESSES[1])
  assert.fieldEquals('Mint', id, 'amount0', '0.000000000000000001')
  assert.fieldEquals('Mint', id, 'amount1', '0.000000000000002222')
  assert.fieldEquals('Mint', id, 'recipient', mintEvent.params.recipient.toHex())
  assert.fieldEquals('Mint', id, 'origin', mintEvent.transaction.from.toHex())
  assert.fieldEquals('Mint', id, 'sender', mintEvent.params.sender.toHex())
  assert.fieldEquals('Mint', id, 'logIndex', mintEvent.logIndex.toString())

  cleanup()
})

test('When minting a token which already exists in another pools, the CPP KPIs remain and the recipient liquidity is updated', () => {
  setup()
  let poolAddress2 = Address.fromString('0x0000000000000000000000000000000000001001')
  let deployData = createDeployData(WHITELISTED_TOKEN_ADDRESSES[0], WHITELISTED_TOKEN_ADDRESSES[2], false)
  let deployPoolEvent = createDeployPoolEvent(
    poolAddress2,
    MASTER_DEPLOYER_ADDRESS,
    CONSTANT_PRODUCT_POOL_FACTORY_ADDRESS,
    deployData
  )
  getOrCreateTokenMock(WHITELISTED_TOKEN_ADDRESSES[0], 18, 'Wrapped Ether', 'WETH')
  getOrCreateTokenMock(WHITELISTED_TOKEN_ADDRESSES[2], 18, 'Tether USD', 'USDT')
  onDeployPool(deployPoolEvent)

  assert.fieldEquals('ConstantProductPoolKpi', poolAddress.toHex(), 'liquidity', '0')

  let mintEvent = createMintEvent(poolAddress, ADDRESS_ZERO, 1, 2222, bob, 1)
  let transferEvent = createTransferEvent(mintEvent.transaction, poolAddress, bob, 2222)

  let recipientId = poolAddress.toHex().concat(':').concat(bob.toHex())
  onTransfer(transferEvent)
  onMint(mintEvent)

  assert.fieldEquals('ConstantProductPoolKpi', poolAddress.toHex(), 'liquidity', '0.000000000000000001')

  assert.fieldEquals('LiquidityPosition', recipientId, 'balance', '0.000000000000002222')

  // logStore()
  // log.debug('before tokenkpi assertion: ', [])
  // assert.fieldEquals('TokenKpi', WHITELISTED_TOKEN_ADDRESSES[0], 'liquidity', '0.0000000001')
  // assert.fieldEquals('TokenKpi', WHITELISTED_TOKEN_ADDRESSES[1], 'liquidity', '0.0000000001')
  // assert.fieldEquals('TokenKpi', WHITELISTED_TOKEN_ADDRESSES[2], 'liquidity', '0.000000001')

  let mintEvent2 = createMintEvent(poolAddress2, ADDRESS_ZERO, 1, 2222, alice, 1)
  let transferEvent2 = createTransferEvent(mintEvent2.transaction, poolAddress, bob, 1)
  onTransfer(transferEvent2)
  onMint(mintEvent2)
  // token is used in two pools, should be doubled?
  // assert.fieldEquals('TokenKpi', WHITELISTED_TOKEN_ADDRESSES[0], 'liquidity', '0.000000002')

  assert.fieldEquals('ConstantProductPoolKpi', poolAddress2.toHex(), 'liquidity', '0.000000000000000001')
  assert.fieldEquals('ConstantProductPoolKpi', poolAddress.toHex(), 'liquidity', '0.000000000000000001')
  assert.fieldEquals('LiquidityPosition', recipientId, 'balance', '0.000000000000002223')

  cleanup()
})

test('Snapshots are updated after mint, burn and swap', () => {
  setup()

  let mintEvent = createMintEvent(poolAddress, ADDRESS_ZERO, 1, 2222, bob, 1)
  let mintTransferEvent = createTransferEvent(mintEvent.transaction, poolAddress, bob, 100)

  let burnEvent = createBurnEvent(poolAddress, ADDRESS_ZERO, 1, 100, bob, 1000)
  let burnTransferEvent = createTransferEvent(burnEvent.transaction, poolAddress, ADDRESS_ZERO, 100)

  let tokenIn = Address.fromString(WHITELISTED_TOKEN_ADDRESSES[0])
  let tokenOut = Address.fromString(WHITELISTED_TOKEN_ADDRESSES[1])
  let amountIn = 50000
  let amountOut = 15000000
  let swapEvent = createSwapEvent(poolAddress, bob, tokenIn, tokenOut, amountIn, amountOut)
  let swapTransferEvent = createTransferEvent(swapEvent.transaction, poolAddress, ADDRESS_ZERO, amountOut)

  onTransfer(mintTransferEvent)
  onMint(mintEvent)

  let tokenSnapshotId = WHITELISTED_TOKEN_ADDRESSES[1].concat('-0')
  let poolSnapshotId = poolAddress.toHex().concat('-0')

  assert.fieldEquals('TokenDaySnapshot', tokenSnapshotId, 'liquidity', '0.000000000000002222')
  assert.fieldEquals('PoolDaySnapshot', poolSnapshotId, 'liquidity', '0.000000000000000001')

  // onTransfer(swapTransferEvent)
  // onSwap(swapEvent)

  // assert.fieldEquals('TokenDaySnapshot', tokenSnapshotId, 'liquidity', '?')
  // assert.fieldEquals('PoolDaySnapshot', poolSnapshotId, 'liquidity', '?')

  // onTransfer(burnTransferEvent)
  // onBurn(burnEvent)

  // assert.fieldEquals('TokenDaySnapshot', tokenSnapshotId, 'liquidity', '?')
  // assert.fieldEquals('PoolDaySnapshot', poolSnapshotId, 'liquidity', '?')

  cleanup()
})

// test('Syncing', () => {
//   setup()
//   let syncEvent = createSyncEvent(poolAddress, 100000000, 100000000)
//   onSync(syncEvent)

//   // let id = 'constant-product:' + syncEvent.transaction.hash.toHex() + ':0'
//   // logStore()
//   // assert.fieldEquals('Sync', id, 'id', id)
//   cleanup()
// })

function createDeployData(tokenAddress1: string, tokenAddress2: string, twapEnabled: boolean): Bytes {
  let tupleArray: Array<ethereum.Value> = [
    ethereum.Value.fromAddress(Address.fromString(tokenAddress1)),
    ethereum.Value.fromAddress(Address.fromString(tokenAddress2)),
    ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(25)),
    ethereum.Value.fromBoolean(twapEnabled),
  ]
  return ethereum.encode(ethereum.Value.fromTuple(changetype<ethereum.Tuple>(tupleArray)))!
}
