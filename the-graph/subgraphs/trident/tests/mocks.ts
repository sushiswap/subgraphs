import { Address, BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts'
import { createMockedFunction, newMockEvent } from 'matchstick-as'
import { AddToWhitelist, DeployPool, RemoveFromWhitelist } from '../generated/MasterDeployer/MasterDeployer'
import { Burn as BurnEvent, Mint as MintEvent, Swap as SwapEvent, Sync as SyncEvent, Transfer as TransferEvent } from '../generated/templates/ConstantProductPool/ConstantProductPool'


export function createAddToWhitelistEvent(factory: Address, ownerAddress: Address): AddToWhitelist {
  let mockEvent = newMockEvent()
  let event = new AddToWhitelist(
    ownerAddress,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  )
  event.parameters = new Array()
  let factoryParam = new ethereum.EventParam('_factory', ethereum.Value.fromAddress(factory))
  event.parameters.push(factoryParam)

  return event
}

export function createDeployPoolEvent(
  pool: Address,
  masterDeployAddress: Address,
  factory: Address,
  deployData: Bytes,
): DeployPool {
  let mockEvent = newMockEvent()
  let event = new DeployPool(
    masterDeployAddress,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  )
  event.parameters = new Array()
  let factoryParam = new ethereum.EventParam('factory', ethereum.Value.fromAddress(factory))
  let poolParam = new ethereum.EventParam('pool', ethereum.Value.fromAddress(pool))
  let deployDataParam = new ethereum.EventParam('deployData', ethereum.Value.fromBytes(deployData))
  event.parameters.push(factoryParam)
  event.parameters.push(poolParam)
  event.parameters.push(deployDataParam)

  return event
}

export function createRemoveWhitelistEvent(factory: Address, ownerAddress: Address): RemoveFromWhitelist {
  let mockEvent = newMockEvent()
  let event = new RemoveFromWhitelist(
    ownerAddress,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  )
  event.parameters = new Array()
  let factoryParam = new ethereum.EventParam('factory', ethereum.Value.fromAddress(factory))
  event.parameters.push(factoryParam)

  return event
}

export function createMintEvent(pool: Address, sender: Address, amount0: number, amount1: number, recipient: Address, liquidity: number): MintEvent {
  let mockEvent = newMockEvent()
  let event = new MintEvent(
    pool,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  )
  event.parameters = new Array()
  let senderParam = new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  let amount0Param = new ethereum.EventParam("amount0", ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(amount0 as i32)))
  let amount1Param = new ethereum.EventParam("amount1", ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(amount1 as i32)))
  let recipientParam = new ethereum.EventParam("recipient", ethereum.Value.fromAddress(recipient))
  let liquidityParam = new ethereum.EventParam("liquidity", ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(liquidity as i32)))

  event.parameters.push(senderParam)
  event.parameters.push(amount0Param)
  event.parameters.push(amount1Param)
  event.parameters.push(recipientParam)
  event.parameters.push(liquidityParam)

  return event
}


export function createBurnEvent(pool: Address, sender: Address, amount0: number, amount1: number, recipient: Address, liquidity: number): BurnEvent {
  let mockEvent = newMockEvent()
  let event = new BurnEvent(
    pool,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  )
  event.parameters = new Array()
  let senderParam = new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  let amount0Param = new ethereum.EventParam("amount0", ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(amount0 as i32)))
  let amount1Param = new ethereum.EventParam("amount1", ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(amount1 as i32)))
  let recipientParam = new ethereum.EventParam("recipient", ethereum.Value.fromAddress(recipient))
  let liquidityParam = new ethereum.EventParam("liquidity", ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(liquidity as i32)))

  event.parameters.push(senderParam)
  event.parameters.push(amount0Param)
  event.parameters.push(amount1Param)
  event.parameters.push(recipientParam)
  event.parameters.push(liquidityParam)

  return event
}


export function createSyncEvent(pool: Address, reserve0: number, reserve1: number): SyncEvent {
  let mockEvent = newMockEvent()
  let event = new SyncEvent(
    pool,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  )
  event.parameters = new Array()
  let reserve0Param = new ethereum.EventParam("reserve0", ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(reserve0 as i32)))
  let reserve1Param = new ethereum.EventParam("reserve1", ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(reserve1 as i32)))

  event.parameters.push(reserve0Param)
  event.parameters.push(reserve1Param)

  return event
}

export function createTransferEvent(transaction: ethereum.Transaction, sender: Address, recipient: Address, amount: number): TransferEvent {
  let mockEvent = newMockEvent()
  let event = new TransferEvent(
    sender,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    transaction,
    mockEvent.parameters
  )
  event.parameters = new Array()

  let senderParam = new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  let recipientParam = new ethereum.EventParam("recipient", ethereum.Value.fromAddress(recipient))
  let amountParam = new ethereum.EventParam("reserve0", ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(amount as i32)))

  event.parameters.push(senderParam)
  event.parameters.push(recipientParam)
  event.parameters.push(amountParam)

  return event
}

export function createSwapEvent(
  pool: Address,
  recipient: Address,
  tokenIn: Address,
  tokenOut: Address,
  amountIn: number,
  amountOut: number
  ): SwapEvent {
  let mockEvent = newMockEvent()
  let event = new SwapEvent(
    pool,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  )
  event.parameters = new Array()
  let recipientParam = new ethereum.EventParam("recipient", ethereum.Value.fromAddress(recipient))
  let tokenInParam = new ethereum.EventParam("tokenIn", ethereum.Value.fromAddress(tokenIn))
  let tokenOutParam = new ethereum.EventParam("tokenOut", ethereum.Value.fromAddress(tokenOut))
  let amountInParam = new ethereum.EventParam("amountIn", ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(amountIn as i32)))
  let amountOutParam = new ethereum.EventParam("amountOut", ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(amountOut as i32)))

  event.parameters.push(recipientParam)
  event.parameters.push(tokenInParam)
  event.parameters.push(tokenOutParam)
  event.parameters.push(amountInParam)
  event.parameters.push(amountOutParam)

  return event
}


export function getOrCreateTokenMock(contractAddress: string, decimals: number, name: string, symbol: string): void {
createMockedFunction(Address.fromString(contractAddress), 'decimals', 'decimals():(uint8)')
.returns([
  ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(decimals as i32))
])
createMockedFunction(Address.fromString(contractAddress), 'name', 'name():(string)')
.returns([
  ethereum.Value.fromString(name)
])
createMockedFunction(Address.fromString(contractAddress), 'symbol', 'symbol():(string)')
.returns([
  ethereum.Value.fromString(symbol)
])
}