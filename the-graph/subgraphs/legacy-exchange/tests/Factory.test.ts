import { Address } from '@graphprotocol/graph-ts'
import { test, assert, clearStore } from 'matchstick-as/assembly/index'
import { onPairCreated } from '../src/mappings/factory'
import { FACTORY_ADDRESS } from '../src/constants/addresses'
import { createPairCreatedEvent, getOrCreateTokenMock } from './mocks'

test('When the first pair is created, the factory entity is created as well', () => {
  const usdc = Address.fromString('0xb7a4f3e9097c08da09517b5ab877f7a917224ede')
  const usdt = Address.fromString('0x07de306ff27a2b630b1141956844eb1552b956b5')
  const pair = Address.fromString('0x0000000000000000000000000000000000000420')

  let pairCreatedEvent = createPairCreatedEvent(FACTORY_ADDRESS, usdc, usdt, pair)
 
  getOrCreateTokenMock(usdc.toHex(), 6, 'USD Coin', 'USDC')
  getOrCreateTokenMock(usdt.toHex(), 6, 'Tether USD', 'USDT')
  onPairCreated(pairCreatedEvent)

  assert.fieldEquals('Factory', FACTORY_ADDRESS.toHex(), 'id', FACTORY_ADDRESS.toHex())
  assert.fieldEquals('Factory', FACTORY_ADDRESS.toHex(), 'pairCount', '1')

  clearStore()
})
