import { getParticipantId } from '.'
import { Commitment } from '../../generated/schema'
import { AddedCommitment } from '../../generated/templates/MisoAuction/MisoAuction'
import { getOrCreateParticipant } from './participant'

export function createCommitment(event: AddedCommitment): Commitment {
  const commitment = new Commitment(getCommitmentId(event))

  getOrCreateParticipant(event.params.addr.toHex(), event.address.toHex())

  commitment.auction = event.address.toHex()
  commitment.participant = getParticipantId(event.params.addr.toHex(), event.address.toHex())
  commitment.user = event.params.addr.toHex()
  commitment.amount = event.params.commitment
  commitment.transactionHash = event.transaction.hash
  commitment.block = event.block.number
  commitment.timestamp = event.block.timestamp

  commitment.save()

  return commitment as Commitment
}

/**
 * these variables are used to create an id of Commitment
 * address + param.addr + block number + txLogIndex
 * @param event
 * @returns
 */
export function getCommitmentId(event: AddedCommitment): string {
  return event.address
    .toHex()
    .concat(event.params.addr.toHex())
    .concat(event.block.number.toString())
    .concat(event.transactionLogIndex.toString())
}
