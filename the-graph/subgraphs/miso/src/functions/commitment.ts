import { Commitment } from '../../generated/schema'
import { AddedCommitment } from '../../generated/templates/MisoAuction/MisoAuction'
import { getOrCreateParticipant } from './participant'

export function createCommitment(event: AddedCommitment): Commitment {
  const commitment = new Commitment(
    event.address.toHex() +
      event.params.addr.toHex() +
      event.block.number.toString() +
      event.transactionLogIndex.toString()
  )

  getOrCreateParticipant(event.params.addr.toHex(), event.address.toHex())

  commitment.auction = event.address.toHex()
  commitment.participant = event.address.toHex() + '-' + event.params.addr.toHex()
  commitment.user = event.params.addr.toHex()
  commitment.amount = event.params.commitment
  commitment.block = event.block.number
  commitment.timestamp = event.block.timestamp

  commitment.save()

  return commitment as Commitment
}
