import { RoleGranted, RoleRevoked, RoleAdminChanged } from '../../generated/AccessControls/AccessControls'
import { getOrCreateAccessControls, getOrCreateRole } from '../functions'
import { log } from '@graphprotocol/graph-ts'

export function onRoleAdminChanged(event: RoleAdminChanged): void {
  log.info('[AccessControls] onRoleAdminChanged...', [event.params.role.toString()])
  const accessControls = getOrCreateAccessControls()
  log.info('[AccessControls] onRoleAdminChanged... got access controls', [accessControls.id])
  const role = getOrCreateRole(event.params.role)
  role.save()
  log.info('[AccessControls] onRoleAdminChanged completed...', [role.id])
}

export function onRoleGranted(event: RoleGranted): void {
  log.info('[AccessControls] onRoleGranted...', [event.params.role.toString()])
  const accessControls = getOrCreateAccessControls()
  log.info('[AccessControls] onRoleGranted... got access controls', [accessControls.id])
  const role = getOrCreateRole(event.params.role)
  log.info('[AccessControls] onRoleGranted completed...', [role.id])
}

export function onRoleRevoked(event: RoleRevoked): void {
  log.info('[AccessControls] onRoleRevoked...', [event.params.role.toString()])
  const accessControls = getOrCreateAccessControls()
  log.info('[AccessControls] onRoleRevoked... got access controls', [accessControls.id])
  const role = getOrCreateRole(event.params.role)
  log.info('[AccessControls] onRoleRevoked completed...', [role.id])
}
