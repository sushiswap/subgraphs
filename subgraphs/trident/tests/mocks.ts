import { Address, BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts'
import { createMockedFunction, newMockEvent } from 'matchstick-as'
import { DeployPool } from '../generated/MasterDeployer/MasterDeployer'
import {
    Sync as SyncEvent
} from '../generated/templates/ConstantProductPool/ConstantProductPool'
import { BENTOBOX_ADDRESS } from '../src/constants'


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



export function createPairEvent(
    factory: Address,
    pool: Address,
    deployData: Bytes,
): DeployPool {
    let mockEvent = newMockEvent()
    let event = new DeployPool(
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
    let factoryParam = new ethereum.EventParam('factory', ethereum.Value.fromAddress(factory))
    let poolparam = new ethereum.EventParam('pool', ethereum.Value.fromAddress(pool))
    let deployDataParam = new ethereum.EventParam('deployData', ethereum.Value.fromBytes(deployData))

    event.parameters.push(factoryParam)
    event.parameters.push(poolparam)
    event.parameters.push(deployDataParam)
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



export function getOrCreateRebaseMock(tokenAddress: Address, base: BigInt, elastic: BigInt): void {
    createMockedFunction(BENTOBOX_ADDRESS, 'totals', 'totals(address):(uint128,uint128)')
        .withArgs([ethereum.Value.fromAddress(tokenAddress)])
        .returns([
            ethereum.Value.fromUnsignedBigInt(base),
            ethereum.Value.fromUnsignedBigInt(elastic),
        ])
}

