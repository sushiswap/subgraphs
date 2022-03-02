import { Address } from '@graphprotocol/graph-ts'
import { AccessControl as AccessControls } from '../../generated/schema'
import { ACCESS_CONTROLS_ADDRESS } from '../constants/addresses'

export function createAccessControls(id: Address = ACCESS_CONTROLS_ADDRESS): AccessControls {
  const accessControls = new AccessControls(id.toHex())
  accessControls.save()

  return accessControls
}

export function getOrCreateAccessControls(id: Address = ACCESS_CONTROLS_ADDRESS): AccessControls {
  let accessControls = AccessControls.load(id.toHex())

  if (accessControls === null) {
    accessControls = createAccessControls(id)
  }

  return accessControls as AccessControls
}
