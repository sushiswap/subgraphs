import { PairCreated } from '../../generated/Factory/Factory'
import { createPair, getOrCreateVersion } from '../functions'

export function onPairCreated(event: PairCreated): void {
  getOrCreateVersion()
  createPair(event)
}
