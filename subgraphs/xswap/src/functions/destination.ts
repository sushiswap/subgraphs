
import { Destination } from '../../generated/schema'
import {
  StargateSushiXSwapDst as DestinationEvent
} from '../../generated/Xswap/Xswap'

export function createDestination(event: DestinationEvent): Destination {

  const destination = new Destination(event.transaction.hash.toHex())
  destination.failed = event.params.failed
  destination.createdAtTimestamp = event.block.timestamp
  destination.createdAtBlock = event.block.number
  destination.save()
  return destination
}


