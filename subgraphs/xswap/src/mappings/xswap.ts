import { ByteArray, Bytes, ethereum } from '@graphprotocol/graph-ts'
import { Destination, Source } from '../../generated/schema'
import {
  StargateSushiXSwapDst as DestinationEvent,
  StargateSushiXSwapSrc as SourceEvent
} from '../../generated/Xswap/Xswap'

export function onSource(event: SourceEvent): void {
  const input = getTxnInputDataToDecode(event)
  let decoded = ethereum.decode('(uint8[],uint256[],bytes[])', input)!.toTuple()
  const source = new Source(event.transaction.hash.toHex())
  source.actions = decoded[0].toI32Array()
  source.values = decoded[1].toBigIntArray()
  source.datas = decoded[2].toBytesArray()
  source.save()

  
}

// export function onDestination(event: DestinationEvent): void {
//   const input = getTxnInputDataToDecode(event)
//   let decoded = ethereum.decode('(uint8[],uint256[],bytes[])', input)!.toTuple()
//   const destination = new Destination(event.transaction.hash.toHex())
//   destination.failed = event.params.failed
//   destination.actions = decoded[0].toI32Array()
//   destination.values = decoded[1].toBigIntArray()
//   destination.datas = decoded[2].toBytesArray()
//   destination.save()
// }

function getTxnInputDataToDecode(event: ethereum.Event): Bytes {
  const functionInput = event.transaction.input.subarray(4)
  const tuplePrefix = ByteArray.fromHexString('0x0000000000000000000000000000000000000000000000000000000000000020')
  const functionInputAsTuple = new Uint8Array(tuplePrefix.length + functionInput.length)
  functionInputAsTuple.set(tuplePrefix, 0)
  functionInputAsTuple.set(functionInput, tuplePrefix.length)
  return Bytes.fromUint8Array(functionInputAsTuple)
}
