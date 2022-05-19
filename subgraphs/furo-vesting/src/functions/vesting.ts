import { BigInt } from '@graphprotocol/graph-ts'
import {
  CancelVesting as CancelVestingEvent,
  CreateVesting as CreateVestingEvent,
  Withdraw as WithdrawEvent,
  Transfer as TransferEvent,
} from '../../generated/FuroVesting/FuroVesting'
import { Vesting } from '../../generated/schema'
import { ACTIVE, CANCELLED, ZERO_ADDRESS } from '../constants'
import { increaseVestingCount } from './furo-vesting'
import { getOrCreateToken } from './token'
import { getOrCreateUser } from './user'

export function getOrCreateVesting(id: BigInt): Vesting {
  let vesting = Vesting.load(id.toString())

  if (vesting === null) {
    vesting = new Vesting(id.toString())
    increaseVestingCount()
    vesting.save()
  }

  return vesting as Vesting
}

export function createVesting(event: CreateVestingEvent): Vesting {
  const vestId = event.params.vestId

  let vesting = getOrCreateVesting(vestId)
  let recipient = getOrCreateUser(event.params.recipient, event)
  let owner = getOrCreateUser(event.params.owner, event)
  let token = getOrCreateToken(event.params.token.toHex(), event)

  vesting.recipient = recipient.id
  vesting.createdBy = owner.id
  vesting.token = token.id
  vesting.cliffDuration = event.params.cliffDuration
  vesting.stepDuration = event.params.stepDuration
  vesting.steps = event.params.steps
  vesting.cliffAmount = event.params.cliffShares
  vesting.stepAmount = event.params.stepShares
  vesting.schedule = vestId.toString()
  vesting.status = ACTIVE
  vesting.fromBentoBox = event.params.fromBentoBox
  vesting.startedAt = event.params.start
  vesting.expiresAt = calculateExpirationDate(vesting)
  vesting.totalAmount = calculateTotalAmount(vesting)
  vesting.txHash = event.transaction.hash.toHex()

  vesting.createdAtBlock = event.block.number
  vesting.createdAtTimestamp = event.block.timestamp
  vesting.modifiedAtBlock = event.block.number
  vesting.modifiedAtTimestamp = event.block.timestamp
  vesting.save()

  return vesting
}

export function cancelVesting(event: CancelVestingEvent): Vesting {
  let vesting = getOrCreateVesting(event.params.vestId)
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
  let vesting = getOrCreateVesting(event.params.vestId)
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
  let vesting = getOrCreateVesting(event.params.id)
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

function calculateTotalAmount(vest: Vesting): BigInt {
  const totalStepSum = vest.steps.times(vest.stepAmount)

  return vest.cliffAmount.plus(totalStepSum)
}
