import { getPair } from '../functions'
import {
  Sync as SyncEvent
} from '../../generated/templates/Pair/Pair'

export function onSync(event: SyncEvent): void {
  const pair = getPair(event.address.toHex())
  pair.reserve0 = event.params.reserve0
  pair.reserve1 = event.params.reserve1
  pair.save()
}
