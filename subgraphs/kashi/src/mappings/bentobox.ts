import { Clone } from '../../generated/schema'
import { KashiPair as KashiPairTemplate } from '../../generated/templates'
import {
  LogDeploy,
  LogDeposit,
  LogFlashLoan,
  LogSetMasterContractApproval,
  LogStrategyLoss,
  LogStrategyProfit,
  LogWhiteListMasterContract,
  LogWithdraw,
} from '../../generated/BentoBox/BentoBox'
import {
  createKashiPair,
  getOrCreateMasterContract,
  getOrCreateMasterContractApproval,
  getOrCreateRebase,
  getOrCreateUser,
  getRebase,
} from '../functions'
import { KASHI_MEDIUM_RISK_MASTER_CONTRACT_ADDRESSES } from '../constants'

export function onLogDeposit(event: LogDeposit): void {
  const rebase = getOrCreateRebase(event.params.token.toHex())
  rebase.base = rebase.base.plus(event.params.share)
  rebase.elastic = rebase.elastic.plus(event.params.amount)
  rebase.save()
}

export function onLogWithdraw(event: LogWithdraw): void {
  const rebase = getOrCreateRebase(event.params.token.toHex())
  rebase.base = rebase.base.minus(event.params.share)
  rebase.elastic = rebase.elastic.minus(event.params.amount)
  rebase.save()
}

export function onLogFlashLoan(event: LogFlashLoan): void {
  const rebase = getOrCreateRebase(event.params.token.toHex())
  rebase.elastic = rebase.elastic.plus(event.params.feeAmount)
  rebase.save()
}

export function onLogStrategyProfit(event: LogStrategyProfit): void {
  const rebase = getRebase(event.params.token.toHex())
  rebase.elastic = rebase.elastic.plus(event.params.amount)
  rebase.save()
}

export function onLogStrategyLoss(event: LogStrategyLoss): void {
  const rebase = getRebase(event.params.token.toHex())
  rebase.elastic = rebase.elastic.minus(event.params.amount)
  rebase.save()
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

export function onLogDeploy(event: LogDeploy): void {
  const clone = new Clone(event.params.cloneAddress.toHex())
  clone.bentoBox = event.address.toHex()
  clone.masterContract = event.params.masterContract.toHex()
  clone.data = event.params.data
  clone.block = event.block.number
  clone.timestamp = event.block.timestamp
  clone.save()

  if (KASHI_MEDIUM_RISK_MASTER_CONTRACT_ADDRESSES.includes(event.params.masterContract.toHex())) {
    createKashiPair(event)
    KashiPairTemplate.create(event.params.cloneAddress)
  }
}
