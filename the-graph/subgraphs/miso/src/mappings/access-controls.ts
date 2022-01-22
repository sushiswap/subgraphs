import { RoleGranted, RoleRevoked, RoleAdminChanged } from '../../generated/AccessControls/AccessControls'
import { getOrCreateAccessControls, getOrCreateRole } from '../functions'
import { BigInt, log } from '@graphprotocol/graph-ts'
import { ADMIN, MINTER, OPERATOR, SMART_CONTRACT } from '../constants'

export function onRoleAdminChanged(event: RoleAdminChanged): void {
  log.info('[AccessControls] onRoleAdminChanged... {}', [event.params.role.toHex()])
  const accessControls = getOrCreateAccessControls()
  log.info('[AccessControls] onRoleAdminChanged... got access controls {}', [accessControls.id])
  const role = getOrCreateRole(event.params.role)
  accessControls.adminCount = accessControls.adminCount.plus(BigInt.fromI32(1))
  role.save()
  log.info('[AccessControls] onRoleAdminChanged completed... {}', [role.id])
}

export function onRoleGranted(event: RoleGranted): void {
  log.info('[AccessControls] onRoleGranted... {}', [event.params.role.toHex()])
  const accessControls = getOrCreateAccessControls()
  log.info('[AccessControls] onRoleGranted... got access controls {}', [accessControls.id])
  const role = getOrCreateRole(event.params.role)
  if (event.params.role == ADMIN) {
    accessControls.adminCount = accessControls.adminCount.plus(BigInt.fromI32(1))
  } else if (event.params.role == MINTER) {
    accessControls.minterCount = accessControls.minterCount.plus(BigInt.fromI32(1))
  } else if (event.params.role == OPERATOR) {
    accessControls.operatorCount = accessControls.operatorCount.plus(BigInt.fromI32(1))
  } else if (event.params.role == SMART_CONTRACT) {
    accessControls.smartContractCount = accessControls.smartContractCount.plus(BigInt.fromI32(1))
  }
  accessControls.save()
  log.info('[AccessControls] onRoleGranted completed... {}', [role.id])
}

export function onRoleRevoked(event: RoleRevoked): void {
  log.info('[AccessControls] onRoleRevoked... {}', [event.params.role.toHex()])
  const accessControls = getOrCreateAccessControls()
  log.info('[AccessControls] onRoleRevoked... got access controls {}', [accessControls.id])
  const role = getOrCreateRole(event.params.role)
  if (event.params.role == ADMIN) {
    accessControls.adminCount = accessControls.adminCount.minus(BigInt.fromI32(1))
  } else if (event.params.role == MINTER) {
    accessControls.minterCount = accessControls.minterCount.minus(BigInt.fromI32(1))
  } else if (event.params.role == OPERATOR) {
    accessControls.operatorCount = accessControls.operatorCount.minus(BigInt.fromI32(1))
  } else if (event.params.role == SMART_CONTRACT) {
    accessControls.smartContractCount = accessControls.smartContractCount.minus(BigInt.fromI32(1))
  }
  accessControls.save()
  log.info('[AccessControls] onRoleRevoked completed... {}', [role.id])
}
