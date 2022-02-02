import { Address, BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts'
import { assert, test } from 'matchstick-as/assembly/index'
import { clearStore } from 'matchstick-as/assembly/store'
import { ConstantProductPoolFactory, MasterDeployer } from '../generated/schema'
import {
  CONSTANT_PRODUCT_POOL_FACTORY_ADDRESS,
  MASTER_DEPLOYER_ADDRESS,
  WHITELISTED_TOKEN_ADDRESSES,
} from '../src/constants/addresses'
import { onAddToWhitelist, onDeployPool, onRemoveFromWhitelist } from '../src/mappings/master-deployer'
import {
  createAddToWhitelistEvent,
  createDeployPoolEvent,
  createRemoveWhitelistEvent,
  getOrCreateTokenMock,
} from './mocks'

const BENTOBOX_ADDRESS = Address.fromString('0xc381a85ed7C7448Da073b7d6C9d4cBf1Cbf576f0')
let constantProductPoolAddress = Address.fromString('0x0000000000000000000000000000000000000420')
let constantProductPoolFactoryAddress = CONSTANT_PRODUCT_POOL_FACTORY_ADDRESS.toHexString()
let constantProductPoolFactory: ConstantProductPoolFactory
let masterDeployerOwner = Address.fromString('0x0000000000000000000000000000000000001337')
let masterDeployer: MasterDeployer

function setup(): void {
  constantProductPoolFactory = new ConstantProductPoolFactory(constantProductPoolFactoryAddress)
  constantProductPoolFactory.pools = [constantProductPoolAddress.toHex()]
  constantProductPoolFactory.save()

  masterDeployer = new MasterDeployer(MASTER_DEPLOYER_ADDRESS.toHexString())
  masterDeployer.factories = [constantProductPoolFactory.id]
  masterDeployer.pools = [constantProductPoolAddress.toHex()]
  masterDeployer.owner = masterDeployerOwner
  masterDeployer.bento = BENTOBOX_ADDRESS
  masterDeployer.save()
}

function cleanup(): void {
  clearStore()
}

test('Can manage whitelisting and deploy a pool', () => {
  setup()
  let addWhitelistEvent = createAddToWhitelistEvent(CONSTANT_PRODUCT_POOL_FACTORY_ADDRESS, masterDeployerOwner)
  let deployData = createDeployData(WHITELISTED_TOKEN_ADDRESSES[0], WHITELISTED_TOKEN_ADDRESSES[1], false)
  let deployPoolEvent = createDeployPoolEvent(
    constantProductPoolAddress,
    MASTER_DEPLOYER_ADDRESS,
    CONSTANT_PRODUCT_POOL_FACTORY_ADDRESS,
    deployData
  )
  let removeWhitelistEvent = createRemoveWhitelistEvent(CONSTANT_PRODUCT_POOL_FACTORY_ADDRESS, masterDeployerOwner)

  onAddToWhitelist(addWhitelistEvent)
  assert.fieldEquals('WhitelistedFactory', constantProductPoolFactoryAddress, 'id', constantProductPoolFactoryAddress)

  getOrCreateTokenMock(WHITELISTED_TOKEN_ADDRESSES[0], 18, 'Wrapped Ether', 'WETH')
  getOrCreateTokenMock(WHITELISTED_TOKEN_ADDRESSES[1], 18, 'USD Coin', 'USDC')
  onDeployPool(deployPoolEvent)
  assert.fieldEquals(
    'ConstantProductPool',
    constantProductPoolAddress.toHex(),
    'id',
    constantProductPoolAddress.toHex()
  )

  let asset1 = constantProductPoolAddress.toHex() + ':asset:0'
  let asset2 = constantProductPoolAddress.toHex() + ':asset:1'
  assert.fieldEquals('ConstantProductPoolAsset', asset1, 'id', asset1)
  assert.fieldEquals('ConstantProductPoolAsset', asset2, 'id', asset2)

  onRemoveFromWhitelist(removeWhitelistEvent)
  assert.notInStore('WhitelistedFactory', constantProductPoolFactoryAddress)

  cleanup()
})

function createDeployData(tokenAddress1: string, tokenAddress2: string, twapEnabled: boolean): Bytes {
  let tupleArray: Array<ethereum.Value> = [
    ethereum.Value.fromAddress(Address.fromString(tokenAddress1)),
    ethereum.Value.fromAddress(Address.fromString(tokenAddress2)),
    ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(25)),
    ethereum.Value.fromBoolean(twapEnabled),
  ]
  return ethereum.encode(ethereum.Value.fromTuple(changetype<ethereum.Tuple>(tupleArray)))!
}
