import { Address, BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts'
import { createMockedFunction, newMockEvent } from 'matchstick-as'
import {
  LogDeploy as DeployEvent,
  LogDeposit as DepositEvent,
  LogFlashLoan as FlashLoanEvent,
  LogSetMasterContractApproval as SetMasterContractApprovalEvent,
  LogStrategyDivest as StrategyDivestEvent,
  LogStrategyInvest as StrategyInvestEvent,
  LogStrategyLoss as StrategyLossEvent,
  LogStrategyProfit as StrategyProfitEvent,
  LogWhiteListMasterContract as WhiteListMasterContractEvent,
  LogWithdraw as WithdrawEvent,
  LogTransfer as TransferEvent,
  LogStrategySet as SetStrategyEvent,
  LogRegisterProtocol as RegisterProtocolEvent,
  LogStrategyTargetPercentage as TargetPercentageEvent,
} from '../generated/BentoBox/BentoBox'

const BENTOBOX_ADDRESS = Address.fromString("0xc381a85ed7C7448Da073b7d6C9d4cBf1Cbf576f0")

export function createDeployEvent(masterContract: Address, data: Bytes, cloneAddress: Address): DeployEvent {
  let mockEvent = newMockEvent()
  let event = new DeployEvent(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  )

  event.parameters = new Array()
  let masterContractParam = new ethereum.EventParam('masterContract', ethereum.Value.fromAddress(masterContract))
  let dataParam = new ethereum.EventParam('masterContract', ethereum.Value.fromBytes(data))
  let cloneAddressParam = new ethereum.EventParam('masterContract', ethereum.Value.fromAddress(cloneAddress))
  event.parameters.push(masterContractParam)
  event.parameters.push(dataParam)
  event.parameters.push(cloneAddressParam)

  return event
}

export function createWhitelistMasterContractEvent(
  masterContract: Address,
  approved: boolean
): WhiteListMasterContractEvent {
  let mockEvent = newMockEvent()
  let event = new WhiteListMasterContractEvent(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  )

  event.parameters = new Array()
  let masterContractParam = new ethereum.EventParam('masterContract', ethereum.Value.fromAddress(masterContract))
  let approvedParam = new ethereum.EventParam('approved', ethereum.Value.fromBoolean(approved))
  event.parameters.push(masterContractParam)
  event.parameters.push(approvedParam)

  return event
}

export function createMasterContractApprovalEvent(
  masterContract: Address,
  user: Address,
  approved: boolean
): SetMasterContractApprovalEvent {
  let mockEvent = newMockEvent()
  let event = new SetMasterContractApprovalEvent(
    BENTOBOX_ADDRESS,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  )

  event.parameters = new Array()
  let masterContractParam = new ethereum.EventParam('masterContract', ethereum.Value.fromAddress(masterContract))
  let userParam = new ethereum.EventParam('user', ethereum.Value.fromAddress(user))
  let approvedParam = new ethereum.EventParam('approved', ethereum.Value.fromBoolean(approved))
  event.parameters.push(masterContractParam)
  event.parameters.push(userParam)
  event.parameters.push(approvedParam)

  return event
}

export function createDepositEvent(
  token: Address,
  from: Address,
  to: Address,
  share: BigInt,
  amount: BigInt
): DepositEvent {
  let mockEvent = newMockEvent()
  let event = new DepositEvent(
    BENTOBOX_ADDRESS,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  )

  event.parameters = new Array()
  let tokenParam = new ethereum.EventParam('token', ethereum.Value.fromAddress(token))
  let fromParam = new ethereum.EventParam('from', ethereum.Value.fromAddress(from))
  let toParam = new ethereum.EventParam('to', ethereum.Value.fromAddress(to))
  let shareParam = new ethereum.EventParam('share', ethereum.Value.fromUnsignedBigInt(share))
  let amountParam = new ethereum.EventParam('amount', ethereum.Value.fromUnsignedBigInt(amount))
  event.parameters.push(tokenParam)
  event.parameters.push(fromParam)
  event.parameters.push(toParam)
  event.parameters.push(shareParam)
  event.parameters.push(amountParam)

  return event
}

export function createWithdrawEvent(
  token: Address,
  from: Address,
  to: Address,
  share: BigInt,
  amount: BigInt
): WithdrawEvent {
  let mockEvent = newMockEvent()
  let event = new WithdrawEvent(
    BENTOBOX_ADDRESS,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  )

  event.parameters = new Array()
  let tokenParam = new ethereum.EventParam('token', ethereum.Value.fromAddress(token))
  let fromParam = new ethereum.EventParam('from', ethereum.Value.fromAddress(from))
  let toParam = new ethereum.EventParam('to', ethereum.Value.fromAddress(to))
  let shareParam = new ethereum.EventParam('share', ethereum.Value.fromUnsignedBigInt(share))
  let amountParam = new ethereum.EventParam('amount', ethereum.Value.fromUnsignedBigInt(amount))
  event.parameters.push(tokenParam)
  event.parameters.push(fromParam)
  event.parameters.push(toParam)
  event.parameters.push(shareParam)
  event.parameters.push(amountParam)

  return event
}

export function createFlashLoanEvent(
  borrower: Address,
  token: Address,
  amount: BigInt,
  feeAmount: BigInt,
  reciever: Address
): FlashLoanEvent {
  let mockEvent = newMockEvent()
  let event = new FlashLoanEvent(
    BENTOBOX_ADDRESS,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  )

  event.parameters = new Array()
  let borrowerParam = new ethereum.EventParam('borrower', ethereum.Value.fromAddress(borrower))
  let tokenParam = new ethereum.EventParam('token', ethereum.Value.fromAddress(token))
  let amountParam = new ethereum.EventParam('amount', ethereum.Value.fromUnsignedBigInt(amount))
  let feeAmountParam = new ethereum.EventParam('feeAmount', ethereum.Value.fromUnsignedBigInt(feeAmount))
  let recieverParam = new ethereum.EventParam('reciever', ethereum.Value.fromAddress(reciever))
  event.parameters.push(borrowerParam)
  event.parameters.push(tokenParam)
  event.parameters.push(amountParam)
  event.parameters.push(feeAmountParam)
  event.parameters.push(recieverParam)

  return event
}

export function createStrategyProfitEvent(token: Address, amount: BigInt): StrategyProfitEvent {
  let mockEvent = newMockEvent()
  let event = new StrategyProfitEvent(
    BENTOBOX_ADDRESS,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  )

  event.parameters = new Array()
  let tokenParam = new ethereum.EventParam('token', ethereum.Value.fromAddress(token))
  let amountParam = new ethereum.EventParam('amount', ethereum.Value.fromUnsignedBigInt(amount))
  event.parameters.push(tokenParam)
  event.parameters.push(amountParam)

  return event
}

export function createStrategyLossEvent(token: Address, amount: BigInt): StrategyLossEvent {
  let mockEvent = newMockEvent()
  let event = new StrategyLossEvent(
    BENTOBOX_ADDRESS,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  )

  event.parameters = new Array()
  let tokenParam = new ethereum.EventParam('token', ethereum.Value.fromAddress(token))
  let amountParam = new ethereum.EventParam('amount', ethereum.Value.fromUnsignedBigInt(amount))
  event.parameters.push(tokenParam)
  event.parameters.push(amountParam)

  return event
}

export function createStrategyDivestEvent(token: Address, amount: BigInt): StrategyDivestEvent {
  let mockEvent = newMockEvent()
  let event = new StrategyDivestEvent(
    BENTOBOX_ADDRESS,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  )

  event.parameters = new Array()
  let tokenParam = new ethereum.EventParam('token', ethereum.Value.fromAddress(token))
  let amountParam = new ethereum.EventParam('amount', ethereum.Value.fromUnsignedBigInt(amount))
  event.parameters.push(tokenParam)
  event.parameters.push(amountParam)

  return event
}

export function createStrategyInvestEvent(token: Address, amount: BigInt): StrategyInvestEvent {
  let mockEvent = newMockEvent()
  let event = new StrategyInvestEvent(
    BENTOBOX_ADDRESS,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  )

  event.parameters = new Array()
  let tokenParam = new ethereum.EventParam('token', ethereum.Value.fromAddress(token))
  let amountParam = new ethereum.EventParam('amount', ethereum.Value.fromUnsignedBigInt(amount))
  event.parameters.push(tokenParam)
  event.parameters.push(amountParam)

  return event
}

export function createTransferEvent(
  token: Address,
  from: Address,
  to: Address,
  share: BigInt,
): TransferEvent {
  let mockEvent = newMockEvent()
  let event = new TransferEvent(
    BENTOBOX_ADDRESS,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  )

  event.parameters = new Array()
  let tokenParam = new ethereum.EventParam('token', ethereum.Value.fromAddress(token))
  let fromParam = new ethereum.EventParam('from', ethereum.Value.fromAddress(from))
  let toParam = new ethereum.EventParam('to', ethereum.Value.fromAddress(to))
  let shareAmount = new ethereum.EventParam('feeAmount', ethereum.Value.fromUnsignedBigInt(share))
  event.parameters.push(tokenParam)
  event.parameters.push(fromParam)
  event.parameters.push(toParam)
  event.parameters.push(shareAmount)

  return event
}

export function createSetStrategyEvent(
  token: Address,
  strategy: Address,
): SetStrategyEvent {
  let mockEvent = newMockEvent()
  let event = new SetStrategyEvent(
    BENTOBOX_ADDRESS,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  )

  event.parameters = new Array()
  let tokenParam = new ethereum.EventParam('token', ethereum.Value.fromAddress(token))
  let strategyParam = new ethereum.EventParam('strategy', ethereum.Value.fromAddress(strategy))
  event.parameters.push(tokenParam)
  event.parameters.push(strategyParam)

  return event
}

export function createRegisterProtocolEvent(
  protocol: Address
): RegisterProtocolEvent {
  let mockEvent = newMockEvent()
  let event = new RegisterProtocolEvent(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  )

  event.parameters = new Array()
  let protocolParam = new ethereum.EventParam('protocol', ethereum.Value.fromAddress(protocol))
  event.parameters.push(protocolParam)

  return event
}

export function createTargetPercentageEvent(
  token: Address,
  targetPercentage: BigInt
): TargetPercentageEvent {
  let mockEvent = newMockEvent()
  let event = new TargetPercentageEvent(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  )

  event.parameters = new Array()
  let tokenParam = new ethereum.EventParam('token', ethereum.Value.fromAddress(token))
  let targetPercentageParam = new ethereum.EventParam('targetPercentage', ethereum.Value.fromUnsignedBigInt(targetPercentage))
  event.parameters.push(tokenParam)
  event.parameters.push(targetPercentageParam)

  return event
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
