import { Unsubscription as UnsubscriptionEvent } from '../../generated/PositionManager/PositionManager'
import { Unsubscribe } from '../../generated/schema'
import { loadTransaction } from '../utils'
import { eventId, positionId } from '../utils/id'

// The subgraph handler must have this signature to be able to handle events,
// however, we invoke a helper in order to inject dependencies for unit tests.
export function handleUnsubscription(event: UnsubscriptionEvent): void {
  handleUnsubscriptionHelper(event)
}

export function handleUnsubscriptionHelper(event: UnsubscriptionEvent): void {
  const unsubscription = new Unsubscribe(eventId(event.transaction.hash, event.logIndex))

  const transaction = loadTransaction(event)

  unsubscription.tokenId = event.params.tokenId
  unsubscription.address = event.params.subscriber.toHexString()
  unsubscription.origin = event.transaction.from.toHexString()
  unsubscription.transaction = transaction.id
  unsubscription.logIndex = event.logIndex
  unsubscription.timestamp = transaction.timestamp
  unsubscription.position = positionId(event.params.tokenId)

  unsubscription.save()
}
