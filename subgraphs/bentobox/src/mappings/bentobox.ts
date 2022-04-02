import { BigInt, log } from '@graphprotocol/graph-ts'
import { Clone, Protocol } from '../../generated/schema'
import {
  LogDeploy,
  LogDeposit,
  LogFlashLoan,
  LogRegisterProtocol,
  LogSetMasterContractApproval,
  LogStrategyDivest,
  LogStrategyInvest,
  LogStrategyLoss,
  LogStrategyProfit,
  LogStrategySet,
  LogStrategyTargetPercentage,
  LogTransfer,
  LogWhiteListMasterContract,
  LogWithdraw,
} from '../../generated/BentoBox/BentoBox'
import {
  createDepositTransaction,
  createTransferTransaction,
  createWithdrawTransaction,
} from '../functions/transaction'
import {
  createFlashLoan,
  createLossStrategyHarvest,
  createProfitStrategyHarvest,
  getOrCreateBentoBox,
  getOrCreateMasterContractApproval,
  getOrCreateRebase,
  getOrCreateStrategy,
  getOrCreateToken,
  getOrCreateUser,
  getOrCreateUserToken,
  toDecimal,
} from '../functions'

import { getOrCreateMasterContract } from '../functions/master-contract'

const WARNING_MSG_STRATEGY_SET =
  '{}: LogStrategySet should always trigger before any other strategy events - Strategy save is ignored.'

export function onLogDeposit(event: LogDeposit): void {
  const tokenAddress = event.params.token.toHex()
  const token = getOrCreateToken(tokenAddress)

  const share = toDecimal(event.params.share, token.decimals)
  const amount = toDecimal(event.params.amount, token.decimals)

  const rebase = getOrCreateRebase(tokenAddress)
  rebase.base = rebase.base.plus(share)
  rebase.elastic = rebase.elastic.plus(amount)
  rebase.save()

  getOrCreateUser(event.params.from)
  const to = getOrCreateUser(event.params.to)

  const userToken = getOrCreateUserToken(to.id, token)
  userToken.share = userToken.share.plus(share)
  userToken.save()

  createDepositTransaction(event)
}

export function onLogWithdraw(event: LogWithdraw): void {
  const tokenAddress = event.params.token.toHex()
  const token = getOrCreateToken(tokenAddress)

  const share = toDecimal(event.params.share, token.decimals)
  const amount = toDecimal(event.params.amount, token.decimals)

  const rebase = getOrCreateRebase(tokenAddress)
  rebase.base = rebase.base.minus(share)
  rebase.elastic = rebase.elastic.minus(amount)
  rebase.save()

  const from = getOrCreateUser(event.params.from)
  getOrCreateUser(event.params.to)

  const userToken = getOrCreateUserToken(from.id, token)
  userToken.share = userToken.share.minus(share)
  userToken.save()

  createWithdrawTransaction(event)
}

export function onLogTransfer(event: LogTransfer): void {
  const from = getOrCreateUser(event.params.from)
  const to = getOrCreateUser(event.params.to)
  const token = getOrCreateToken(event.params.token.toHex())

  const share = toDecimal(event.params.share, token.decimals)

  const sender = getOrCreateUserToken(from.id, token)
  sender.share = sender.share.minus(share)
  sender.save()

  const receiver = getOrCreateUserToken(to.id, token)
  receiver.share = receiver.share.plus(share)
  receiver.save()

  createTransferTransaction(event)
}

export function onLogFlashLoan(event: LogFlashLoan): void {
  const tokenAddress = event.params.token.toHex()
  const token = getOrCreateToken(tokenAddress)

  const feeAmount = toDecimal(event.params.feeAmount, token.decimals)

  const rebase = getOrCreateRebase(tokenAddress)
  rebase.elastic = rebase.elastic.plus(feeAmount)
  rebase.save()

  createFlashLoan(event, token.decimals)

  const bentoBox = getOrCreateBentoBox()
  bentoBox.flashloanCount = bentoBox.flashloanCount.plus(BigInt.fromU32(1 as u8))
  bentoBox.save()
}

export function onLogStrategyInvest(event: LogStrategyInvest): void {
  const tokenAddress = event.params.token.toHex()
  const token = getOrCreateToken(tokenAddress)

  const amount = toDecimal(event.params.amount, token.decimals)

  // const rebase = getOrCreateRebase(tokenAddress)
  // rebase.elastic = rebase.elastic.plus(amount)
  // rebase.save()

  if (!token.strategy) {
    log.warning(WARNING_MSG_STRATEGY_SET, ['onLogStrategyInvest'])
    return
  }
  const strategy = getOrCreateStrategy(token.strategy!, token.id, event.block)
  strategy.balance = strategy.balance.plus(event.params.amount)
  strategy.save()
}

