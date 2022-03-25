import { Address, BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts'
import { createMockedFunction, newMockEvent } from 'matchstick-as'


export function createDeployEvent(masterContract: Address, data: Bytes, cloneAddress: Address): void {
  let mockEvent = newMockEvent()
  // let event = new DeployEvent(
  //   mockEvent.address,
  //   mockEvent.logIndex,
  //   mockEvent.transactionLogIndex,
  //   mockEvent.logType,
  //   mockEvent.block,
  //   mockEvent.transaction,
  //   mockEvent.parameters
  // )

  // event.parameters = new Array()
  // let masterContractParam = new ethereum.EventParam('masterContract', ethereum.Value.fromAddress(masterContract))
  // let dataParam = new ethereum.EventParam('masterContract', ethereum.Value.fromBytes(data))
  // let cloneAddressParam = new ethereum.EventParam('masterContract', ethereum.Value.fromAddress(cloneAddress))
  // event.parameters.push(masterContractParam)
  // event.parameters.push(dataParam)
  // event.parameters.push(cloneAddressParam)

  // return event
}

export function createTokenMock(contractAddress: string, decimals: BigInt, name: string, symbol: string): void {
  createMockedFunction(Address.fromString(contractAddress), 'decimals', 'decimals():(uint8)').returns([
    ethereum.Value.fromUnsignedBigInt(decimals),
  ])
  createMockedFunction(Address.fromString(contractAddress), 'name', 'name():(string)').returns([
    ethereum.Value.fromString(name),
  ])
  createMockedFunction(Address.fromString(contractAddress), 'symbol', 'symbol():(string)').returns([
    ethereum.Value.fromString(symbol),
  ])
}
