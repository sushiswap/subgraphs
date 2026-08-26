import { Address, ethereum } from '@graphprotocol/graph-ts'
import { afterEach, assert, clearStore, describe, test } from 'matchstick-as'

import { handleTransferHelper } from '../../src/mappings/transfer'
import { Transfer } from '../../generated/PositionManager/PositionManager'
import { Position } from '../../generated/schema'
import { assertObjectMatches, MOCK_EVENT, POSITION_FIXTURE } from './constants'

const from = POSITION_FIXTURE.owner
const to = Address.fromString('0xE2EE691F237Ee6529B6557F2fCDd3dCF0C59ec63')
const tokenId = POSITION_FIXTURE.tokenId

class TransferFixture {
  id: string
  tokenId: string
  from: string
  to: string
}

const TRANSFER_FIXTURE: TransferFixture = {
  id: MOCK_EVENT.transaction.hash.toHexString() + '-' + MOCK_EVENT.logIndex.toString(),
  tokenId: tokenId.toString(),
  from: from.toHexString(),
  to: to.toHexString(),
}

const TRANSFER_EVENT = new Transfer(
  MOCK_EVENT.address,
  MOCK_EVENT.logIndex,
  MOCK_EVENT.transactionLogIndex,
  MOCK_EVENT.logType,
  MOCK_EVENT.block,
  MOCK_EVENT.transaction,
  [
    new ethereum.EventParam('from', ethereum.Value.fromAddress(from)),
    new ethereum.EventParam('to', ethereum.Value.fromAddress(to)),
    new ethereum.EventParam('tokenId', ethereum.Value.fromUnsignedBigInt(tokenId)),
  ],
  MOCK_EVENT.receipt,
)

describe('handleTransfer', () => {
  afterEach(() => {
    clearStore()
  })

  test('success - updates position owner', () => {
    const position = new Position(POSITION_FIXTURE.id)
    position.tokenId = POSITION_FIXTURE.tokenId
    position.owner = POSITION_FIXTURE.owner.toHexString()
    position.origin = POSITION_FIXTURE.origin.toHexString()
    position.createdAtTimestamp = MOCK_EVENT.block.timestamp

    position.save()

    handleTransferHelper(TRANSFER_EVENT)

    assertObjectMatches('Transfer', TRANSFER_FIXTURE.id, [
      ['tokenId', TRANSFER_FIXTURE.tokenId],
      ['from', TRANSFER_FIXTURE.from],
      ['to', TRANSFER_FIXTURE.to],
      ['origin', MOCK_EVENT.transaction.from.toHexString()],
      ['transaction', MOCK_EVENT.transaction.hash.toHexString()],
      ['logIndex', MOCK_EVENT.logIndex.toString()],
      ['timestamp', MOCK_EVENT.block.timestamp.toString()],
      ['position', POSITION_FIXTURE.id],
    ])

    assertObjectMatches('Position', POSITION_FIXTURE.id, [
      ['tokenId', POSITION_FIXTURE.tokenId.toString()],
      ['owner', to.toHexString()],
      ['origin', POSITION_FIXTURE.origin.toHexString()],
      ['createdAtTimestamp', MOCK_EVENT.block.timestamp.toString()],
    ])
  })

  test('creates new position if not found', () => {
    assert.notInStore('Position', POSITION_FIXTURE.id)

    handleTransferHelper(TRANSFER_EVENT)

    assertObjectMatches('Transfer', TRANSFER_FIXTURE.id, [
      ['tokenId', TRANSFER_FIXTURE.tokenId],
      ['from', TRANSFER_FIXTURE.from],
      ['to', TRANSFER_FIXTURE.to],
      ['origin', MOCK_EVENT.transaction.from.toHexString()],
      ['transaction', MOCK_EVENT.transaction.hash.toHexString()],
      ['logIndex', MOCK_EVENT.logIndex.toString()],
      ['timestamp', MOCK_EVENT.block.timestamp.toString()],
      ['position', POSITION_FIXTURE.id],
    ])

    assertObjectMatches('Position', POSITION_FIXTURE.id, [
      ['tokenId', POSITION_FIXTURE.tokenId.toString()],
      ['owner', to.toHexString()],
      ['origin', POSITION_FIXTURE.origin.toHexString()],
      ['createdAtTimestamp', MOCK_EVENT.block.timestamp.toString()],
    ])
  })
})
