import { Address, Bytes } from '@graphprotocol/graph-ts'
import { assert, clearStore, test } from 'matchstick-as/assembly/index'
import { ACCESS_CONTROLS_ADDRESS } from '../src/constants/addresses'
import { ADMIN, MINTER, OPERATOR, SMART_CONTRACT } from '../src/constants/index'
import { onRoleAdminChanged, onRoleGranted, onRoleRevoked } from '../src/mappings/access-controls'
import { createRoleAdminChangedEvent, createRoleGrantedEvent, createRoleRevokedEvent } from './mocks'

const ALICE = Address.fromString('0x00000000000000000000000000000000000471ce')
const CONTRACT = Address.fromString('0x0000000000000000000000000000000000000101')
const BOB = Address.fromString('0x0000000000000000000000000000000000000b0b')
function setup(): void {}
function cleanup(): void {
  clearStore()
}

test('User is granted admin role, AccessControl role count is updated', () => {
  setup()

  let roleGrantedEvent = createRoleGrantedEvent(Bytes.fromByteArray(ADMIN), ALICE, BOB)
  let roleRevokedEvent = createRoleRevokedEvent(Bytes.fromByteArray(ADMIN), ALICE, BOB)

  onRoleGranted(roleGrantedEvent)

  assert.fieldEquals('Role', ADMIN.toHexString(), 'id', ADMIN.toHexString())
  assert.fieldEquals('User', ALICE.toHex(), 'id', ALICE.toHex())
  assert.fieldEquals('User', ALICE.toHex(), 'role', ADMIN.toHexString())

  assert.fieldEquals('AccessControl', ACCESS_CONTROLS_ADDRESS.toHex(), 'adminCount', '1')
  assert.fieldEquals('AccessControl', ACCESS_CONTROLS_ADDRESS.toHex(), 'operatorCount', '0')
  assert.fieldEquals('AccessControl', ACCESS_CONTROLS_ADDRESS.toHex(), 'minterCount', '0')
  assert.fieldEquals('AccessControl', ACCESS_CONTROLS_ADDRESS.toHex(), 'smartContractCount', '0')

  onRoleRevoked(roleRevokedEvent)

  assert.fieldEquals('User', ALICE.toHex(), 'role', '')
  assert.fieldEquals('AccessControl', ACCESS_CONTROLS_ADDRESS.toHex(), 'adminCount', '0')

  cleanup()
})

test('User is granted minter role, then revoked', () => {
  setup()

  let roleGrantedEvent = createRoleGrantedEvent(Bytes.fromByteArray(MINTER), ALICE, BOB)
  let roleRevokedEvent = createRoleRevokedEvent(Bytes.fromByteArray(MINTER), ALICE, BOB)

  onRoleGranted(roleGrantedEvent)

  assert.fieldEquals('Role', MINTER.toHexString(), 'id', MINTER.toHexString())
  assert.fieldEquals('User', ALICE.toHex(), 'id', ALICE.toHex())
  assert.fieldEquals('User', ALICE.toHex(), 'role', MINTER.toHexString())

  assert.fieldEquals('AccessControl', ACCESS_CONTROLS_ADDRESS.toHex(), 'adminCount', '0')
  assert.fieldEquals('AccessControl', ACCESS_CONTROLS_ADDRESS.toHex(), 'operatorCount', '0')
  assert.fieldEquals('AccessControl', ACCESS_CONTROLS_ADDRESS.toHex(), 'minterCount', '1')
  assert.fieldEquals('AccessControl', ACCESS_CONTROLS_ADDRESS.toHex(), 'smartContractCount', '0')

  onRoleRevoked(roleRevokedEvent)

  assert.fieldEquals('User', ALICE.toHex(), 'role', '')
  assert.fieldEquals('AccessControl', ACCESS_CONTROLS_ADDRESS.toHex(), 'minterCount', '0')

  cleanup()
})

