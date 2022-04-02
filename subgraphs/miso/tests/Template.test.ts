import { Address, BigInt } from '@graphprotocol/graph-ts'
import { assert, clearStore, test } from 'matchstick-as/assembly/index'
import { onAuctionTemplateAdded, onAuctionTemplateRemoved } from '../src/mappings/market'
import { createAuctionTemplateAddedEvent, createAuctionTemplateRemovedEvent } from './mocks'

const FACTORY_ADDRESS = Address.fromString('0x0000000000000000000000000000000000000420')
const AUCTION_ADDRESS = Address.fromString('0x0000000000000000000000000000000000000101')
function setup(): void {}
function cleanup(): void {
  clearStore()
}

test('Template can be added and removed', () => {
  setup()
  let templateId = BigInt.fromString('1')
  let addTemplateEvent = createAuctionTemplateAddedEvent(FACTORY_ADDRESS, AUCTION_ADDRESS, templateId)
  let removeTemplateEvent = createAuctionTemplateRemovedEvent(FACTORY_ADDRESS, AUCTION_ADDRESS, templateId)

  // When: template is added
  onAuctionTemplateAdded(addTemplateEvent)

  // Then: the expected fields are set
  assert.fieldEquals('Template', AUCTION_ADDRESS.toHex(), 'id', AUCTION_ADDRESS.toHex())
  assert.fieldEquals('Template', AUCTION_ADDRESS.toHex(), 'factory', FACTORY_ADDRESS.toHex())
  assert.fieldEquals('Template', AUCTION_ADDRESS.toHex(), 'block', addTemplateEvent.block.number.toString())
  assert.fieldEquals('Template', AUCTION_ADDRESS.toHex(), 'timestamp', addTemplateEvent.block.timestamp.toString())
  assert.fieldEquals('Template', AUCTION_ADDRESS.toHex(), 'removed', 'false')

  // When: the 'remove template' event is triggered
  onAuctionTemplateRemoved(removeTemplateEvent)

  // Then: the template is (soft) deleted
  assert.fieldEquals('Template', AUCTION_ADDRESS.toHex(), 'removed', 'true')

  cleanup()
})
