import { BigInt } from '@graphprotocol/graph-ts'
import {
  LogCreateVesting as CreateVestingEvent,
  LogStopVesting as CancelVestingEvent,
  LogWithdraw as WithdrawalEvent,
} from '../../generated/FuroVesting/FuroVesting'
import { Vesting } from '../../generated/schema'
import { ACTIVE, CANCELLED } from '../constants'
import { increaseVestingCount } from './furo'
import { getOrCreateToken } from './token'
import { getOrCreateUser } from './user'

export function getOrCreateVesting(id: BigInt): Vesting {
  let vesting = Vesting.load(id.toString())

  if (vesting === null) {
    vesting = new Vesting(id.toString())
    increaseVestingCount()
  }
  vesting.save()

  return vesting as Vesting
}

export function createVesting(event: CreateVestingEvent): Vesting {
  const vestId = BigInt.fromString('1') // FIXME: hardcoded id for now, Sarang will add id to event later
  let vesting = getOrCreateVesting(vestId) //getOrCreateVesting(event.params.vestId)
  let recipient = getOrCreateUser(event.params.recipient, event)
  let owner = getOrCreateUser(event.params.owner, event)
  let token = getOrCreateToken(event.params.token.toHex(), event)

  vesting.recipient = recipient.id
  vesting.createdBy = owner.id
  vesting.token = token.id
  vesting.cliffDuration = event.params.cliffDuration
  vesting.stepDuration = event.params.stepDuration
  vesting.steps = event.params.steps
  vesting.cliffAmount = event.params.cliffAmount
  vesting.stepAmount = event.params.stepAmount
  vesting.schedule = vestId.toString()
  vesting.status = ACTIVE
  vesting.fromBentoBox = true //FIXME: waiting for Sarang to update the event, later use event.params.fromBentoBox
  vesting.startedAt = event.params.start
  vesting.expiresAt = calculateExpirationDate(vesting)
  vesting.totalAmount = calculateTotalAmount(vesting)

  vesting.createdAtBlock = event.block.number
  vesting.createdAtTimestamp = event.block.timestamp
  vesting.save()

  return vesting
}

export function cancelVesting(event: CancelVestingEvent): Vesting {
  let vesting = getOrCreateVesting(event.params.vestId)
  vesting.status = CANCELLED
  vesting.cancelledAtTimestamp = event.block.timestamp
  vesting.cancelledAtBlock = event.block.number
  vesting.save()

  return vesting
}

export function withdrawFromVesting(event: WithdrawalEvent): Vesting {
  let vesting = getOrCreateVesting(event.params.vestId)
  vesting.withdrawnAmount = vesting.withdrawnAmount.plus(BigInt.fromString('1337420')) // FIXME: event missing amount, update this after contract is updated
  vesting.save()

  return vesting
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
