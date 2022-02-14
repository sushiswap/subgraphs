import { BigInt } from '@graphprotocol/graph-ts'
import { Participant } from '../../generated/schema'
import { getOrCreateUser } from './user'
import { getAuction } from './auction'

export function getOrCreateParticipant(userAddress: string, auctionAddress: string): Participant {
  let participant = Participant.load(userAddress + '-' + auctionAddress)

  getOrCreateUser(userAddress)

  if (participant === null) {
    participant = new Participant(userAddress + '-' + auctionAddress)

    participant.auction = auctionAddress
    participant.user = userAddress

    participant.save()

    const auction = getAuction(auctionAddress)
    auction.participantCount = auction.participantCount.plus(BigInt.fromI32(1))
    auction.save()
  }

  return participant as Participant
}
