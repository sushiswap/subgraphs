import { Address, BigInt } from '@graphprotocol/graph-ts'
import { assert, test, clearStore} from 'matchstick-as/assembly/index'
import { XSUSHI_ADDRESS } from '../src/constants/addresses'
import { onSushiTransfer } from '../src/mappings/xsushi'
import { createSushiTransferEvent } from './mocks'

function cleanup(): void {
    clearStore()
  }

test('Fee is created when recipient is equal to xsushi address', () => {
    const sender = Address.fromString('0x00000000000000000000000000000000000a71ce')
    const amount = BigInt.fromString("1337")
    let transferEvent = createSushiTransferEvent(sender, XSUSHI_ADDRESS, amount)

    onSushiTransfer(transferEvent)

    assert.entityCount('Fee', 1)
    assert.fieldEquals('Fee', transferEvent.transaction.hash.toHex(), 'id', transferEvent.transaction.hash.toHex())
    assert.fieldEquals('Fee', transferEvent.transaction.hash.toHex(), 'sender', sender.toHex())
    assert.fieldEquals('Fee', transferEvent.transaction.hash.toHex(), 'createdAtBlock', transferEvent.block.number.toString())
    assert.fieldEquals('Fee', transferEvent.transaction.hash.toHex(), 'createdAtTimestamp', transferEvent.block.timestamp.toString())
 
    cleanup()
})

