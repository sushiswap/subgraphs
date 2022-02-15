import { Address, BigInt, log } from '@graphprotocol/graph-ts'
import { AccessControl as AccessControls } from '../../generated/schema'
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
  accessControls.adminCount = BigInt.fromI32(0)
  accessControls.minterCount = BigInt.fromI32(0)
  accessControls.operatorCount = BigInt.fromI32(0)
  accessControls.smartContractCount = BigInt.fromI32(0)
  accessControls.save()

  log.info('[AccessControls] createAccessControls completed... {}', [accessControls.id])

  return accessControls
}

export function getOrCreateAccessControls(id: Address = ACCESS_CONTROLS_ADDRESS): AccessControls {
  log.info('[AccessControls] getOrCreateAccessControls for id {}', [id.toHex()])

  let accessControls = AccessControls.load(id.toHex())

  if (accessControls === null) {
    log.info('[AccessControls] getOrCreateAccessControls no access control found for id {}', [id.toHex()])
    accessControls = createAccessControls(id)
  }

  log.info('[AccessControls] getOrCreateAccessControls completed for id {}', [accessControls.id])

  return accessControls as AccessControls
}
