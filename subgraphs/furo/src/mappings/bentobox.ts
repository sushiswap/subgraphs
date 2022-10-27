import {
  LogDeposit,
  LogFlashLoan,
  LogStrategyLoss,
  LogStrategyProfit,
  LogWithdraw
} from '../../generated/BentoBox/BentoBox'
import { getOrCreateRebase, getOrCreateToken } from '../functions'



export function onLogDeposit(event: LogDeposit): void {
  const tokenAddress = event.params.token.toHex()
  const token = getOrCreateToken(tokenAddress, event)
  const rebase = getOrCreateRebase(token.id, event.block.number)

  if (!rebase.createdAtBlock.equals(event.block.number)) {
    rebase.base = rebase.base.plus(event.params.share)
    rebase.elastic = rebase.elastic.plus(event.params.amount)
    rebase.save()
  }
}

export function onLogWithdraw(event: LogWithdraw): void {
  const tokenAddress = event.params.token.toHex()
  const token = getOrCreateToken(tokenAddress, event)
  const rebase = getOrCreateRebase(token.id, event.block.number)

  if (!rebase.createdAtBlock.equals(event.block.number)) {
    rebase.base = rebase.base.minus(event.params.share)
    rebase.elastic = rebase.elastic.minus(event.params.amount)
    rebase.save()
  }
}

export function onLogStrategyProfit(event: LogStrategyProfit): void {
  const tokenAddress = event.params.token.toHex()
  const token = getOrCreateToken(tokenAddress, event)
  const rebase = getOrCreateRebase(token.id, event.block.number)

  if (!rebase.createdAtBlock.equals(event.block.number)) {
    rebase.elastic = rebase.elastic.plus(event.params.amount)
    rebase.save()
  }
}

export function onLogStrategyLoss(event: LogStrategyLoss): void {
  const tokenAddress = event.params.token.toHex()
  const token = getOrCreateToken(tokenAddress, event)
  const rebase = getOrCreateRebase(token.id, event.block.number)

  if (!rebase.createdAtBlock.equals(event.block.number)) {
    rebase.elastic = rebase.elastic.minus(event.params.amount)
    rebase.save()
  }
}

export function onLogFlashLoan(event: LogFlashLoan): void {
  const tokenAddress = event.params.token.toHex()
  const token = getOrCreateToken(tokenAddress, event)
  const rebase = getOrCreateRebase(token.id, event.block.number)

  if (!rebase.createdAtBlock.equals(event.block.number)) {
    rebase.elastic = rebase.elastic.plus(event.params.feeAmount)
    rebase.save()
  }
}