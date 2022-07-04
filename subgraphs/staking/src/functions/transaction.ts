import { ethereum } from '@graphprotocol/graph-ts'
import { Claim as ClaimEvent, Stake as StakeEvent, Unstake as UnstakeEvent } from '../../generated/Staking/Staking'
import { CLAIM, STAKE, STAKING_CONTRACT_ADDRESS, UNSTAKE } from '../constants'
import { Incentive, Transaction } from '../../generated/schema'
import { increaseTransactionCount } from './global'
import { getOrCreateUser } from './user'

function getOrCreateTransaction(id: string, event: ethereum.Event): Transaction {
  let transaction = Transaction.load(id)

  if (transaction === null) {
    transaction = new Transaction(id)
    transaction.createdAtBlock = event.block.number
    transaction.createdAtTimestamp = event.block.timestamp
    transaction.txHash = event.transaction.hash.toHex()
  }

  return transaction as Transaction
}

export function createStakeTransaction(event: StakeEvent): Transaction {
  const count = increaseTransactionCount()
  const user = getOrCreateUser(event.params.user.toHex())
  const to = getOrCreateUser(STAKING_CONTRACT_ADDRESS.toHex())
  const transactionId = 'tx:'.concat(count.toString())
  let transaction = getOrCreateTransaction(transactionId, event)
  transaction.type = STAKE
  transaction.farm = event.params.token.toHex()
  transaction.amount = event.params.amount
  transaction.user = user.id
  transaction.to = to.id
  transaction.token = event.params.token.toHex()
  transaction.save()

  return transaction as Transaction
}

export function createUnstakeTransaction(farmId: string, event: UnstakeEvent): Transaction {
  const count = increaseTransactionCount()
  const user = getOrCreateUser(event.params.user.toHex())
  const to = getOrCreateUser(STAKING_CONTRACT_ADDRESS.toHex())
  const transactionId = 'tx:'.concat(count.toString())
  let transaction = getOrCreateTransaction(transactionId, event)
  transaction.type = UNSTAKE
  transaction.farm = farmId
  transaction.amount = event.params.amount
  transaction.user = user.id
  transaction.to = to.id
  transaction.token = event.params.token.toHex()
  transaction.save()

  return transaction as Transaction
}

export function createClaimTransaction(incentive: Incentive, event: ClaimEvent): Transaction {
  const count = increaseTransactionCount()
  const user = getOrCreateUser(event.params.user.toHex())
  const transactionId = 'tx:'.concat(count.toString())
  let transaction = getOrCreateTransaction(transactionId, event)
  transaction.type = CLAIM
  transaction.farm = incentive.farm
  transaction.incentive = incentive.id
  transaction.amount = event.params.amount
  transaction.user = user.id
  transaction.to = user.id
  transaction.token = incentive.rewardToken
  transaction.save()

  return transaction as Transaction
}
