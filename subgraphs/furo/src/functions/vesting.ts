import { Address, BigInt } from '@graphprotocol/graph-ts'
import {
  CancelVesting as CancelVestingEvent,
  CreateVesting as CreateVestingEvent, Transfer as TransferEvent, Withdraw as WithdrawEvent
} from '../../generated/FuroVesting/FuroVesting'

import { Vesting } from '../../generated/schema'
import { ACTIVE, CANCELLED, ZERO_ADDRESS } from '../constants'
import { increaseVestingCount } from './global'
import { getOrCreateRebase, toElastic } from './rebase'
import { getOrCreateToken } from './token'
import { getOrCreateUser } from './user'

export function getVesting(contractAddress: Address, id: BigInt): Vesting {
  return Vesting.load(contractAddress.toHex().concat("-").concat(id.toString())) as Vesting
}

export function createVesting(event: CreateVestingEvent): Vesting {

  const vestId = event.address.toHex().concat("-").concat(event.params.vestId.toString())
  let vesting = new Vesting(vestId)

  let recipient = getOrCreateUser(event.params.recipient, event)
  let owner = getOrCreateUser(event.params.owner, event)
  let token = getOrCreateToken(event.params.token.toHex(), event)
  let rebase = getOrCreateRebase(event.params.token.toHex())
  let cliffAmount = event.params.cliffShares.gt(BigInt.fromU32(0))
    ? toElastic(rebase, event.params.cliffShares, true)
    : BigInt.fromU32(0)
  let stepAmount = event.params.stepShares.gt(BigInt.fromU32(0))
    ? toElastic(rebase, event.params.stepShares, true)
    : BigInt.fromU32(0)
  let initialAmount = calculateTotalAmount(event.params.steps, stepAmount, cliffAmount)
  vesting.contract = event.address.toHex()
  vesting.recipient = recipient.id
  vesting.createdBy = owner.id
  vesting.token = token.id
  vesting.cliffDuration = event.params.cliffDuration
  vesting.stepDuration = event.params.stepDuration
  vesting.steps = event.params.steps
  vesting.cliffAmount = event.params.cliffShares
  vesting.stepAmount = event.params.stepShares
  vesting.status = ACTIVE
  vesting.fromBentoBox = event.params.fromBentoBox
  vesting.startedAt = event.params.start
  vesting.expiresAt = calculateExpirationDate(vesting)
  vesting.totalAmount = initialAmount
  vesting.txHash = event.transaction.hash.toHex()
  vesting.transactionCount = BigInt.fromU32(0)
  vesting.withdrawnAmount = BigInt.fromU32(0)
  vesting.createdAtBlock = event.block.number
  vesting.createdAtTimestamp = event.block.timestamp
  vesting.modifiedAtBlock = event.block.number
  vesting.modifiedAtTimestamp = event.block.timestamp
  vesting.save()
  increaseVestingCount()

  return vesting
}

export function cancelVesting(event: CancelVestingEvent): Vesting {
  let vesting = getVesting(event.address, event.params.vestId)
  vesting.status = CANCELLED
  vesting.withdrawnAmount = vesting.withdrawnAmount.plus(event.params.recipientAmount)
  vesting.modifiedAtBlock = event.block.number
  vesting.modifiedAtTimestamp = event.block.timestamp
  vesting.cancelledAtTimestamp = event.block.timestamp
  vesting.cancelledAtBlock = event.block.number
  vesting.save()

  return vesting
}

export function withdrawFromVesting(event: WithdrawEvent): Vesting {
  let vesting = getVesting(event.address, event.params.vestId)
  vesting.withdrawnAmount = vesting.withdrawnAmount.plus(event.params.amount)
  vesting.modifiedAtBlock = event.block.number
  vesting.modifiedAtTimestamp = event.block.timestamp
  vesting.save()

  return vesting
}

export function transferVesting(event: TransferEvent): void {
  if (!isValidTransfer(event)) {
    return
  }

  let recipient = getOrCreateUser(event.params.to, event)
  let vesting = getVesting(event.address, event.params.id)
  vesting.recipient = recipient.id
  vesting.modifiedAtBlock = event.block.number
  vesting.modifiedAtTimestamp = event.block.timestamp
  vesting.save()
}

/**
 * Validate that the transfer is NOT a mint or burn transaction
 * @param event
 * @returns boolean
 */
function isValidTransfer(event: TransferEvent): boolean {
  return !event.params.from.equals(ZERO_ADDRESS) && !event.params.to.equals(ZERO_ADDRESS)
}

function calculateExpirationDate(vest: Vesting): BigInt {
  const startTime = vest.startedAt
  const cliffDuration = vest.cliffDuration
  const paymentDuration = vest.stepDuration.times(vest.steps)

  return startTime.plus(cliffDuration).plus(paymentDuration)
}

function calculateTotalAmount(steps: BigInt, stepAmount: BigInt, cliffAmount: BigInt): BigInt {
  return cliffAmount.plus(steps.times(stepAmount))
}
