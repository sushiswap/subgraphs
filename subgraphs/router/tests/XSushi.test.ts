import { Address, BigInt, Bytes } from '@graphprotocol/graph-ts'
import { assert, clearStore, test } from 'matchstick-as/assembly/index'
import { ADDRESS_ZERO, XSUSHI } from '../src/constants'
import { XSUSHI_ADDRESS } from '../src/constants'
import { onSushiTransfer, onTransfer } from '../src/mappings/xsushi'
import { createSushiTransferEvent, createTransferEvent } from './mocks'

function cleanup(): void {
  clearStore()
}

test('XSushi counts/supplies updates on transactions', () => {
  cleanup()
  const bob = Address.fromString('0x0000000000000000000000000000000000000b0b')
  const amount = BigInt.fromString('1337')
  let mintEvent = createTransferEvent(ADDRESS_ZERO, bob, amount)
  let sushiStakeEvent = createSushiTransferEvent(bob, XSUSHI_ADDRESS, amount)
  mintEvent.transaction.hash = Address.fromString('0x0000000000000000000000000000000000000001') as Bytes
  sushiStakeEvent.transaction.hash = Address.fromString('0x0000000000000000000000000000000000000001') as Bytes
  const harvestAmount = BigInt.fromString('337')
  let burnEvent = createTransferEvent(bob, ADDRESS_ZERO, harvestAmount)
  let sushiHarvestEvent = createSushiTransferEvent(XSUSHI_ADDRESS, bob, harvestAmount)
  burnEvent.transaction.hash = Address.fromString('0x0000000000000000000000000000000000000002') as Bytes
  sushiHarvestEvent.transaction.hash = Address.fromString('0x0000000000000000000000000000000000000002') as Bytes

  // When: staking sushi
  onTransfer(mintEvent)
  onSushiTransfer(sushiStakeEvent)

  // Then: count fields are increased
  assert.fieldEquals('XSushi', XSUSHI, 'transactionCount', '1')
  assert.fieldEquals('XSushi', XSUSHI, 'userCount', '2')

  // And: supply is increased
  assert.fieldEquals('XSushi', XSUSHI, 'sushiSupply', '0.000000000000001337')
  assert.fieldEquals('XSushi', XSUSHI, 'xSushiSupply', '0.000000000000001337')

  // When: harvesting sushi
  onTransfer(burnEvent)
  onSushiTransfer(sushiHarvestEvent)

  // Then: the transaction count increase and userCount remains
  assert.fieldEquals('XSushi', XSUSHI, 'transactionCount', '2')
  assert.fieldEquals('XSushi', XSUSHI, 'userCount', '2')

  // And: the total supply is decreased
  assert.fieldEquals('XSushi', XSUSHI, 'sushiSupply', '0.000000000000001')
  assert.fieldEquals('XSushi', XSUSHI, 'xSushiSupply', '0.000000000000001')

  cleanup()
})

test('sushi staked', () => {
  cleanup()
  const reciever = Address.fromString('0x0000000000000000000000000000000000000b0b')
  const amount = BigInt.fromString('1337')
  let mintEvent = createTransferEvent(ADDRESS_ZERO, reciever, amount)
  let sushiStakeEvent = createSushiTransferEvent(reciever, XSUSHI_ADDRESS, amount)
  mintEvent.transaction.hash = Address.fromString('0x0000000000000000000000000000000000000001') as Bytes
  sushiStakeEvent.transaction.hash = Address.fromString('0x0000000000000000000000000000000000000001') as Bytes

  onTransfer(mintEvent)
  onSushiTransfer(sushiStakeEvent)

  assert.fieldEquals('XSushi', XSUSHI, 'sushiStaked', '0.000000000000001337')

  cleanup()
})

test('sushi harvested', () => {
  cleanup()
  const amount = BigInt.fromString('1337')
  const bob = Address.fromString('0x0000000000000000000000000000000000000b0b')
  let mintEvent = createTransferEvent(ADDRESS_ZERO, bob, amount)
  let sushiStakeEvent = createSushiTransferEvent(bob, XSUSHI_ADDRESS, amount)
  mintEvent.transaction.hash = Address.fromString('0x0000000000000000000000000000000000000001') as Bytes
  sushiStakeEvent.transaction.hash = Address.fromString('0x0000000000000000000000000000000000000001') as Bytes
  const harvestAmount = BigInt.fromString('337')
  let burnEvent = createTransferEvent(bob, ADDRESS_ZERO, harvestAmount)
  let sushiHarvestEvent = createSushiTransferEvent(XSUSHI_ADDRESS, bob, harvestAmount)
  burnEvent.transaction.hash = Address.fromString('0x0000000000000000000000000000000000000002') as Bytes
  sushiHarvestEvent.transaction.hash = Address.fromString('0x0000000000000000000000000000000000000002') as Bytes
  onTransfer(mintEvent)
  onSushiTransfer(sushiStakeEvent)

  onTransfer(burnEvent)
  onSushiTransfer(sushiHarvestEvent)

  assert.fieldEquals('XSushi', XSUSHI, 'sushiHarvested', '0.000000000000000337')

  cleanup()
})

test('sushi transfer to sushibar increases fee amount and total sushi supply', () => {
  cleanup()
  const sender = Address.fromString('0x00000000000000000000000000000000000a71ce')
  const amount = BigInt.fromString('1337')
  let transferEvent = createSushiTransferEvent(sender, XSUSHI_ADDRESS, amount)
  onSushiTransfer(transferEvent)

  assert.fieldEquals('XSushi', XSUSHI, 'totalFeeAmount', '0.000000000000001337')
  assert.fieldEquals('XSushi', XSUSHI, 'sushiSupply', '0.000000000000001337')

  onSushiTransfer(transferEvent)
  assert.fieldEquals('XSushi', XSUSHI, 'totalFeeAmount', '0.000000000000002674')
  assert.fieldEquals('XSushi', XSUSHI, 'sushiSupply', '0.000000000000002674')
  cleanup()
})

