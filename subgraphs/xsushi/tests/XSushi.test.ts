import { Address, BigInt, Bytes } from '@graphprotocol/graph-ts'
import { assert, test, clearStore, logStore } from 'matchstick-as/assembly/index'
import { ADDRESS_ZERO, XSUSHI } from '../src/constants'
import { XSUSHI_ADDRESS } from '../src/constants/addresses'
import { onSushiTransfer, onTransfer } from '../src/mappings/xsushi'
import { createSushiTransferEvent, createTransferEvent } from './mocks'

function cleanup(): void {
  clearStore()
}

test('XSushi counts/supplies updates on transactions', () => {
  const bob = Address.fromString('0x0000000000000000000000000000000000000b0b')
  const amount = BigInt.fromString('1337')

  // When: the zero-address make a transaction (mint)
  let mintEvent = createTransferEvent(ADDRESS_ZERO, bob, amount)
  mintEvent.transaction.hash = Address.fromString('0x0000000000000000000000000000000000000001') as Bytes
  onTransfer(mintEvent)

  // Then: count fields are increased
  assert.fieldEquals('XSushi', XSUSHI, 'transactionCount', '1')
  assert.fieldEquals('XSushi', XSUSHI, 'userCount', '2')

  // And: supply is increased
  assert.fieldEquals('XSushi', XSUSHI, 'totalSushiSupply', amount.toString())
  assert.fieldEquals('XSushi', XSUSHI, 'totalXsushiSupply', amount.toString())

  // When: the zero-address recieves a transaction (burn)
  let burnEvent = createTransferEvent(bob, ADDRESS_ZERO, BigInt.fromString('337'))
  burnEvent.transaction.hash = Address.fromString('0x0000000000000000000000000000000000000002') as Bytes
  onTransfer(burnEvent)

  // Then: the transaction count increase and userCount remains
  assert.fieldEquals('XSushi', XSUSHI, 'transactionCount', '2')
  assert.fieldEquals('XSushi', XSUSHI, 'userCount', '2')

  // And: the total supply is decreased
  assert.fieldEquals('XSushi', XSUSHI, 'totalSushiSupply', '1000')
  assert.fieldEquals('XSushi', XSUSHI, 'totalXsushiSupply', '1000')

  cleanup()
})

test('sushi staked is increased on mint', () => {
  const reciever = Address.fromString('0x0000000000000000000000000000000000000b0b')
  const amount = BigInt.fromString('1337')
  let transferEvent = createTransferEvent(ADDRESS_ZERO, reciever, amount)

  onTransfer(transferEvent)

  assert.fieldEquals('XSushi', XSUSHI, 'sushiStaked', amount.toString())

  cleanup()
})

test('sushi harvested is increased on burn', () => {
  const amount = BigInt.fromString('1337')
  const reciever = Address.fromString('0x0000000000000000000000000000000000000b0b')
  let mintEvent = createTransferEvent(ADDRESS_ZERO, reciever, amount)
  let burnEvent = createTransferEvent(reciever, ADDRESS_ZERO, amount)
  burnEvent.transaction.hash = Address.fromString('0xA16081F360e3847006dB660bae1c6d1b2e17eC2B')
  onTransfer(mintEvent)
  onTransfer(burnEvent)

  assert.fieldEquals('XSushi', XSUSHI, 'sushiHarvested', amount.toString())

  cleanup()
})

test('sushi transfer to sushibar increases fee amount and total sushi supply', () => {
  const sender = Address.fromString('0x00000000000000000000000000000000000a71ce')
  const amount = BigInt.fromString('1337')
  let transferEvent = createSushiTransferEvent(sender, XSUSHI_ADDRESS, amount)
  onSushiTransfer(transferEvent)

  assert.fieldEquals('XSushi', XSUSHI, 'totalFeeAmount', amount.toString())
  assert.fieldEquals('XSushi', XSUSHI, 'totalSushiSupply', amount.toString())

  onSushiTransfer(transferEvent)
  assert.fieldEquals('XSushi', XSUSHI, 'totalFeeAmount', amount.times(BigInt.fromString('2')).toString())
  assert.fieldEquals('XSushi', XSUSHI, 'totalSushiSupply', amount.times(BigInt.fromString('2')).toString())
  cleanup()
})