test('User is granted operator role, then revoked', () => {
  setup()

  let roleGrantedEvent = createRoleGrantedEvent(Bytes.fromByteArray(OPERATOR), ALICE, BOB)
  let roleRevokedEvent = createRoleRevokedEvent(Bytes.fromByteArray(OPERATOR), ALICE, BOB)

  onRoleGranted(roleGrantedEvent)

  assert.fieldEquals('Role', OPERATOR.toHexString(), 'id', OPERATOR.toHexString())
  assert.fieldEquals('User', ALICE.toHex(), 'id', ALICE.toHex())
  assert.fieldEquals('User', ALICE.toHex(), 'role', OPERATOR.toHexString())

  assert.fieldEquals('AccessControl', ACCESS_CONTROLS_ADDRESS.toHex(), 'adminCount', '0')
  assert.fieldEquals('AccessControl', ACCESS_CONTROLS_ADDRESS.toHex(), 'operatorCount', '1')
  assert.fieldEquals('AccessControl', ACCESS_CONTROLS_ADDRESS.toHex(), 'minterCount', '0')
  assert.fieldEquals('AccessControl', ACCESS_CONTROLS_ADDRESS.toHex(), 'smartContractCount', '0')

  onRoleRevoked(roleRevokedEvent)

  assert.fieldEquals('User', ALICE.toHex(), 'role', '')
  assert.fieldEquals('AccessControl', ACCESS_CONTROLS_ADDRESS.toHex(), 'operatorCount', '0')

  cleanup()
})

test('Contract is granted smart-contract role, then revoked', () => {
  setup()

  let roleGrantedEvent = createRoleGrantedEvent(Bytes.fromByteArray(SMART_CONTRACT), CONTRACT, BOB)
  let roleRevokedEvent = createRoleRevokedEvent(Bytes.fromByteArray(SMART_CONTRACT), CONTRACT, BOB)

  onRoleGranted(roleGrantedEvent)

  assert.fieldEquals('Role', SMART_CONTRACT.toHexString(), 'id', SMART_CONTRACT.toHexString())
  assert.fieldEquals('User', CONTRACT.toHex(), 'id', CONTRACT.toHex())
  assert.fieldEquals('User', CONTRACT.toHex(), 'role', SMART_CONTRACT.toHexString())

  assert.fieldEquals('AccessControl', ACCESS_CONTROLS_ADDRESS.toHex(), 'adminCount', '0')
  assert.fieldEquals('AccessControl', ACCESS_CONTROLS_ADDRESS.toHex(), 'operatorCount', '0')
  assert.fieldEquals('AccessControl', ACCESS_CONTROLS_ADDRESS.toHex(), 'minterCount', '0')
  assert.fieldEquals('AccessControl', ACCESS_CONTROLS_ADDRESS.toHex(), 'smartContractCount', '1')

  onRoleRevoked(roleRevokedEvent)

  assert.fieldEquals('User', CONTRACT.toHex(), 'role', '')
  assert.fieldEquals('AccessControl', ACCESS_CONTROLS_ADDRESS.toHex(), 'smartContractCount', '0')

  cleanup()
})

test('Admin role is changed and creates a new role', () => {
  setup()
  let newAdminRole = Bytes.fromHexString('0x0000000000000000000000000000000000000000000000000000000000000001')
  let roleGrantedEvent = createRoleGrantedEvent(Bytes.fromByteArray(ADMIN), ALICE, BOB)
  let adminChangeEvent = createRoleAdminChangedEvent(
    Bytes.fromByteArray(ADMIN),
    Bytes.fromByteArray(ADMIN),
    Bytes.fromByteArray(newAdminRole)
  )

  onRoleGranted(roleGrantedEvent)

  assert.fieldEquals('AccessControl', ACCESS_CONTROLS_ADDRESS.toHex(), 'adminCount', '1')

  onRoleAdminChanged(adminChangeEvent)
  assert.fieldEquals('Role', newAdminRole.toHexString(), 'id', newAdminRole.toHexString())
  assert.fieldEquals('AccessControl', ACCESS_CONTROLS_ADDRESS.toHex(), 'adminCount', '2')

  cleanup()
})
