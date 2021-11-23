import { Address, BigInt, log } from '@graphprotocol/graph-ts'
import { getOrCreateRebase } from '../../src/functions/rebase'
import {
  LogDeposit,
  LogWithdraw,
  LogFlashLoan,
  LogStrategyProfit,
  LogStrategyLoss,
} from '../../generated/BentoBox/BentoBox'
import { getOrCreateToken } from '../functions'

export function onLogDeposit(event: LogDeposit): void {
  const token = getOrCreateToken(event.params.token)

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

  const rebase = getOrCreateRebase(event.params.token)
  rebase.base = rebase.base.plus(share)
  rebase.elastic = rebase.elastic.plus(amount)
  rebase.save()
}

export function onLogWithdraw(event: LogWithdraw): void {
  const token = getOrCreateToken(event.params.token)

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

  const rebase = getOrCreateRebase(event.params.token)
  rebase.base = rebase.base.minus(share)
  rebase.elastic = rebase.elastic.minus(amount)
  rebase.save()
}

export function onLogStrategyProfit(event: LogStrategyProfit): void {
  const token = getOrCreateToken(event.params.token)

  const amount = event.params.amount.divDecimal(
    BigInt.fromI32(10)
      .pow(token.decimals.toI32() as u8)
      .toBigDecimal()
  )

  const rebase = getOrCreateRebase(event.params.token)
  rebase.elastic = rebase.elastic.plus(amount)
  rebase.save()
}

export function onLogStrategyLoss(event: LogStrategyLoss): void {
  const token = getOrCreateToken(event.params.token)

  const amount = event.params.amount.divDecimal(
    BigInt.fromI32(10)
      .pow(token.decimals.toI32() as u8)
      .toBigDecimal()
  )

  const rebase = getOrCreateRebase(event.params.token)
  rebase.elastic = rebase.elastic.minus(amount)
  rebase.save()
}

export function onLogFlashLoan(event: LogFlashLoan): void {
  const token = getOrCreateToken(event.params.token)

  const feeAmount = event.params.feeAmount.divDecimal(
    BigInt.fromI32(10)
      .pow(token.decimals.toI32() as u8)
      .toBigDecimal()
  )

  const rebase = getOrCreateRebase(event.params.token)
  rebase.elastic = rebase.elastic.plus(feeAmount)
  rebase.save()
}