test('xSushiMinted and xSushiBurned is updated on mint/burn transactions', () => {
    const amount = BigInt.fromString('1337')
    const reciever = Address.fromString('0x0000000000000000000000000000000000000b0b')
    let mintEvent = createTransferEvent(ADDRESS_ZERO, reciever, amount)
    let burnEvent = createTransferEvent(reciever, ADDRESS_ZERO, amount)
    burnEvent.transaction.hash = Address.fromString('0xA16081F360e3847006dB660bae1c6d1b2e17eC2B')

    onTransfer(mintEvent)
    assert.fieldEquals('XSushi', XSUSHI, 'xSushiMinted', amount.toString())
  
    onTransfer(burnEvent)
    assert.fieldEquals('XSushi', XSUSHI, 'xSushiBurned', amount.toString())
  
    cleanup()
  })


test('ratio test', () => {
    const aliceAmount = BigInt.fromString('1000')
    const bobAmount = BigInt.fromString('500')
    const feeAmount = BigInt.fromString('500')
    const alice = Address.fromString('0x00000000000000000000000000000000000a71ce')
    const bob = Address.fromString('0x0000000000000000000000000000000000000b0b')
    const pool = Address.fromString('0x0000000000000000000000000000000000000001')
    let aliceStakeEvent = createTransferEvent(ADDRESS_ZERO, alice, aliceAmount)
    let aliceHarvestEvent = createTransferEvent(alice, ADDRESS_ZERO, aliceAmount)
    aliceHarvestEvent.transaction.hash = Address.fromString('0xA16081F360e3847006dB660bae1c6d1b2e17eC2B')
    let bobStakeEvent = createTransferEvent(ADDRESS_ZERO, bob, bobAmount)
    bobStakeEvent.transaction.hash = Address.fromString('0xA16081F360e3847006dB660bae1c6d1b2e17eC2C')
    let bobHarvestEvent = createTransferEvent(bob, ADDRESS_ZERO, bobAmount)
    bobHarvestEvent.transaction.hash = Address.fromString('0xA16081F360e3847006dB660bae1c6d1b2e17eC2D')
    let transferEvent = createSushiTransferEvent(pool, XSUSHI_ADDRESS, feeAmount)
    transferEvent.transaction.hash = Address.fromString('0xA16081F360e3847006dB660bae1c6d1b2e17eC2E')

    // When: alice deposits 1000 and bob 500
    onTransfer(aliceStakeEvent)
    assert.fieldEquals('XSushi', XSUSHI, 'xSushiSushiRatio', '1')
    assert.fieldEquals('XSushi', XSUSHI, 'sushiXsushiRatio', '1')

    onTransfer(bobStakeEvent)

    // Then: the ratios remains unchanged
    assert.fieldEquals('XSushi', XSUSHI, 'xSushiSushiRatio', '1')
    assert.fieldEquals('XSushi', XSUSHI, 'sushiXsushiRatio', '1')

    // When: 500 in fees are transferred
    onSushiTransfer(transferEvent)

    // Then: the ratios are updated
    assert.fieldEquals('XSushi', XSUSHI, 'xSushiSushiRatio', '0.75')
    assert.fieldEquals('XSushi', XSUSHI, 'sushiXsushiRatio', '1.333333333333333333333333333333333')

    // When: alice harvests
    onTransfer(aliceHarvestEvent)

    // Then: the ratio changes
    assert.fieldEquals('XSushi', XSUSHI, 'xSushiSushiRatio', '0.7496251874062968515742128935532234')
    assert.fieldEquals('XSushi', XSUSHI, 'sushiXsushiRatio', '1.334')
   
    // When: bob harvests
    onTransfer(bobHarvestEvent)

    // Then: the ratios changes back to 1
    assert.fieldEquals('XSushi', XSUSHI, 'xSushiSushiRatio', '1')
    assert.fieldEquals('XSushi', XSUSHI, 'sushiXsushiRatio', '1')


    cleanup()
  })