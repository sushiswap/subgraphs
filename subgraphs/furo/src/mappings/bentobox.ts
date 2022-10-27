import {
  LogDeposit,
  LogFlashLoan,
  LogStrategyLoss,
  LogStrategyProfit,
  LogWithdraw
} from '../../generated/BentoBox/BentoBox'
import { Rebase } from '../../generated/schema'
import { createRebase, getOrCreateToken } from '../functions'



export function onLogDeposit(event: LogDeposit): void {
  const tokenAddress = event.params.token.toHex()
  const token = getOrCreateToken(tokenAddress, event)
  let rebase = Rebase.load(token.id)
  
  if (rebase === null) {
    createRebase(token.id)
  } else {
    rebase.base = rebase.base.plus(event.params.share)
    rebase.elastic = rebase.elastic.plus(event.params.amount)
    rebase.save()
  }
}

export function onLogWithdraw(event: LogWithdraw): void {
  const tokenAddress = event.params.token.toHex()
  const token = getOrCreateToken(tokenAddress, event)
  let rebase = Rebase.load(token.id)

  if (rebase === null) {
    createRebase(token.id)
  } else {
    rebase.base = rebase.base.minus(event.params.share)
    rebase.elastic = rebase.elastic.minus(event.params.amount)
    rebase.save()
  }
}

export function onLogStrategyProfit(event: LogStrategyProfit): void {
  const tokenAddress = event.params.token.toHex()
  const token = getOrCreateToken(tokenAddress, event)
  let rebase = Rebase.load(token.id)

  if (rebase === null) {
    createRebase(token.id)
  } else {
    rebase.elastic = rebase.elastic.plus(event.params.amount)
    rebase.save()
  }
}

export function onLogStrategyLoss(event: LogStrategyLoss): void {
  const tokenAddress = event.params.token.toHex()
  const token = getOrCreateToken(tokenAddress, event)
  let rebase = Rebase.load(token.id)

  if (rebase === null) {
    createRebase(token.id)
  } else {
    rebase.elastic = rebase.elastic.minus(event.params.amount)
    rebase.save()
  }
}

export function onLogFlashLoan(event: LogFlashLoan): void {
  const tokenAddress = event.params.token.toHex()
  const token = getOrCreateToken(tokenAddress, event)
  let rebase = Rebase.load(token.id)

  if (rebase === null) {
    createRebase(token.id)
  } else {
    rebase.elastic = rebase.elastic.plus(event.params.feeAmount)
    rebase.save()
  }
}