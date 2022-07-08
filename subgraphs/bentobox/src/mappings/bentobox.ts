import { BigDecimal, BigInt } from '@graphprotocol/graph-ts'
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
  LogStrategyQueued,
  LogStrategySet,
  LogStrategyTargetPercentage,
  LogTransfer,
  LogWhiteListMasterContract,
  LogWithdraw,
} from '../../generated/BentoBox/BentoBox'
import { Clone, InvestOrDivest, ProfitOrLoss, Protocol, TokenStrategy } from '../../generated/schema'
import {
  createFlashLoan,
  createStrategy,
  decreasePendingStrategyCount,
  getOrCreateBalance,
  getOrCreateBentoBoxKpi,
  getOrCreateMasterContractApproval,
  getOrCreateRebase,
  getOrCreateStrategyData,
  getOrCreateToken,
  getOrCreateUser,
  getRebase,
  getStrategyData,
  getStrategyKpi,
  getToken,
  increaseActiveStrategyCount,
  increaseCloneContractCount,
  increaseDivestKpi,
  increaseFlashLoanCount,
  increaseInvestKpi,
  increaseLossKpi,
  increasePendingStrategyCount,
  increaseProfitKpi,
  increaseProtocolCount,
  increaseStrategyCount,
} from '../functions'
import { getOrCreateHarvest } from '../functions/harvest'
import { getOrCreateMasterContract } from '../functions/master-contract'
import {
  decreaseTokenKpiLiquidity,
  getOrCreateTokenKpi,
  increaseTokenKpiLiquidity,
  increaseTokenKpiStrategyCount,
} from '../functions/token-kpi'
import { getTokenStrategy } from '../functions/token-strategy'
import { createTransaction } from '../functions/transaction'

// import { SECONDS_IN_A_YEAR } from 'math'

export function onLogDeposit(event: LogDeposit): void {
  const tokenAddress = event.params.token.toHex()
  const token = getOrCreateToken(tokenAddress, event)

  increaseTokenKpiLiquidity(tokenAddress, event.params.amount, event.block.timestamp)

  const rebase = getOrCreateRebase(tokenAddress)
  rebase.base = rebase.base.plus(event.params.share)
  rebase.elastic = rebase.elastic.plus(event.params.amount)
  rebase.save()

  getOrCreateUser(event.params.from, event)
  const to = getOrCreateUser(event.params.to, event)

  const balance = getOrCreateBalance(to.id, token.id)
  balance.share = balance.share.plus(event.params.share)
  balance.save()

  createTransaction<LogDeposit>(event)
}

export function onLogWithdraw(event: LogWithdraw): void {
  const tokenAddress = event.params.token.toHex()
  const token = getOrCreateToken(tokenAddress, event)

  decreaseTokenKpiLiquidity(tokenAddress, event.params.amount, event.block.timestamp)

  const rebase = getOrCreateRebase(tokenAddress)
  rebase.base = rebase.base.minus(event.params.share)
  rebase.elastic = rebase.elastic.minus(event.params.amount)
  rebase.save()

  const from = getOrCreateUser(event.params.from, event)
  getOrCreateUser(event.params.to, event)

  const balance = getOrCreateBalance(from.id, token.id)
  balance.share = balance.share.minus(event.params.share)
  balance.save()

  createTransaction<LogWithdraw>(event)
}

export function onLogTransfer(event: LogTransfer): void {
  const from = getOrCreateUser(event.params.from, event)
  const to = getOrCreateUser(event.params.to, event)
  const token = getOrCreateToken(event.params.token.toHex(), event)

  const sender = getOrCreateBalance(from.id, token.id)
  sender.share = sender.share.minus(event.params.share)
  sender.save()

  const receiver = getOrCreateBalance(to.id, token.id)
  receiver.share = receiver.share.plus(event.params.share)
  receiver.save()

  createTransaction<LogTransfer>(event)
}

export function onLogFlashLoan(event: LogFlashLoan): void {
  const tokenAddress = event.params.token.toHex()
  const rebase = getOrCreateRebase(tokenAddress)
  rebase.elastic = rebase.elastic.plus(event.params.feeAmount)
  rebase.save()

  createFlashLoan(event)

  increaseFlashLoanCount(event.block.timestamp)
}

export function onLogWhiteListMasterContract(event: LogWhiteListMasterContract): void {
  const masterContract = getOrCreateMasterContract(event.params.masterContract, event)
  masterContract.approved = event.params.approved
  masterContract.save()
}

export function onLogSetMasterContractApproval(event: LogSetMasterContractApproval): void {
  getOrCreateUser(event.params.user, event)

  const masterContractApproval = getOrCreateMasterContractApproval(event)
  masterContractApproval.approved = event.params.approved
  masterContractApproval.save()
}

export function onLogRegisterProtocol(event: LogRegisterProtocol): void {
  const registeredProtocol = new Protocol(event.params.protocol.toHex())
  registeredProtocol.bentoBox = event.address.toHex()
  registeredProtocol.save()

  increaseProtocolCount(event.block.timestamp)
}

