import { BigInt, log } from '@graphprotocol/graph-ts'
import {
  CancelVesting as CancelVestingEvent,
  CreateVesting as CreateVestingEvent,
  Withdraw as WithdrawEvent,
  Transfer as TransferEvent,
  FuroVesting,
} from '../../generated/FuroVesting/FuroVesting'
import { Vesting } from '../../generated/schema'
import { ACTIVE, CANCELLED, FURO_VESTING_ADDRESS, ZERO_ADDRESS } from '../constants'
import { increaseVestingCount } from './global'
import { getOrCreateRebase, toElastic } from './rebase'
import { getOrCreateToken } from './token'
import { getOrCreateUser } from './user'

export function getVesting(id: BigInt): Vesting {
  return Vesting.load(id.toString()) as Vesting
}

export function createVesting(event: CreateVestingEvent): Vesting {
  // The event.params.owner is the Router contract, but that's being transferred so we need to read it off the contract
  const contract = FuroVesting.bind(FURO_VESTING_ADDRESS)
  const owner = contract.vests(event.params.vestId).getOwner()
  let createdBy = getOrCreateUser(owner, event)
  let vesting = new Vesting(event.params.vestId.toString())
  let recipient = getOrCreateUser(event.params.recipient, event)
  let token = getOrCreateToken(event.params.token.toHex(), event)
  let rebase = getOrCreateRebase(event.params.token.toHex())
  let initialShares = calculateTotalShares(event.params.steps, event.params.stepShares, event.params.cliffShares)
  
  token.liquidityShares = token.liquidityShares.plus(initialShares)
  token.save()
  vesting.recipient = recipient.id
  vesting.createdBy = createdBy.id
  vesting.token = token.id
  vesting.cliffDuration = event.params.cliffDuration
  vesting.stepDuration = event.params.stepDuration
  vesting.steps = event.params.steps
  vesting.cliffShares = event.params.cliffShares
  vesting.stepShares = event.params.stepShares
  vesting.status = ACTIVE
  vesting.fromBentoBox = event.params.fromBentoBox
  vesting.startedAt = event.params.start
  vesting.expiresAt = calculateExpirationDate(vesting)
  vesting.remainingShares = initialShares
  vesting.initialShares = initialShares
  vesting.initialAmount = toElastic(rebase, initialShares, true)
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
  let rebase = getOrCreateRebase(event.params.token.toHex())
  let vesting = getVesting(event.params.vestId)
  const token = getOrCreateToken(vesting.token, event)
  token.liquidityShares = token.liquidityShares.minus(vesting.remainingShares)
  token.save()

  vesting.status = CANCELLED
  vesting.withdrawnAmount = toElastic(rebase, vesting.withdrawnAmount.plus(event.params.recipientAmount), true)
  vesting.remainingShares = BigInt.fromU32(0)
  vesting.modifiedAtBlock = event.block.number
  vesting.modifiedAtTimestamp = event.block.timestamp
  vesting.cancelledAtTimestamp = event.block.timestamp
  vesting.cancelledAtBlock = event.block.number
  vesting.save()

  return vesting
}

export function withdrawFromVesting(event: WithdrawEvent): Vesting {
  let rebase = getOrCreateRebase(event.params.token.toHex())
  let vesting = getVesting(event.params.vestId)
  vesting.withdrawnAmount = vesting.withdrawnAmount.plus(toElastic(rebase, event.params.amount, true))
  vesting.remainingShares = vesting.remainingShares.minus(event.params.amount)
  vesting.modifiedAtBlock = event.block.number
  vesting.modifiedAtTimestamp = event.block.timestamp
  vesting.save()

  const token = getOrCreateToken(vesting.token, event)
  token.liquidityShares = token.liquidityShares.minus(event.params.amount)
  token.save()

  return vesting
}

export function transferVesting(event: TransferEvent): void {
  if (!isValidTransfer(event)) {
    return
  }

  let recipient = getOrCreateUser(event.params.to, event)
  let vesting = getVesting(event.params.id)
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

function calculateTotalShares(steps: BigInt, stepShares: BigInt, cliffShares: BigInt): BigInt {
  return cliffShares.plus(steps.times(stepShares))
}