export function onLogStrategyDivest(event: LogStrategyDivest): void {
  const tokenAddress = event.params.token.toHex()
  const token = getOrCreateToken(tokenAddress)

  const amount = toDecimal(event.params.amount, token.decimals)

  // const rebase = getOrCreateRebase(tokenAddress)
  // rebase.elastic = rebase.elastic.minus(amount)
  // rebase.save()

  if (!token.strategy) {
    log.warning(WARNING_MSG_STRATEGY_SET, ['onLogStrategyInvest'])
    return
  }

  const strategy = getOrCreateStrategy(token.strategy!, token.id, event.block)
  strategy.balance = strategy.balance.minus(event.params.amount)
  strategy.save()
}

export function onLogStrategyProfit(event: LogStrategyProfit): void {
  const tokenAddress = event.params.token.toHex()
  const token = getOrCreateToken(tokenAddress)

  const amount = toDecimal(event.params.amount, token.decimals)

  const rebase = getOrCreateRebase(tokenAddress)
  rebase.elastic = rebase.elastic.plus(amount)
  rebase.save()

  if (!token.strategy) {
    log.warning(WARNING_MSG_STRATEGY_SET, ['onLogStrategyProfit'])
    return
  }

  const strategy = getOrCreateStrategy(token.strategy!, token.id, event.block)
  strategy.totalProfit = strategy.totalProfit.plus(event.params.amount)
  strategy.balance = strategy.balance.plus(event.params.amount)
  strategy.save()

  createProfitStrategyHarvest(token.strategy!, amount, rebase.elastic, event)
}

export function onLogStrategyLoss(event: LogStrategyLoss): void {
  const tokenAddress = event.params.token.toHex()
  const token = getOrCreateToken(tokenAddress)

  const amount = toDecimal(event.params.amount, token.decimals)

  const rebase = getOrCreateRebase(tokenAddress)
  rebase.elastic = rebase.elastic.minus(amount)
  rebase.save()

  if (!token.strategy) {
    log.warning(WARNING_MSG_STRATEGY_SET, ['onLogStrategyProfit'])
    return
  }

  const strategy = getOrCreateStrategy(token.strategy!, token.id, event.block)
  strategy.totalProfit = strategy.totalProfit.minus(event.params.amount)
  strategy.balance = strategy.balance.minus(event.params.amount)
  strategy.save()

  createLossStrategyHarvest(token.strategy!, amount, rebase.elastic, event)
}

export function onLogWhiteListMasterContract(event: LogWhiteListMasterContract): void {
  if (event.params.approved == true) {
    getOrCreateMasterContract(event.params.masterContract)
  }
}

export function onLogSetMasterContractApproval(event: LogSetMasterContractApproval): void {
  getOrCreateUser(event.params.user)

  const masterContractApproval = getOrCreateMasterContractApproval(event)
  masterContractApproval.masterContract = event.params.masterContract.toHex()
  masterContractApproval.approved = event.params.approved
  masterContractApproval.save()

  const bentoBox = getOrCreateBentoBox()
  bentoBox.masterContractCount = bentoBox.masterContractCount.plus(BigInt.fromU32(1 as u8))
  bentoBox.save()
}

export function onLogRegisterProtocol(event: LogRegisterProtocol): void {
  const bentoBox = getOrCreateBentoBox()

  const registeredProtocol = new Protocol(event.params.protocol.toHex())
  registeredProtocol.bentoBox = bentoBox.id
  registeredProtocol.save()

  bentoBox.protocolCount = bentoBox.protocolCount.plus(BigInt.fromI32(1))
  bentoBox.save()
}

export function onLogDeploy(event: LogDeploy): void {
  let clone = new Clone(event.params.cloneAddress.toHex())

  clone.bentoBox = event.address.toHex()
  clone.masterContract = event.params.masterContract.toHex()
  clone.data = event.params.data
  clone.block = event.block.number
  clone.timestamp = event.block.timestamp
  clone.save()
}

export function onLogStrategyTargetPercentage(event: LogStrategyTargetPercentage): void {
  const token = getOrCreateToken(event.params.token.toHex())
  token.strategyTargetPercentage = event.params.targetPercentage
  token.save()
}

export function onLogStrategySet(event: LogStrategySet): void {
  const token = getOrCreateToken(event.params.token.toHex())
  token.strategy = event.params.strategy.toHex()
  token.save()

  getOrCreateStrategy(event.params.strategy.toHex(), token.id, event.block)
}
