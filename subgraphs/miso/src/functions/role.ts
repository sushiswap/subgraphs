import { Bytes } from '@graphprotocol/graph-ts'

import { Role } from '../../generated/schema'

export function createRole(id: Bytes): Role {
  const role = new Role(id.toHex())
  role.save()
  return role
}

export function getRole(id: Bytes): Role {
  return Role.load(id.toHex()) as Role
}

export function getOrCreateRole(id: Bytes): Role {
  let role = Role.load(id.toHex())

  if (role === null) {
    role = createRole(id)
  }

  return role as Role
}
