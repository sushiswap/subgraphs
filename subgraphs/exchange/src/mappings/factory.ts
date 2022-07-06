import { PairCreated } from '../../generated/Factory/Factory'
import { BIG_INT_ONE } from '../constants'
import { createPair, getOrCreateFactory } from '../functions'

export function onPairCreated(event: PairCreated): void {
  const factory = getOrCreateFactory()
  factory.pairCount = factory.pairCount.plus(BIG_INT_ONE)
  factory.save()

  createPair(event.params)
}
