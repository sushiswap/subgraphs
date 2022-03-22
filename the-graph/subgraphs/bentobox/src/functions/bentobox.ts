import { Address } from '@graphprotocol/graph-ts'
import { BENTOBOX_ADDRESS } from '../constants'
import { BentoBox } from '../../generated/schema'

export function createBentoBox(id: Address = BENTOBOX_ADDRESS): BentoBox {
  const bentoBox = new BentoBox(id.toHex())
  bentoBox.save()
  return bentoBox
}

export function getBentoBox(id: Address = BENTOBOX_ADDRESS): BentoBox {
  return BentoBox.load(id.toHex()) as BentoBox
}

export function getOrCreateBentoBox(id: Address = BENTOBOX_ADDRESS): BentoBox {
  let bentoBox = BentoBox.load(id.toHex())

  if (bentoBox === null) {
    bentoBox = createBentoBox(id)
  }

  return bentoBox
}
