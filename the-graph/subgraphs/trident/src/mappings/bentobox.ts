import { Address, BigInt, log } from '@graphprotocol/graph-ts'
import {
  LogDeposit,
  LogWithdraw,
  LogFlashLoan,
  LogStrategyProfit,
  LogStrategyLoss,
} from '../../generated/BentoBox/BentoBox'
import { TokenKpi } from '../../generated/schema'
import { getTokenKpi, getOrCreateToken } from '../functions'

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

  const kpi = getTokenKpi(event.params.token)
  kpi.totalSupplyBase = kpi.totalSupplyBase.plus(share)
  kpi.totalSupplyElastic = kpi.totalSupplyElastic.plus(amount)
  kpi.save()
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

  const kpi = getTokenKpi(event.params.token)
  kpi.totalSupplyBase = kpi.totalSupplyBase.minus(share)
  kpi.totalSupplyElastic = kpi.totalSupplyElastic.minus(amount)
  kpi.save()
}

export function onLogStrategyProfit(event: LogStrategyProfit): void {
  const token = getOrCreateToken(event.params.token)

  const amount = event.params.amount.divDecimal(
    BigInt.fromI32(10)
      .pow(token.decimals.toI32() as u8)
      .toBigDecimal()
  )

  const kpi = getTokenKpi(event.params.token)
  kpi.totalSupplyElastic = kpi.totalSupplyElastic.plus(amount)
  kpi.save()
}

export function onLogStrategyLoss(event: LogStrategyLoss): void {
  const token = getOrCreateToken(event.params.token)

  const amount = event.params.amount.divDecimal(
    BigInt.fromI32(10)
      .pow(token.decimals.toI32() as u8)
      .toBigDecimal()
  )

  const kpi = getTokenKpi(event.params.token)
  kpi.totalSupplyElastic = kpi.totalSupplyElastic.minus(amount)
  kpi.save()
}

export function onLogFlashLoan(event: LogFlashLoan): void {
  const token = getOrCreateToken(event.params.token)

  const feeAmount = event.params.feeAmount.divDecimal(
    BigInt.fromI32(10)
      .pow(token.decimals.toI32() as u8)
      .toBigDecimal()
  )

  const kpi = getTokenKpi(event.params.token)
  kpi.totalSupplyElastic = kpi.totalSupplyElastic.plus(feeAmount)
  kpi.save()
}
