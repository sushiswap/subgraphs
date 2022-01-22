import { Address, log } from '@graphprotocol/graph-ts'
import { AccessControls } from '../../generated/schema'
import { AccessControls as AccessControlsContract } from '../../generated/AccessControls/AccessControls'
import { ACCESS_CONTROLS_ADDRESS } from '../constants/addresses'
import { createRole } from './role'

export function createAccessControls(id: Address = ACCESS_CONTROLS_ADDRESS): AccessControls {
  log.info('[AccessControls] createAccessControls for id {}', [id.toHex()])

  // const contract = AccessControlsContract.bind(id)

  // Add default roles
  // createRole(contract.DEFAULT_ADMIN_ROLE())
  // createRole(contract.MINTER_ROLE())
  // createRole(contract.OPERATOR_ROLE())
  // createRole(contract.SMART_CONTRACT_ROLE())

  const accessControls = new AccessControls(id.toHex())
  accessControls.save()

  log.info('[AccessControls] createAccessControls completed... {}', [accessControls.id])

  return accessControls
}

export function getOrCreateAccessControls(id: Address = ACCESS_CONTROLS_ADDRESS): AccessControls {
  log.info('[AccessControls] getOrCreateAccessControls for id', [id.toHex()])

  let accessControls = AccessControls.load(id.toHex())

  if (accessControls === null) {
    accessControls = createAccessControls()
  }

  log.info('[AccessControls] getOrCreateAccessControls completed... {}', [accessControls.id])

  return accessControls as AccessControls
}
