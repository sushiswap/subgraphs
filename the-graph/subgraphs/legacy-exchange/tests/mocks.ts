import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts'
import { createMockedFunction, log, logStore, newMockEvent } from 'matchstick-as'
import { PairCreated } from '../generated/Factory/Factory'
import { Swap as SwapEvent, Sync as SyncEvent } from '../generated/templates/Pair/Pair'
import {
  STABLE_POOL_ADDRESSES,
  FACTORY_ADDRESS,
  STABLE_TOKEN_ADDRESSES,
  NATIVE_ADDRESS,
} from '../src/constants/addresses'
import { onPairCreated } from '../src/mappings/factory'
import { onSync } from '../src/mappings/pair'

export function createSwapEvent(
  sender: Address,
  amount0In: BigInt,
  amount1In: BigInt,
  amount0Out: BigInt,
  amount1Out: BigInt,
  to: Address
): SwapEvent {
  let mockEvent = newMockEvent()
  let event = new SwapEvent(
    sender,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  )
  
  event.parameters = new Array()
  let senderParam = new ethereum.EventParam('sender', ethereum.Value.fromAddress(sender))
  let amount0Inparam = new ethereum.EventParam('amount0In', ethereum.Value.fromUnsignedBigInt(amount0In))
  let amount1InParam = new ethereum.EventParam('amount1In', ethereum.Value.fromUnsignedBigInt(amount1In))
  let amount0Outparam = new ethereum.EventParam('amount0Out', ethereum.Value.fromUnsignedBigInt(amount0Out))
  let amount1OutParam = new ethereum.EventParam('amount1Out', ethereum.Value.fromUnsignedBigInt(amount1Out))
  let toParam = new ethereum.EventParam('to', ethereum.Value.fromAddress(to))

  event.parameters.push(senderParam)
  event.parameters.push(amount0Inparam)
  event.parameters.push(amount1InParam)
  event.parameters.push(amount0Outparam)
  event.parameters.push(amount1OutParam)
  event.parameters.push(toParam)

  return event
}

export function createSyncEvent(pair: Address, reserve0: BigInt, reserve1: BigInt): SyncEvent {
  let mockEvent = newMockEvent()
  let event = new SyncEvent(
    pair,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  )
  event.parameters = new Array()
  let reserve0Param = new ethereum.EventParam('reserve0', ethereum.Value.fromUnsignedBigInt(reserve0))
  let reserve1Param = new ethereum.EventParam('reserve1', ethereum.Value.fromUnsignedBigInt(reserve1))

  event.parameters.push(reserve0Param)
  event.parameters.push(reserve1Param)

  return event
}

// - event: PairCreated(indexed address,indexed address,address,uint256)
// emit PairCreated(token0, token1, pair, allPairs.length);
export function createPairCreatedEvent(
  factoryAddress: Address,
  token0: Address,
  token1: Address,
  pair: Address
): PairCreated {
  let mockEvent = newMockEvent()
  let event = new PairCreated(
    factoryAddress,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  )
  event.parameters = new Array()
  let token0Param = new ethereum.EventParam('token0', ethereum.Value.fromAddress(token0))
  let token1Param = new ethereum.EventParam('token1', ethereum.Value.fromAddress(token1))
  let pairParam = new ethereum.EventParam('pair', ethereum.Value.fromAddress(pair))

  event.parameters.push(token0Param)
  event.parameters.push(token1Param)
  event.parameters.push(pairParam)

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

export function createStablePools(): string[] {
  if (STABLE_TOKEN_ADDRESSES.length !== STABLE_POOL_ADDRESSES.length) {
    throw new Error('Not able to create stable pools, incorrect amount of pools or stable addresses.')
  }

  const nativeAddress = Address.fromString(NATIVE_ADDRESS)
  const symbols = ['TUSD', 'DAI']
  const tokenNames = ['Tether USD', 'DAI Stablecoin']
  const decimals = [6, 18]

  for (let i = 0; i < STABLE_POOL_ADDRESSES.length; i++) {
    const stablePoolAddress = Address.fromString(STABLE_POOL_ADDRESSES[i])
    const stableTokenAddress = Address.fromString(STABLE_TOKEN_ADDRESSES[i])

    let pairCreatedEvent = createPairCreatedEvent(FACTORY_ADDRESS, stableTokenAddress, nativeAddress, stablePoolAddress)

    getOrCreateTokenMock(stableTokenAddress.toHex(), decimals[i], tokenNames[i], symbols[i])
    getOrCreateTokenMock(nativeAddress.toHex(), 18, 'Wrapped ETH', 'WETH')
    onPairCreated(pairCreatedEvent)
  
    let syncEvent = createSyncEvent(stablePoolAddress, BigInt.fromString("7500000000"), BigInt.fromString("3000000000000000001"))
    onSync(syncEvent)
  }
  return STABLE_POOL_ADDRESSES
}
