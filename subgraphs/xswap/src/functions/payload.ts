
import { ByteArray, Bytes, ethereum } from '@graphprotocol/graph-ts'
import { PayloadType } from '../constants'
import { Payload } from '../../generated/schema'

import {
  StargateSushiXSwapSrc as SourceEvent
} from '../../generated/Xswap/Xswap'
import { createOperations } from './operation'

export function createPayload(event: SourceEvent): Payload {
  const id = event.transaction.hash.toHex()
  const input = getTxnInputDataToDecode(event.transaction.input)
  let decoded = ethereum.decode('(uint8[],uint256[],bytes[])', input)!.toTuple()
  const operationIds = createOperations(id, decoded[0].toI32Array(), decoded[1].toBigIntArray(), decoded[2].toBytesArray())
  const payload = new Payload(id)
  payload.type = PayloadType.SOURCE
  payload.operations = operationIds
  payload.operationCount = operationIds.length
  payload.save()

  return payload
}

function getTxnInputDataToDecode(input: Bytes): Bytes {
  const functionInput = input.subarray(4)
  const tuplePrefix = ByteArray.fromHexString('0x0000000000000000000000000000000000000000000000000000000000000020')
  const functionInputAsTuple = new Uint8Array(tuplePrefix.length + functionInput.length)
  functionInputAsTuple.set(tuplePrefix, 0)
  functionInputAsTuple.set(functionInput, tuplePrefix.length)
  return Bytes.fromUint8Array(functionInputAsTuple)
}
