import { Pair } from '../../generated/schema'
import { PairCreated } from '../../generated/Factory/Factory'
import { Pair as PairTemplate } from '../../generated/templates'

export function onPairCreated(event: PairCreated): void {
  const pair = new Pair(event.params.pair.toHex())
  pair.token0 = event.params.token0
  pair.token1 = event.params.token1
  pair.save()
  PairTemplate.create(event.params.pair)
}
