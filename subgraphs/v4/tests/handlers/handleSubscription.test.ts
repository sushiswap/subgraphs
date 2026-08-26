import { ethereum } from '@graphprotocol/graph-ts'
import { afterEach, clearStore, describe, test } from 'matchstick-as'

import { handleSubscriptionHelper } from '../../src/mappings/subscribe'
import { Subscription } from '../../generated/PositionManager/PositionManager'
import { assertObjectMatches, MOCK_EVENT, POSITION_FIXTURE } from './constants'

class SubscribedFixture {
  id: string
  tokenId: string
  address: string
}

const SUBSCRIPTION_FIXTURE: SubscribedFixture = {
  id: MOCK_EVENT.transaction.hash.toHexString() + '-' + MOCK_EVENT.logIndex.toString(),
  tokenId: POSITION_FIXTURE.tokenId.toString(),
  address: MOCK_EVENT.address.toHexString(),
}

const SUBSCRIPTION_EVENT = new Subscription(
  MOCK_EVENT.address,
  MOCK_EVENT.logIndex,
  MOCK_EVENT.transactionLogIndex,
  MOCK_EVENT.logType,
  MOCK_EVENT.block,
  MOCK_EVENT.transaction,
  [
    new ethereum.EventParam('tokenId', ethereum.Value.fromUnsignedBigInt(POSITION_FIXTURE.tokenId)),
    new ethereum.EventParam('subscriber', ethereum.Value.fromAddress(MOCK_EVENT.address)),
  ],
  MOCK_EVENT.receipt,
)

describe('handleSubscription', () => {
  afterEach(() => {
    clearStore()
  })

  test('success', () => {
    handleSubscriptionHelper(SUBSCRIPTION_EVENT)

    assertObjectMatches('Subscribe', SUBSCRIPTION_FIXTURE.id, [
      ['tokenId', SUBSCRIPTION_FIXTURE.tokenId],
      ['address', SUBSCRIPTION_FIXTURE.address],
      ['origin', MOCK_EVENT.transaction.from.toHexString()],
      ['transaction', MOCK_EVENT.transaction.hash.toHexString()],
      ['logIndex', MOCK_EVENT.logIndex.toString()],
      ['timestamp', MOCK_EVENT.block.timestamp.toString()],
      ['position', SUBSCRIPTION_FIXTURE.tokenId],
    ])
  })
})
