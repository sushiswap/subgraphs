import { BigInt } from '@graphprotocol/graph-ts'
import { Participant } from '../../generated/schema'
import { getAuction } from './auction'
import { getOrCreateUser } from './user'

export function getOrCreateParticipant(user: string, _auction: string): Participant {
  let participant = Participant.load(getParticipantId(user, _auction))

  getOrCreateUser(user)

  if (participant === null) {
    participant = new Participant(getParticipantId(user, _auction))

    participant.auction = _auction
    participant.user = user

    participant.save()

    const auction = getAuction(_auction)
    auction.participantCount = auction.participantCount.plus(BigInt.fromI32(1))
    auction.save()
  }

  return participant as Participant
}

export function getParticipantId(user: string, auction: string): string {
  return user.concat(':').concat(auction)
}
