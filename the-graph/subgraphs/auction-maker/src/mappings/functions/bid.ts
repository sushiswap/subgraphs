import { BigInt, ethereum } from '@graphprotocol/graph-ts'
import { Bid } from '../../../generated/schema'
import { increaseBidCount } from './auction-maker'

export function createBid(userId: string, amount: BigInt, event: ethereum.Event): Bid {
  const bid = new Bid(event.transaction.hash.toHex())

  bid.user = userId
  bid.amount = amount
  bid.createdAtBlock = event.block.number
  bid.createdAtTimestamp = event.block.timestamp
  bid.save()

  increaseBidCount()

  return bid
}