export function onLogDeploy(event: LogDeploy): void {
  const clone = new Clone(event.params.cloneAddress.toHex())
  clone.bentoBox = event.address.toHex()
  clone.masterContract = event.params.masterContract.toHex()
  clone.data = event.params.data
  clone.block = event.block.number
  clone.timestamp = event.block.timestamp
  clone.save()

  increaseCloneContractCount(event.block.timestamp)
}

export function onLogStrategyTargetPercentage(event: LogStrategyTargetPercentage): void {
  const tokenAddress = event.params.token.toHex()
  const data = getOrCreateStrategyData(tokenAddress)
  data.targetPercentage = event.params.targetPercentage
  data.save()
}

export function onLogStrategyQueued(event: LogStrategyQueued): void {
  const pendingStrategyAddress = event.params.strategy.toHex()
  const tokenAddress = event.params.token.toHex()

  // Set start date
  const data = getOrCreateStrategyData(tokenAddress)
  data.strategyStartDate = event.block.timestamp.plus(BigInt.fromU32(1209600))
  data.save()

  const pendingStrategy = createStrategy(pendingStrategyAddress, tokenAddress, event)

  let tokenStrategy = TokenStrategy.load(tokenAddress)

  if (tokenStrategy === null) {
    tokenStrategy = new TokenStrategy(tokenAddress)
    tokenStrategy.token = tokenAddress
    tokenStrategy.data = data.id
    tokenStrategy.strategy = null
    tokenStrategy.pendingStrategy = pendingStrategy.id
    tokenStrategy.block = event.block.number
    tokenStrategy.timestamp = event.block.timestamp
    tokenStrategy.save()
  } else {
    tokenStrategy.pendingStrategy = pendingStrategy.id
    tokenStrategy.save()
  }

  increaseTokenKpiStrategyCount(tokenAddress, event.block.timestamp)
  increaseStrategyCount(event.block.timestamp)
  increasePendingStrategyCount(event.block.timestamp)
}

export function onLogStrategySet(event: LogStrategySet): void {
  const strategyAddress = event.params.strategy.toHex()
  const tokenAddress = event.params.token.toHex()

  // Set strategy
  const tokenStrategy = getTokenStrategy(tokenAddress)
  tokenStrategy.strategy = strategyAddress
  tokenStrategy.pendingStrategy = null
  tokenStrategy.save()

  // Reset stategy data
  const data = getOrCreateStrategyData(tokenAddress)
  data.balance = BigInt.fromI32(0)
  data.strategyStartDate = BigInt.fromI32(0)
  data.save()

  increaseActiveStrategyCount(event.block.timestamp)
  decreasePendingStrategyCount(event.block.timestamp)
}

export function onLogStrategyInvest(event: LogStrategyInvest): void {
  const tokenAddress = event.params.token.toHex()

  const token = getToken(tokenAddress)

  const strategyData = getStrategyData(tokenAddress)
  strategyData.balance = strategyData.balance.plus(event.params.amount)
  strategyData.save()

  const tokenStrategy = getTokenStrategy(tokenAddress)

  const harvest = getOrCreateHarvest(
    tokenStrategy.strategy!.concat('-').concat(event.block.number.toString()),
    tokenStrategy.strategy!,
    token.id,
    event
  )

  const strategyKpi = getStrategyKpi(tokenStrategy.strategy!)

  const rebase = getRebase(tokenAddress)

  const invest = new InvestOrDivest(
    tokenStrategy.strategy!.concat('-').concat(strategyKpi.investOrDivestCount.toString())
  )
  invest.harvest = harvest.id
  invest.elastic = rebase.elastic
  invest.base = rebase.base
  invest.amount = event.params.amount
  invest.block = event.block.number
  invest.timestamp = event.block.timestamp
  invest.save()

  harvest.investOrDivest = invest.id
  harvest.save()

  increaseInvestKpi(strategyKpi.id, event.params.amount, event.block.timestamp)
}

export function onLogStrategyDivest(event: LogStrategyDivest): void {
  const tokenAddress = event.params.token.toHex()

  const token = getToken(tokenAddress)

  const tokenStrategy = getTokenStrategy(tokenAddress)

  const strategyData = getStrategyData(tokenAddress)
  strategyData.balance = strategyData.balance.minus(event.params.amount)
  strategyData.save()

  const harvest = getOrCreateHarvest(
    tokenStrategy.strategy!.concat('-').concat(event.block.number.toString()),
    tokenStrategy.strategy!,
    token.id,
    event
  )

  const strategyKpi = getStrategyKpi(tokenStrategy.strategy!)

  const rebase = getRebase(tokenAddress)

  const divest = new InvestOrDivest(
    tokenStrategy.strategy!.concat('-').concat(strategyKpi.investOrDivestCount.toString())
  )
  divest.harvest = harvest.id
  divest.elastic = rebase.elastic
  divest.base = rebase.base
  divest.amount = BigInt.fromI32(0).minus(event.params.amount)
  divest.block = event.block.number
  divest.timestamp = event.block.timestamp
  divest.save()

  harvest.investOrDivest = divest.id
  harvest.save()

  increaseDivestKpi(strategyKpi.id, event.params.amount, event.block.timestamp)
}

