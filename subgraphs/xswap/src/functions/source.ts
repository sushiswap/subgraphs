
import { Source } from '../../generated/schema'
import {
  StargateSushiXSwapSrc as SourceEvent
} from '../../generated/Xswap/Xswap'
import { createPayload } from './payload'

export function createSource(event: SourceEvent): Source {
  const id = event.transaction.hash.toHex()
  const payload = createPayload(event)
  const source = new Source(id)
  source.sourcePayload = payload.id
  source.createdAtTimestamp = event.block.timestamp
  source.createdAtBlock = event.block.number
  source.save()
  return source
}


