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
  LogWithdraw
} from '../../generated/BentoBox/BentoBox'
import { Clone, InvestOrDivest, ProfitOrLoss, Protocol, TokenStrategy } from '../../generated/schema'
import {
  createFlashLoan,
  createStrategy, decreasePendingStrategyCount,
  getOrCreateBalance,
  getOrCreateBentoBoxKpi,
  getOrCreateMasterContractApproval,
  getOrCreateRebase,
  getOrCreateStrategyData,
  getOrCreateToken,
  getOrCreateTokenKpi,
  getOrCreateUser,
  getRebase,
  getStrategyData,
  getStrategyKpi,
  getToken,
  increaseActiveStrategyCount,
  increaseCloneContractCount,
  increaseFlashLoanCount,
  increasePendingStrategyCount,
  increaseProtocolCount,
  increaseStrategyCount
} from '../functions'
import { getOrCreateHarvest } from '../functions/harvest'
import { getOrCreateMasterContract } from '../functions/master-contract'
import { getTokenStrategy } from '../functions/token-strategy'
import { createTransaction } from '../functions/transaction'

// import { SECONDS_IN_A_YEAR } from 'math'

export function onLogDeposit(event: LogDeposit): void {
  const tokenAddress = event.params.token.toHex()
  const token = getOrCreateToken(tokenAddress)

  const tokenKpi = getOrCreateTokenKpi(tokenAddress)
  tokenKpi.liquidity = tokenKpi.liquidity.plus(event.params.amount)
  tokenKpi.save()

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
  const token = getOrCreateToken(tokenAddress)

  const tokenKpi = getOrCreateTokenKpi(tokenAddress)
  tokenKpi.liquidity = tokenKpi.liquidity.minus(event.params.amount)
  tokenKpi.save()

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
  const token = getOrCreateToken(event.params.token.toHex())

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

  increaseFlashLoanCount()
}

export function onLogWhiteListMasterContract(event: LogWhiteListMasterContract): void {
  const masterContract = getOrCreateMasterContract(event.params.masterContract)
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

  increaseProtocolCount()
}

export function onLogDeploy(event: LogDeploy): void {
  const clone = new Clone(event.params.cloneAddress.toHex())
  clone.bentoBox = event.address.toHex()
  clone.masterContract = event.params.masterContract.toHex()
  clone.data = event.params.data
  clone.block = event.block.number
  clone.timestamp = event.block.timestamp
  clone.save()

  increaseCloneContractCount()
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


  increaseStrategyCount()
  increasePendingStrategyCount()
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

  increaseActiveStrategyCount()
  decreasePendingStrategyCount()
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

  strategyKpi.investOrDivestCount = strategyKpi.investOrDivestCount.plus(BigInt.fromU32(1))
  strategyKpi.investCount = strategyKpi.investCount.plus(BigInt.fromU32(1))
  strategyKpi.invested = strategyKpi.invested.plus(event.params.amount)
  strategyKpi.save()
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

  strategyKpi.investOrDivestCount = strategyKpi.investOrDivestCount.plus(BigInt.fromU32(1))
  strategyKpi.divestCount = strategyKpi.divestCount.plus(BigInt.fromU32(1))
  strategyKpi.divested = strategyKpi.divested.plus(event.params.amount)
  strategyKpi.save()
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
    // TODO: Calculate APR by getting previous profit or loss and store on strategy kpi
    const lastProfit = ProfitOrLoss.load(
      tokenStrategy.strategy!.concat('-').concat(strategyKpi.profitOrLossCount.minus(BigInt.fromU32(1)).toString())
    )

    const timestampDifference = profit.timestamp.minus(lastProfit!.timestamp)

    // It's possible that difference can be zero, so ensure it's not before calculating APR
    if (timestampDifference.gt(BigInt.fromU32(0))) {
      const multiplier = BigDecimal.fromString('31536000').div(timestampDifference.toBigDecimal())

      const ratio = rebase.elastic.toBigDecimal().div(rebase.base.toBigDecimal())
      const lastRatio = lastProfit!.elastic.toBigDecimal().div(lastProfit!.base.toBigDecimal())

      strategyKpi.apr = ratio.div(lastRatio).minus(BigDecimal.fromString('1')).times(multiplier)
    }

    strategyKpi.utilization = strategyData.balance.toBigDecimal().div(rebase.elastic.toBigDecimal())
  }

  strategyKpi.profitOrLossCount = strategyKpi.profitOrLossCount.plus(BigInt.fromU32(1))
  strategyKpi.profitCount = strategyKpi.profitCount.plus(BigInt.fromU32(1))
  strategyKpi.profitAndLoss = strategyKpi.profitAndLoss.plus(event.params.amount)
  strategyKpi.save()
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

  strategyKpi.profitOrLossCount = strategyKpi.profitOrLossCount.plus(BigInt.fromU32(1))
  strategyKpi.lossCount = strategyKpi.lossCount.plus(BigInt.fromU32(1))
  strategyKpi.profitAndLoss = strategyKpi.profitAndLoss.minus(event.params.amount)
  strategyKpi.save()
}
