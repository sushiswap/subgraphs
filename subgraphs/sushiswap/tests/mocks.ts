import { Address, BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts'
import { createMockedFunction, newMockEvent } from 'matchstick-as'
import {
    Burn as BurnEvent,
    Mint as MintEvent,
    Swap as SwapEvent,
    Sync as SyncEvent,
    Transfer as TransferEvent
} from '../generated/templates/Pair/Pair'
import { PairCreated } from '../generated/Factory/Factory'


export function createMintEvent(
  pool: Address,
  sender: Address,
  amount0: BigInt,
  amount1: BigInt,
  recipient: Address,
  liquidity: BigInt
): MintEvent {
  let mockEvent = newMockEvent()
  let event = new MintEvent(
    pool,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters,
    mockEvent.receipt
  )
  event.parameters = new Array()
  let senderParam = new ethereum.EventParam('sender', ethereum.Value.fromAddress(sender))
  let amount0Param = new ethereum.EventParam('amount0', ethereum.Value.fromUnsignedBigInt(amount0))
  let amount1Param = new ethereum.EventParam('amount1', ethereum.Value.fromUnsignedBigInt(amount1))
  let recipientParam = new ethereum.EventParam('recipient', ethereum.Value.fromAddress(recipient))
  let liquidityParam = new ethereum.EventParam('liquidity', ethereum.Value.fromUnsignedBigInt(liquidity))

  event.parameters.push(senderParam)
  event.parameters.push(amount0Param)
  event.parameters.push(amount1Param)
  event.parameters.push(recipientParam)
  event.parameters.push(liquidityParam)

  return event
}

export function createBurnEvent(
  pool: Address,
  sender: Address,
  amount0: BigInt,
  amount1: BigInt,
  recipient: Address,
  liquidity: BigInt
): BurnEvent {
  let mockEvent = newMockEvent()
  let event = new BurnEvent(
    pool,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters,
    mockEvent.receipt
  )
  event.parameters = new Array()
  let senderParam = new ethereum.EventParam('sender', ethereum.Value.fromAddress(sender))
  let amount0Param = new ethereum.EventParam('amount0', ethereum.Value.fromUnsignedBigInt(amount0))
  let amount1Param = new ethereum.EventParam('amount1', ethereum.Value.fromUnsignedBigInt(amount1))
  let recipientParam = new ethereum.EventParam('recipient', ethereum.Value.fromAddress(recipient))
  let liquidityParam = new ethereum.EventParam('liquidity', ethereum.Value.fromUnsignedBigInt(liquidity))

  event.parameters.push(senderParam)
  event.parameters.push(amount0Param)
  event.parameters.push(amount1Param)
  event.parameters.push(recipientParam)
  event.parameters.push(liquidityParam)

  return event
}

export function createSyncEvent(txHash: Bytes, blockNumber: BigInt, pair: Address, reserve0: BigInt, reserve1: BigInt): SyncEvent {
  let mockEvent = newMockEvent()
  let event = new SyncEvent(
    pair,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters,
    mockEvent.receipt
  )
  event.block.number = blockNumber
  event.transaction.hash = txHash
  event.parameters = new Array()
  let reserve0Param = new ethereum.EventParam('reserve0', ethereum.Value.fromUnsignedBigInt(reserve0))
  let reserve1Param = new ethereum.EventParam('reserve1', ethereum.Value.fromUnsignedBigInt(reserve1))

  event.parameters.push(reserve0Param)
  event.parameters.push(reserve1Param)

  return event
}

export function createTransferEvent(
  txHash: Bytes,
  pair: Address,
  blockNumber: BigInt,
  from: Address,
  to: Address,
  value: BigInt
): TransferEvent {
  let mockEvent = newMockEvent()

  let event = new TransferEvent(
    pair,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters,
    mockEvent.receipt
  )
  event.parameters = new Array()
  event.block.number = blockNumber
  event.transaction.hash = txHash

  let fromParam = new ethereum.EventParam('from', ethereum.Value.fromAddress(from))
  let toParam = new ethereum.EventParam('to', ethereum.Value.fromAddress(to))
  let valueParam = new ethereum.EventParam('value', ethereum.Value.fromUnsignedBigInt(value))

  event.parameters.push(fromParam)
  event.parameters.push(toParam)
  event.parameters.push(valueParam)

  return event
}

export function createSwapEvent(
  txHash: Bytes,
  blockNumber: BigInt,
  pair: Address,
  sender: Address,
  amount0In: BigInt,
  amount1In: BigInt,
  amount0Out: BigInt,
  amount1Out: BigInt,
  to: Address,
): SwapEvent {
  let mockEvent = newMockEvent()
  let event = new SwapEvent(
    pair,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters,
    mockEvent.receipt
  )
  event.block.number = blockNumber
  event.transaction.hash = txHash
  event.parameters = new Array()
  let senderParam = new ethereum.EventParam('sender', ethereum.Value.fromAddress(sender))
  let amount0InParam = new ethereum.EventParam('amount0In', ethereum.Value.fromUnsignedBigInt(amount0In))
  let amount1InParam = new ethereum.EventParam('amount1In', ethereum.Value.fromUnsignedBigInt(amount1In))
  let amount0OutParam = new ethereum.EventParam('amount0Out', ethereum.Value.fromUnsignedBigInt(amount0Out))
  let amount1OutParam = new ethereum.EventParam('amount1Out', ethereum.Value.fromUnsignedBigInt(amount1Out))
  let toParam = new ethereum.EventParam('to', ethereum.Value.fromAddress(to))

  event.parameters.push(senderParam)
  event.parameters.push(amount0InParam)
  event.parameters.push(amount1InParam)
  event.parameters.push(amount0OutParam)
  event.parameters.push(amount1OutParam)
  event.parameters.push(toParam)

  return event
}


export function createPairEvent(
  token0: Address,
  token1: Address,
  pair: Address,
): PairCreated {
  let mockEvent = newMockEvent()
  let event = new PairCreated(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters,
    mockEvent.receipt
  )
  event.parameters = new Array()
  let pairParam = new ethereum.EventParam('pair', ethereum.Value.fromAddress(pair))
  let token0Param = new ethereum.EventParam('token0', ethereum.Value.fromAddress(token0))
  let token1Param = new ethereum.EventParam('token1', ethereum.Value.fromAddress(token1))
  let param3 = new ethereum.EventParam('param3', ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(0)))

  event.parameters.push(token0Param)
  event.parameters.push(token1Param)
  event.parameters.push(pairParam)
  event.parameters.push(param3)
  return event
}


export function getOrCreateTokenMock(contractAddress: string, decimals: i32, name: string, symbol: string): void {
  createMockedFunction(Address.fromString(contractAddress), 'decimals', 'decimals():(uint8)').returns([
    ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(decimals)),
  ])
  createMockedFunction(Address.fromString(contractAddress), 'name', 'name():(string)').returns([
    ethereum.Value.fromString(name),
  ])
  createMockedFunction(Address.fromString(contractAddress), 'symbol', 'symbol():(string)').returns([
    ethereum.Value.fromString(symbol),
  ])
}