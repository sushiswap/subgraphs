import { Address, Bytes } from '@graphprotocol/graph-ts'
import { assert, clearStore, test } from 'matchstick-as/assembly/index'
import { getMasterContractApprovalId } from '../src/functions/index'
import { onLogDeploy, onLogSetMasterContractApproval, onLogWhiteListMasterContract } from '../src/mappings/bentobox'
import { createDeployEvent, createMasterContractApprovalEvent, createWhitelistMasterContractEvent } from './mocks'

const MASTER_DEPLOYER = Address.fromString('0xc381a85ed7C7448Da073b7d6C9d4cBf1Cbf576f0')
const BOB = Address.fromString('0x0000000000000000000000000000000000000b0b')

function setup(): void {}

function cleanup(): void {
  clearStore()
}

test('onLogDeploy creates a clone', () => {
  setup()

  const clone = Address.fromString('0x00000000000000000000000000000000000c709e')
  let data = Bytes.fromUTF8('Some data')
  let deployEvent = createDeployEvent(MASTER_DEPLOYER, data, clone)

  onLogDeploy(deployEvent)

  assert.fieldEquals('Clone', clone.toHex(), 'id', clone.toHex())
  assert.fieldEquals('Clone', clone.toHex(), 'masterContract', MASTER_DEPLOYER.toHex())
  assert.fieldEquals('Clone', clone.toHex(), 'data', data.toHex())
  assert.fieldEquals('Clone', clone.toHex(), 'block', deployEvent.block.number.toString())
  assert.fieldEquals('Clone', clone.toHex(), 'timestamp', deployEvent.block.timestamp.toString())

  cleanup()
})

test('Creating a master contact also creates a bentobox', () => {
  setup()

  let whitelistMasterContractEvent = createWhitelistMasterContractEvent(MASTER_DEPLOYER, true)

  onLogWhiteListMasterContract(whitelistMasterContractEvent)

  assert.fieldEquals('MasterContract', MASTER_DEPLOYER.toHex(), 'id', MASTER_DEPLOYER.toHex())
  assert.fieldEquals('MasterContract', MASTER_DEPLOYER.toHex(), 'bentoBox', MASTER_DEPLOYER.toHex())
  assert.fieldEquals('BentoBox', MASTER_DEPLOYER.toHex(), 'id', MASTER_DEPLOYER.toHex())

  cleanup()
})

test('Master contract and bentobox is not created if approved param is set to false', () => {
  setup()

  let whitelistMasterContractEvent = createWhitelistMasterContractEvent(MASTER_DEPLOYER, false)

  onLogWhiteListMasterContract(whitelistMasterContractEvent)

  assert.notInStore('MasterContract', MASTER_DEPLOYER.toHex())
  assert.notInStore('BentoBox', MASTER_DEPLOYER.toHex())

  cleanup()
})

test('Master contract approval creates user and bumps bentobox userCount', () => {
  setup()

  let approved = true
  let whitelistMasterContractEvent = createWhitelistMasterContractEvent(MASTER_DEPLOYER, approved)

  onLogWhiteListMasterContract(whitelistMasterContractEvent)

  assert.notInStore('User', BOB.toHex())
  assert.fieldEquals('BentoBox', MASTER_DEPLOYER.toHex(), 'userCount', '0')

  let masterContractApprovalEvent = createMasterContractApprovalEvent(MASTER_DEPLOYER, BOB, approved)

  onLogSetMasterContractApproval(masterContractApprovalEvent)

  assert.fieldEquals('User', BOB.toHex(), 'id', BOB.toHex())
  assert.fieldEquals('BentoBox', MASTER_DEPLOYER.toHex(), 'userCount', '1')

  let masterContractApprovalId = getMasterContractApprovalId(masterContractApprovalEvent)
  assert.fieldEquals('MasterContractApproval', masterContractApprovalId, 'id', masterContractApprovalId)
  assert.fieldEquals('MasterContractApproval', masterContractApprovalId, 'masterContract', MASTER_DEPLOYER.toHex())
  assert.fieldEquals('MasterContractApproval', masterContractApprovalId, 'approved', approved.toString())

  cleanup()
})

test('BentoBox.masterCount is increases when a mastercontract is approved', () => {
  setup()
  let approved = true
  let whitelistMasterContractEvent = createWhitelistMasterContractEvent(MASTER_DEPLOYER, approved)

  onLogWhiteListMasterContract(whitelistMasterContractEvent)

  let masterContractApprovalEvent = createMasterContractApprovalEvent(MASTER_DEPLOYER, BOB, approved)

  assert.fieldEquals('BentoBox', MASTER_DEPLOYER.toHex(), 'masterContractCount', '0')

  onLogSetMasterContractApproval(masterContractApprovalEvent)

  assert.fieldEquals('BentoBox', MASTER_DEPLOYER.toHex(), 'masterContractCount', '1')

  cleanup()
})
