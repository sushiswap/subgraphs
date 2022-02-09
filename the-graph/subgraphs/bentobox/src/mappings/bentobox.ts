import { BigInt, log } from '@graphprotocol/graph-ts'
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
  OwnershipTransferred,
} from '../../generated/BentoBox/BentoBox'
import { Clone, Protocol } from '../../generated/schema'
import {
  getOrCreateBentoBox,
  getOrCreateMasterContractApproval,
  getOrCreateRebase,
  getOrCreateToken,
  getOrCreateUser,
  getOrCreateUserToken,
} from '../functions'
import { getOrCreateMasterContract } from '../functions/master-contract'

export function onLogDeposit(event: LogDeposit): void {
  const tokenAddress = event.params.token.toHex()
  const token = getOrCreateToken(tokenAddress)
  
  const share = event.params.share.divDecimal(
    BigInt.fromI32(10)
      .pow(token.decimals.toI32() as u8)
      .toBigDecimal()
  )

  const amount = event.params.amount.divDecimal(
    BigInt.fromI32(10)
      .pow(token.decimals.toI32() as u8)
      .toBigDecimal()
  )

  const rebase = getOrCreateRebase(tokenAddress)
  rebase.base = rebase.base.plus(share)
  rebase.elastic = rebase.elastic.plus(amount)
  rebase.save()


  const from = getOrCreateUser(event.params.from, event.address)
  const userToken = getOrCreateUserToken(from.id, token)
  userToken.share = userToken.share.plus(event.params.share)
  userToken.save()
}

export function onLogWithdraw(event: LogWithdraw): void {
  const tokenAddress = event.params.token.toHex()
  const token = getOrCreateToken(tokenAddress)

  const share = event.params.share.divDecimal(
    BigInt.fromI32(10)
      .pow(token.decimals.toI32() as u8)
      .toBigDecimal()
  )

  const amount = event.params.amount.divDecimal(
    BigInt.fromI32(10)
      .pow(token.decimals.toI32() as u8)
      .toBigDecimal()
  )

  const rebase = getOrCreateRebase(tokenAddress)
  rebase.base = rebase.base.minus(share)
  rebase.elastic = rebase.elastic.minus(amount)
  rebase.save()

  const userToken = getOrCreateUserToken(event.params.from.toHex(), token)
  userToken.share = userToken.share.minus(event.params.share)
  userToken.save()
}

export function onLogTransfer(event: LogTransfer): void {
  const from = getOrCreateUser(event.params.from, event.address)
  const to = getOrCreateUser(event.params.to, event.address)
  const token = getOrCreateToken(event.params.token.toHex())

  const sender = getOrCreateUserToken(from.id, token)
  sender.share = sender.share.minus(event.params.share)
  sender.save()

  const receiver = getOrCreateUserToken(to.id, token)
  receiver.share = receiver.share.plus(event.params.share)
  receiver.save()
}

export function onLogFlashLoan(event: LogFlashLoan): void {
  const tokenAddress = event.params.token.toHex()
  const token = getOrCreateToken(tokenAddress)

  const feeAmount = event.params.feeAmount.divDecimal(
    BigInt.fromI32(10)
      .pow(token.decimals.toI32() as u8)
      .toBigDecimal()
  )

  const rebase = getOrCreateRebase(tokenAddress)
  rebase.elastic = rebase.elastic.plus(feeAmount)
  rebase.save()
}

export function onLogStrategyTargetPercentage(event: LogStrategyTargetPercentage): void {
  // FIXME: Not used, remove from subgraph yaml?
}

export function onLogStrategyQueued(event: LogStrategyQueued): void {
  // FIXME: Not used, remove from subgraph yaml?
}

export function onLogStrategySet(event: LogStrategySet): void {
  // FIXME: Not used, remove from subgraph yaml?
}

export function onLogStrategyInvest(event: LogStrategyInvest): void {
  const tokenAddress = event.params.token.toHex()
  const token = getOrCreateToken(tokenAddress)

  const amount = event.params.amount.divDecimal(
    BigInt.fromI32(10)
      .pow(token.decimals.toI32() as u8)
      .toBigDecimal()
  )

  const rebase = getOrCreateRebase(tokenAddress)
  rebase.elastic = rebase.elastic.plus(amount)
  rebase.save()
}

export function onLogStrategyDivest(event: LogStrategyDivest): void {
  const tokenAddress = event.params.token.toHex()
  const token = getOrCreateToken(tokenAddress)

  const amount = event.params.amount.divDecimal(
    BigInt.fromI32(10)
      .pow(token.decimals.toI32() as u8)
      .toBigDecimal()
  )

  const rebase = getOrCreateRebase(tokenAddress)
  rebase.elastic = rebase.elastic.minus(amount)
  rebase.save()
}

export function onLogStrategyProfit(event: LogStrategyProfit): void {
  const tokenAddress = event.params.token.toHex()
  const token = getOrCreateToken(tokenAddress)

  const amount = event.params.amount.divDecimal(
    BigInt.fromI32(10)
      .pow(token.decimals.toI32() as u8)
      .toBigDecimal()
  )

  const rebase = getOrCreateRebase(tokenAddress)
  rebase.elastic = rebase.elastic.plus(amount)
  rebase.save()
}

export function onLogStrategyLoss(event: LogStrategyLoss): void {
  const tokenAddress = event.params.token.toHex()
  const token = getOrCreateToken(tokenAddress)

  const amount = event.params.amount.divDecimal(
    BigInt.fromI32(10)
      .pow(token.decimals.toI32() as u8)
      .toBigDecimal()
  )

  const rebase = getOrCreateRebase(tokenAddress)
  rebase.elastic = rebase.elastic.minus(amount)
  rebase.save()
}

export function onLogWhiteListMasterContract(event: LogWhiteListMasterContract): void {
  if (event.params.approved == true) {
    getOrCreateMasterContract(event.params.masterContract)
  }
}

export function onLogSetMasterContractApproval(event: LogSetMasterContractApproval): void {
  getOrCreateUser(event.params.user, event.params.masterContract)

  const masterContractApproval = getOrCreateMasterContractApproval(event)
  masterContractApproval.masterContract = event.params.masterContract.toHex()
  masterContractApproval.approved = event.params.approved
  masterContractApproval.save()
}

export function onLogRegisterProtocol(event: LogRegisterProtocol): void {
  log.info('[BentoBox] Log Register Protocol {}', [event.params.protocol.toHex()])

  const bentoBox = getOrCreateBentoBox(event.address)

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

export function onOwnershipTransferred(event: OwnershipTransferred): void {
  // FIXME: Not used, remove from subgraph yaml?
}
