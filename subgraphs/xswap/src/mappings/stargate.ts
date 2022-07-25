import { ByteArray, Bytes, ethereum, log } from '@graphprotocol/graph-ts'
import { Packet } from '../../generated/schema'
import { Packet as PacketEvent } from '../../generated/Stargate/Stargate'

export function onPacket(event: PacketEvent): void {
  // Packet(uint16 chainId, bytes payload);
  // abi.encodePacked(nonce, ua, _destination, _payload);
  // 64, 32,
  // nonce, user appl, bytes calldata _destination, _payload
  // { "internalType": "uint64", "name": "_nonce", "type": "uint64" },
  // { "internalType": "address", "name": "_ua", "type": "address" },
  // { "internalType": "bytes", "name": "_destination", "type": "bytes" },
  // { "internalType": "bytes", "name": "_payload", "type": "bytes" },

  // let tuplePayload = getTxnInputDataToDecode(event.params.payload)
  // let temp = ethereum.decode('(uint64,address,bytes,bytes)', tuplePayload)!.toTuple()
  // log.debug('tuplePayload  : {}', [tuplePayload.toHex()])
  // if (temp === null) {
  //   // log.error('failed to decode payload', [])
  //   throw new Error('failed to decode payload')
  // } else {
  //   log.debug('temp: {}', [temp!.toTuple()[3].toBytes().toHex()])
  // }


  let packet = new Packet(event.transaction.hash.toHex())
  packet.chainId = event.params.chainId
  packet.payload = event.params.payload
  // packet.actions = decoded[0].toI32Array()
  // packet.values = decoded[1].toBigIntArray()
  // packet.datas = decoded[2].toBytesArray()
  packet.createdAtTimestamp = event.block.timestamp
  packet.createdAtBlock = event.block.number
  packet.save()
}

export function getTxnInputDataToDecode(payload: Bytes): Bytes {
  const functionInput = payload.subarray(4)
  const tuplePrefix = ByteArray.fromHexString('0x0000000000000000000000000000000000000000000000000000000000000020')
  const functionInputAsTuple = new Uint8Array(tuplePrefix.length + functionInput.length)
  functionInputAsTuple.set(tuplePrefix, 0)
  functionInputAsTuple.set(functionInput, tuplePrefix.length)
  return Bytes.fromUint8Array(functionInputAsTuple)
}
