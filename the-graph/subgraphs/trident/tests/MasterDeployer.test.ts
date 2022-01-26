import { test, assert } from 'matchstick-as/assembly/index'
import { onAddToWhitelist, onDeployPool } from '../src/mappings/master-deployer'
import {
  CONSTANT_PRODUCT_POOL_FACTORY_ADDRESS,
  ADDRESS_ZERO,
  MASTER_DEPLOYER_ADDRESS,
  WHITELISTED_TOKEN_ADDRESSES,
} from '../src/constants/addresses'
import { createAddToWhitelistEvent, createDeployPoolEvent } from './mocks'
import { Address, BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts'
import { clearStore } from 'matchstick-as/assembly/store'
import { ConstantProductPoolFactory, MasterDeployer, Token, TokenPrice } from '../generated/schema'


const BENTOBOX_ADDRESS = Address.fromString('0xc381a85ed7C7448Da073b7d6C9d4cBf1Cbf576f0')
let constantProductPoolAddress = Address.fromString('0x0000000000000000000000000000000000000420')
let constantProductPoolFactoryAddress = CONSTANT_PRODUCT_POOL_FACTORY_ADDRESS.toHexString()
let constantProductPoolFactory: ConstantProductPoolFactory
let masterDeployerOwner = ADDRESS_ZERO
let masterDeployer: MasterDeployer

function setup(): void {
  constantProductPoolFactory = new ConstantProductPoolFactory(constantProductPoolFactoryAddress)
  constantProductPoolFactory.pools = [constantProductPoolAddress.toHex()]
  constantProductPoolFactory.save()

  createTokenAndPrice(WHITELISTED_TOKEN_ADDRESSES[0], [constantProductPoolAddress.toHex()])
  createTokenAndPrice(WHITELISTED_TOKEN_ADDRESSES[1], [constantProductPoolAddress.toHex()])

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

test('Can whitelist a factory and deploy a pool', () => {
  setup()

  let newAddToWhitelistEvent = createAddToWhitelistEvent(CONSTANT_PRODUCT_POOL_FACTORY_ADDRESS, masterDeployerOwner)
  let deployData = createDeployData(WHITELISTED_TOKEN_ADDRESSES[0], WHITELISTED_TOKEN_ADDRESSES[1], false)
  let newDeployPoolEvent = createDeployPoolEvent(
    constantProductPoolAddress,
    MASTER_DEPLOYER_ADDRESS,
    CONSTANT_PRODUCT_POOL_FACTORY_ADDRESS,
    deployData
  )

  onAddToWhitelist(newAddToWhitelistEvent)
  assert.fieldEquals('WhitelistedFactory', constantProductPoolFactoryAddress, 'id', constantProductPoolFactoryAddress)

  onDeployPool(newDeployPoolEvent)
  assert.fieldEquals(
    'ConstantProductPool',
    constantProductPoolAddress.toHex(),
    'id',
    constantProductPoolAddress.toHex()
  )

  cleanup()
})

function createTokenAndPrice(address: string, whitelistedPools: string[]): void {
  let token = new Token(address)
  token.price = '1'
  token.snapshots = ['1', '1']
  token.save()
  let tokenPrice = new TokenPrice(address)
  tokenPrice.whitelistedPools = whitelistedPools
  tokenPrice.save()
}

function createDeployData(tokenAddress1: string, tokenAddress2: string, twapEnabled: boolean): Bytes {
  let tupleArray: Array<ethereum.Value> = [
    ethereum.Value.fromAddress(Address.fromString(tokenAddress1)),
    ethereum.Value.fromAddress(Address.fromString(tokenAddress2)),
    ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(25)),
    ethereum.Value.fromBoolean(twapEnabled),
  ]
  return ethereum.encode(ethereum.Value.fromTuple(changetype<ethereum.Tuple>(tupleArray)))!
}
