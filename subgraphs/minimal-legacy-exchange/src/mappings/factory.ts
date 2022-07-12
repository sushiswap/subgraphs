
import { PairCreated } from '../../generated/Factory/Factory'
import { createPair } from '../functions'

export function onPairCreated(event: PairCreated): void {
  createPair(event.params)
}