test('xSushiMinted and xSushiBurned is updated on mint/burn transactions', () => {
  cleanup()
  const amount = BigInt.fromString('1337')
  const reciever = Address.fromString('0x0000000000000000000000000000000000000b0b')
  let mintEvent = createTransferEvent(ADDRESS_ZERO, reciever, amount)
  let burnEvent = createTransferEvent(reciever, ADDRESS_ZERO, amount)
  burnEvent.transaction.hash = Address.fromString('0xA16081F360e3847006dB660bae1c6d1b2e17eC2B')

  onTransfer(mintEvent)
  assert.fieldEquals('XSushi', XSUSHI, 'xSushiMinted', '0.000000000000001337')

  onTransfer(burnEvent)
  assert.fieldEquals('XSushi', XSUSHI, 'xSushiBurned', '0.000000000000001337')

  cleanup()
})

test('ratio test', () => {
  cleanup()
  const aliceStakeAmount = BigInt.fromString('1000')
  const aliceHarvestAmount = BigInt.fromString('1333')
  const bobStakeAmount = BigInt.fromString('500')
  const bobHarvestAmount = BigInt.fromString('667')
  const feeAmount = BigInt.fromString('500')
  const alice = Address.fromString('0x00000000000000000000000000000000000a71ce')
  const bob = Address.fromString('0x0000000000000000000000000000000000000b0b')
  const pool = Address.fromString('0x0000000000000000000000000000000000000001')
  let aliceMintEvent = createTransferEvent(ADDRESS_ZERO, alice, aliceStakeAmount)
  let aliceStakeEvent = createSushiTransferEvent(alice, XSUSHI_ADDRESS, aliceStakeAmount)
  aliceMintEvent.transaction.hash = Address.fromString('0x0000000000000000000000000000000000000001') as Bytes
  aliceStakeEvent.transaction.hash = Address.fromString('0x0000000000000000000000000000000000000001') as Bytes

  let aliceBurnEvent = createTransferEvent(alice, ADDRESS_ZERO, aliceStakeAmount)
  let aliceHarvestEvent = createSushiTransferEvent(XSUSHI_ADDRESS, alice, aliceHarvestAmount)
  aliceBurnEvent.transaction.hash = Address.fromString('0x0000000000000000000000000000000000000002')
  aliceHarvestEvent.transaction.hash = Address.fromString('0x0000000000000000000000000000000000000002')

  let bobMintEvent = createTransferEvent(ADDRESS_ZERO, bob, bobStakeAmount)
  let bobStakeEvent = createSushiTransferEvent(bob, XSUSHI_ADDRESS, bobStakeAmount)
  bobMintEvent.transaction.hash = Address.fromString('0x0000000000000000000000000000000000000003')
  bobStakeEvent.transaction.hash = Address.fromString('0x0000000000000000000000000000000000000003')

  let bobBurnEvent = createTransferEvent(bob, ADDRESS_ZERO, bobStakeAmount)
  let bobHarvestEvent = createSushiTransferEvent(XSUSHI_ADDRESS, bob, bobHarvestAmount)
  bobMintEvent.transaction.hash = Address.fromString('0x0000000000000000000000000000000000000004')
  bobHarvestEvent.transaction.hash = Address.fromString('0x0000000000000000000000000000000000000004')

  let feeEvent = createSushiTransferEvent(pool, XSUSHI_ADDRESS, feeAmount)
  feeEvent.transaction.hash = Address.fromString('0x0000000000000000000000000000000000000005')

  // When: alice deposits 1000 and bob 500
  onTransfer(aliceMintEvent)
  onSushiTransfer(aliceStakeEvent)
  assert.fieldEquals('XSushi', XSUSHI, 'xSushiSushiRatio', '1')
  assert.fieldEquals('XSushi', XSUSHI, 'sushiXsushiRatio', '1')

  onTransfer(bobMintEvent)
  onSushiTransfer(bobStakeEvent)

  // Then: the ratios remains unchanged
  assert.fieldEquals('XSushi', XSUSHI, 'xSushiSushiRatio', '1')
  assert.fieldEquals('XSushi', XSUSHI, 'sushiXsushiRatio', '1')

  // When: 500 in fees are transferred
  onSushiTransfer(feeEvent)

  // Then: the ratios are updated
  assert.fieldEquals('XSushi', XSUSHI, 'xSushiSushiRatio', '0.75')
  assert.fieldEquals('XSushi', XSUSHI, 'sushiXsushiRatio', '1.333333333333333333333333333333333')

  // When: alice harvests
  onTransfer(aliceBurnEvent)
  onSushiTransfer(aliceHarvestEvent)

  // Then: the ratio changes
  assert.fieldEquals('XSushi', XSUSHI, 'xSushiSushiRatio', '0.7496251874062968515742128935532234')
  assert.fieldEquals('XSushi', XSUSHI, 'sushiXsushiRatio', '1.334')

  // When: bob harvests
  onTransfer(bobBurnEvent)
  onSushiTransfer(bobHarvestEvent)

  // Then: the ratios changes back to 1
  assert.fieldEquals('XSushi', XSUSHI, 'xSushiSushiRatio', '1')
  assert.fieldEquals('XSushi', XSUSHI, 'sushiXsushiRatio', '1')

  cleanup()
})
