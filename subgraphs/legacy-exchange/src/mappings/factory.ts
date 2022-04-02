import { createPair, getOrCreateFactory } from '../functions'

import { BigInt } from '@graphprotocol/graph-ts'
import { PairCreated } from '../../generated/Factory/Factory'

export function onPairCreated(event: PairCreated): void {
  const factory = getOrCreateFactory()
  factory.pairCount = factory.pairCount.plus(BigInt.fromI32(1))
  factory.save()

  createPair(event.params)
}
