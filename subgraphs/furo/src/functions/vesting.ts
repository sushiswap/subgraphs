import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts'
import {
  CancelVesting as CancelVestingEvent,
  CreateVesting as CreateVestingEvent, Transfer as TransferEvent, Withdraw as WithdrawEvent
} from '../../generated/FuroVesting/FuroVesting'

import {
  CancelVesting as CancelVestingEvent1_1,
  CreateVesting as CreateVestingEvent1_1, Transfer as TransferEvent1_1, Withdraw as WithdrawVestingEvent1_1
} from '../../generated/FuroVesting1_1/FuroVesting'
import { Vesting } from '../../generated/schema'
import { ACTIVE, CANCELLED, ZERO_ADDRESS } from '../constants'
import { increaseVestingCount } from './global'
import { getOrCreateRebase, toElastic } from './rebase'
import { getOrCreateToken } from './token'
import { getOrCreateUser } from './user'

export function getVesting(contractAddress: Address, id: BigInt): Vesting {
  return Vesting.load(contractAddress.toHex().concat("-").concat(id.toString())) as Vesting
}

export function createVesting<T extends ethereum.Event>(event: T): Vesting {
  if (event instanceof CreateVestingEvent || event instanceof CreateVestingEvent1_1) {
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
  } else {
    throw new Error('Invalid event type, expected CreateVestingEvent or CreateVestingEvent1_1')
  }
}

export function cancelVesting<T extends ethereum.Event>(event: T): Vesting {
  if (event instanceof CancelVestingEvent || event instanceof CancelVestingEvent1_1) {
    let vesting = getVesting(event.address, event.params.vestId)
    vesting.status = CANCELLED
    vesting.withdrawnAmount = vesting.withdrawnAmount.plus(event.params.recipientAmount)
    vesting.modifiedAtBlock = event.block.number
    vesting.modifiedAtTimestamp = event.block.timestamp
    vesting.cancelledAtTimestamp = event.block.timestamp
    vesting.cancelledAtBlock = event.block.number
    vesting.save()

    return vesting
  } else {
    throw new Error('Invalid event type, expected CancelVestingEvent or CancelVestingEvent1_1')
  }
}

export function withdrawFromVesting<T extends ethereum.Event>(event: T): Vesting {
  if (event instanceof WithdrawEvent || event instanceof WithdrawVestingEvent1_1) {
    let vesting = getVesting(event.address, event.params.vestId)
    vesting.withdrawnAmount = vesting.withdrawnAmount.plus(event.params.amount)
    vesting.modifiedAtBlock = event.block.number
    vesting.modifiedAtTimestamp = event.block.timestamp
    vesting.save()

    return vesting
  } else {
    throw new Error('Invalid event type, expected WithdrawEvent or WithdrawVestingEvent1_1')
  }
}

export function transferVesting<T extends ethereum.Event>(event: T): void {
  if (event instanceof TransferEvent || event instanceof TransferEvent1_1) {
    if (!isValidTransfer(event)) {
      return
    }

    let recipient = getOrCreateUser(event.params.to, event)
    let vesting = getVesting(event.address, event.params.id)
    vesting.recipient = recipient.id
    vesting.modifiedAtBlock = event.block.number
    vesting.modifiedAtTimestamp = event.block.timestamp
    vesting.save()
  } else {
    throw new Error('Invalid event type, expected TransferEvent or TransferEvent1_1')
  }
}

/**
 * Validate that the transfer is NOT a mint or burn transaction
 * @param event
 * @returns boolean
 */
function isValidTransfer<T extends ethereum.Event>(event: T): boolean {
  if (event instanceof TransferEvent || event instanceof TransferEvent1_1) {
  return !event.params.from.equals(ZERO_ADDRESS) && !event.params.to.equals(ZERO_ADDRESS)
  } else {
    throw new Error('Invalid event type, expected TransferEvent or TransferEvent1_1')
  }
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
