import { BigInt, log } from '@graphprotocol/graph-ts'
import {
  LogDeposit,
  LogWithdraw,
  LogFlashLoan,
  LogStrategyProfit,
  LogStrategyLoss,
  LogTransfer,
  LogStrategyTargetPercentage,
  LogStrategyQueued,
  LogStrategySet,
  LogStrategyInvest,
  LogStrategyDivest,
  LogWhiteListMasterContract,
  LogSetMasterContractApproval,
  LogDeploy,
  LogRegisterProtocol,
  OwnershipTransferred,
} from '../../generated/BentoBox/BentoBox'
import { Protocol } from '../../generated/schema'
import { getOrCreateToken, getOrCreateRebase, getOrCreateBentoBox } from '../functions'

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
}

export function onLogTransfer(event: LogTransfer): void {
  //
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
  //
}

export function onLogStrategyQueued(event: LogStrategyQueued): void {
  //
}

export function onLogStrategySet(event: LogStrategySet): void {
  //
}

export function onLogStrategyInvest(event: LogStrategyInvest): void {
  //
}

export function onLogStrategyDivest(event: LogStrategyDivest): void {
  //
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
  //
}

export function onLogSetMasterContractApproval(event: LogSetMasterContractApproval): void {
  //
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
  //
}

export function onOwnershipTransferred(event: OwnershipTransferred): void {
  //
}
