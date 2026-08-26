import { Transfer as TransferEvent } from '../../generated/PositionManager/PositionManager'
import { Position, Transfer } from '../../generated/schema'
import { loadTransaction } from '../utils'
import { eventId, positionId } from '../utils/id'

// The subgraph handler must have this signature to be able to handle events,
// however, we invoke a helper in order to inject dependencies for unit tests.
export function handleTransfer(event: TransferEvent): void {
  handleTransferHelper(event)
}

export function handleTransferHelper(event: TransferEvent): void {
  const tokenId = positionId(event.params.id)
  const from = event.params.from
  const to = event.params.to

  let position = Position.load(tokenId)
  if (position === null) {
    position = new Position(tokenId)
    position.tokenId = event.params.id
    position.origin = event.transaction.from.toHexString()
    position.createdAtTimestamp = event.block.timestamp
  }

  position.owner = to.toHexString()

  const transaction = loadTransaction(event)

  const transfer = new Transfer(eventId(event.transaction.hash, event.logIndex))
  transfer.tokenId = event.params.id
  transfer.from = from.toHexString()
  transfer.to = to.toHexString()
  transfer.origin = event.transaction.from.toHexString()
  transfer.transaction = transaction.id
  transfer.logIndex = event.logIndex
  transfer.timestamp = transaction.timestamp
  transfer.position = position.id

  position.save()
  transfer.save()
}
