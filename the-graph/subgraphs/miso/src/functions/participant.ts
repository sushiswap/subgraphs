import { BigInt } from '@graphprotocol/graph-ts'
import { Participant } from '../../generated/schema'
import { getOrCreateUser } from './user'
import { getAuction } from './auction'

export function getOrCreateParticipant(user: string, _auction: string): Participant {
  let participant = Participant.load(user + '-' + _auction)

  getOrCreateUser(user)

  if (participant === null) {
    participant = new Participant(user + '-' + _auction)

    participant.auction = _auction
    participant.user = user

    participant.save()

    const auction = getAuction(_auction)
    auction.participantCount = auction.participantCount.plus(BigInt.fromI32(1))
    auction.save()
  }

  return participant as Participant
}
