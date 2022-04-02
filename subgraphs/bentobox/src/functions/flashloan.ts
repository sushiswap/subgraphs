import { BigInt } from '@graphprotocol/graph-ts'
import { FlashLoan } from '../../generated/schema'
import { LogFlashLoan } from '../../generated/BentoBox/BentoBox'
import { toDecimal } from '.'

export function createFlashLoan(event: LogFlashLoan, tokenDecimals: BigInt): FlashLoan {
  const flashLoan = new FlashLoan(getFlashLoanId(event))

  flashLoan.bentoBox = event.address.toHex()
  flashLoan.borrower = event.params.borrower
  flashLoan.receiver = event.params.receiver
  flashLoan.token = event.params.token.toHex()
  flashLoan.amount = toDecimal(event.params.amount, tokenDecimals)
  flashLoan.feeAmount = toDecimal(event.params.feeAmount, tokenDecimals)
  flashLoan.block = event.block.number
  flashLoan.timestamp = event.block.timestamp

  flashLoan.save()

  return flashLoan as FlashLoan
}

export function getFlashLoanId(event: LogFlashLoan): string {
  return event.transaction.hash.toHex().concat('-').concat(event.logIndex.toString())
}
