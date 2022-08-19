import { PairCreated } from "../../generated/Factory/Factory";
import { Pair as PairTemplate } from '../../generated/templates'

export function onPairCreated(event: PairCreated): void {
    PairTemplate.create(event.params.pair)
  }
  