export function onLogStrategyProfit(event: LogStrategyProfit): void {
  const tokenAddress = event.params.token.toHex()

  const token = getToken(tokenAddress)

  const tokenStrategy = getTokenStrategy(tokenAddress)

  const strategyData = getStrategyData(tokenAddress)

  const harvest = getOrCreateHarvest(
    tokenStrategy.strategy!.concat('-').concat(event.block.number.toString()),
    tokenStrategy.strategy!,
    token.id,
    event
  )

  const strategyKpi = getStrategyKpi(tokenStrategy.strategy!)

  const rebase = getRebase(tokenAddress)
  rebase.elastic = rebase.elastic.plus(event.params.amount)
  rebase.save()

  const profit = new ProfitOrLoss(tokenStrategy.strategy!.concat('-').concat(strategyKpi.profitOrLossCount.toString()))
  profit.harvest = harvest.id
  profit.elastic = rebase.elastic
  profit.base = rebase.base
  profit.amount = event.params.amount
  profit.block = event.block.number
  profit.timestamp = event.block.timestamp
  profit.save()

  harvest.profitOrLoss = profit.id
  harvest.save()

  // If more than one profit or loss for this strategy
  if (strategyKpi.profitOrLossCount.gt(BigInt.fromU32(0))) {
    const lastProfitOrLoss = ProfitOrLoss.load(
      tokenStrategy.strategy!.concat('-').concat(strategyKpi.profitOrLossCount.minus(BigInt.fromU32(1)).toString())
    )

    const timestampDifference = profit.timestamp.minus(lastProfitOrLoss!.timestamp)

    // It's possible that difference can be zero, so ensure it's not before calculating APR
    if (timestampDifference.gt(BigInt.fromU32(0))) {
      const multiplier = BigDecimal.fromString('31536000').div(timestampDifference.toBigDecimal())

      strategyKpi.apr = event.params.amount.toBigDecimal().div(rebase.elastic.toBigDecimal()).times(multiplier)
    }

    strategyKpi.utilization = strategyData.balance.toBigDecimal().div(rebase.elastic.toBigDecimal())
  }

  increaseProfitKpi(strategyKpi.id, event.params.amount, event.block.timestamp)
}

export function onLogStrategyLoss(event: LogStrategyLoss): void {
  const tokenAddress = event.params.token.toHex()

  const token = getToken(tokenAddress)

  const tokenStrategy = getTokenStrategy(tokenAddress)

  const strategyData = getStrategyData(tokenAddress)
  strategyData.balance = strategyData.balance.minus(event.params.amount)
  strategyData.save()

  const harvest = getOrCreateHarvest(
    tokenStrategy.strategy!.concat('-').concat(event.block.number.toString()),
    tokenStrategy.strategy!,
    token.id,
    event
  )

  const strategyKpi = getStrategyKpi(tokenStrategy.strategy!)

  const rebase = getRebase(tokenAddress)
  rebase.elastic = rebase.elastic.minus(event.params.amount)
  rebase.save()

  const loss = new ProfitOrLoss(tokenStrategy.strategy!.concat('-').concat(strategyKpi.profitOrLossCount.toString()))
  loss.harvest = harvest.id
  loss.elastic = rebase.elastic
  loss.base = rebase.base
  loss.amount = BigInt.fromI32(0).minus(event.params.amount)
  loss.block = event.block.number
  loss.timestamp = event.block.timestamp
  loss.save()

  harvest.profitOrLoss = loss.id
  harvest.save()

  // If more than one profit or loss for this strategy
  if (strategyKpi.profitOrLossCount.gt(BigInt.fromU32(0))) {
    const lastProfitOrLoss = ProfitOrLoss.load(
      tokenStrategy.strategy!.concat('-').concat(strategyKpi.profitOrLossCount.minus(BigInt.fromU32(1)).toString())
    )

    const timestampDifference = loss.timestamp.minus(lastProfitOrLoss!.timestamp)

    // It's possible that difference can be zero, so ensure it's not before calculating APR
    if (timestampDifference.gt(BigInt.fromU32(0))) {
      const multiplier = BigDecimal.fromString('31536000').div(timestampDifference.toBigDecimal())

      strategyKpi.apr = BigInt.fromI32(0)
        .minus(event.params.amount)
        .toBigDecimal()
        .div(rebase.elastic.toBigDecimal())
        .times(multiplier)
    }

    strategyKpi.utilization = strategyData.balance.toBigDecimal().div(rebase.elastic.toBigDecimal())
  }

  increaseLossKpi(strategyKpi.id, event.params.amount, event.block.timestamp)
}
