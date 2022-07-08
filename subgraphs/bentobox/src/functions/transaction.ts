import { BigInt, ethereum } from '@graphprotocol/graph-ts'
import { DEPOSIT, TRANSFER, WITHDRAW } from '../constants'
import { LogDeposit, LogTransfer, LogWithdraw } from '../../generated/BentoBox/BentoBox'

import { Transaction } from '../../generated/schema'
import { getBentoBoxKpi } from './bentobox-kpi'

export function getTransactionId(event: ethereum.Event): string {
  return event.transaction.hash.toHex() + '-' + event.logIndex.toString()
}

export function createTransaction<T extends ethereum.Event>(event: T): Transaction {
  const transaction = new Transaction(getTransactionId(event))

  transaction.bentoBox = event.address.toHex()

  const bentoBoxKpi = getBentoBoxKpi()

  if (event instanceof LogDeposit) {
    transaction.type = DEPOSIT
    transaction.from = event.params.from.toHex()
    transaction.to = event.params.to.toHex()
    transaction.token = event.params.token.toHex()
    transaction.share = event.params.share
    transaction.amount = event.params.amount
    bentoBoxKpi.depositCount = bentoBoxKpi.depositCount.plus(BigInt.fromU32(1))
  } else if (event instanceof LogWithdraw) {
    transaction.type = WITHDRAW
    transaction.from = event.params.from.toHex()
    transaction.to = event.params.to.toHex()
    transaction.token = event.params.token.toHex()
    transaction.share = event.params.share
    transaction.amount = event.params.amount
    bentoBoxKpi.withdrawCount = bentoBoxKpi.withdrawCount.plus(BigInt.fromU32(1))
  } else if (event instanceof LogTransfer) {
    transaction.type = TRANSFER
    transaction.from = event.params.from.toHex()
    transaction.to = event.params.to.toHex()
    transaction.token = event.params.token.toHex()
    transaction.share = event.params.share
    transaction.amount = BigInt.fromU32(0)
    bentoBoxKpi.transferCount = bentoBoxKpi.transferCount.plus(BigInt.fromU32(1))
  }

  transaction.block = event.block.number
  transaction.timestamp = event.block.timestamp
  transaction.save()

  bentoBoxKpi.transactionCount = bentoBoxKpi.transactionCount.plus(BigInt.fromU32(1))
  bentoBoxKpi.save()

  return transaction
}
