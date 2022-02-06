import { PairCreated } from '../../generated/Factory/Factory'
import { getOrCreateFactory, createPair } from '../functions'
import { BigInt } from '@graphprotocol/graph-ts'

export function onPairCreated(event: PairCreated): void {
  const factory = getOrCreateFactory()

  createPair(event.params)

  factory.pairCount = factory.pairCount.plus(BigInt.fromI32(1))
  factory.save()
}
