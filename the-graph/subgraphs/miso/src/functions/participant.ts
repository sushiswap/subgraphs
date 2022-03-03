import { BigInt } from '@graphprotocol/graph-ts'
import { Participant } from '../../generated/schema'
import { getAuction } from './auction'
import { getOrCreateUser } from './user'

export function getOrCreateParticipant(userAddress: string, auctionAddress: string): Participant {
  let participant = Participant.load(getParticipantId(userAddress, auctionAddress))

  getOrCreateUser(userAddress)

  if (participant === null) {
    participant = new Participant(getParticipantId(userAddress, auctionAddress))

    participant.auction = auctionAddress
    participant.user = userAddress

    participant.save()

    const auction = getAuction(auctionAddress)
    auction.participantCount = auction.participantCount.plus(BigInt.fromI32(1))
    auction.save()
  }

  return participant as Participant
}

export function getParticipantId(user: string, auction: string): string {
  return user.concat(':').concat(auction)
}
