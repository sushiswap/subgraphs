import {
  LogDeposit,
  LogFlashLoan,
  LogStrategyLoss,
  LogStrategyProfit,
  LogWithdraw,
} from '../../generated/BentoBox/BentoBox'
import { getOrCreateToken, convertTokenToDecimal, getOrCreateRebase } from '../functions'

export function onLogDeposit(event: LogDeposit): void {
  const tokenAddress = event.params.token.toHex()
  const token = getOrCreateToken(tokenAddress)

  const share = convertTokenToDecimal(event.params.share, token.decimals)
  const amount = convertTokenToDecimal(event.params.amount, token.decimals)

  const rebase = getOrCreateRebase(tokenAddress)
  rebase.base = rebase.base.plus(share)
  rebase.elastic = rebase.elastic.plus(amount)
  rebase.save()
}

export function onLogWithdraw(event: LogWithdraw): void {
  const tokenAddress = event.params.token.toHex()
  const token = getOrCreateToken(tokenAddress)

  const share = convertTokenToDecimal(event.params.share, token.decimals)
  const amount = convertTokenToDecimal(event.params.amount, token.decimals)

  const rebase = getOrCreateRebase(tokenAddress)
  rebase.base = rebase.base.minus(share)
  rebase.elastic = rebase.elastic.minus(amount)
  rebase.save()
}

export function onLogStrategyProfit(event: LogStrategyProfit): void {
  const tokenAddress = event.params.token.toHex()
  const token = getOrCreateToken(tokenAddress)

  const amount = convertTokenToDecimal(event.params.amount, token.decimals)

  const rebase = getOrCreateRebase(tokenAddress)
  rebase.elastic = rebase.elastic.plus(amount)
  rebase.save()
}

export function onLogStrategyLoss(event: LogStrategyLoss): void {
  const tokenAddress = event.params.token.toHex()
  const token = getOrCreateToken(tokenAddress)

  const amount = convertTokenToDecimal(event.params.amount, token.decimals)

  const rebase = getOrCreateRebase(tokenAddress)
  rebase.elastic = rebase.elastic.minus(amount)
  rebase.save()
}

export function onLogFlashLoan(event: LogFlashLoan): void {
  const tokenAddress = event.params.token.toHex()
  const token = getOrCreateToken(tokenAddress)

  const feeAmount = convertTokenToDecimal(event.params.feeAmount, token.decimals)

  const rebase = getOrCreateRebase(tokenAddress)
  rebase.elastic = rebase.elastic.plus(feeAmount)
  rebase.save()
}
