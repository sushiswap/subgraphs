
import { PairCreated } from '../../generated/Factory/Factory'
import { createPool } from '../functions'

export function onPairCreated(event: PairCreated): void {
  createPool(event.params)
}
