// import { ByteArray, Bytes, ethereum, log } from '@graphprotocol/graph-ts'
// import { Packet } from '../../generated/schema'
// import { Packet as PacketEvent } from '../../generated/Stargate/Stargate'

// export function onPacket(event: PacketEvent): void {
//   // Packet(uint16 chainId, bytes payload);

//   // NOTE: this is an encoded payload, containing these four fields:
//   // { "internalType": "uint64", "name": "_nonce", "type": "uint64" },
//   // { "internalType": "address", "name": "_ua", "type": "address" },
//   // { "internalType": "bytes", "name": "_destination", "type": "bytes" },
//   // { "internalType": "bytes", "name": "_payload", "type": "bytes" },

//   // paramsTo, A V D, sourceContext

//   log.debug('txHash {}, payload {}', [event.transaction.hash.toHex(), event.params.payload.toHex()])
//   // const nonce = Bytes.fromUint8Array(event.params.payload.slice(0, 8))
//   // const ua = Bytes.fromUint8Array(event.params.payload.slice(8, 28))
//   // const destination = Bytes.fromUint8Array(event.params.payload.slice(28, 48))
//   // const paramsTo = Bytes.fromUint8Array(event.params.payload.slice(48, 68))
//   // const encodedPayload = Bytes.fromUint8Array(event.params.payload.slice(68, event.params.payload.length-32))
//   // const srcContext = Bytes.fromUint8Array(event.params.payload.slice(event.params.payload.length-32, event.params.payload.length))
// // Uint8 , uint16, uint16, uint256, bytes, bytes, bytes
// // TYPE_SWAP_REMOTE, _srcPoolId, _dstPoolId, _lzTxParams.dstGasForCall, _c, _s, _to
//   const avd = Bytes.fromUint8Array(event.params.payload.slice(592+32, event.params.payload.length-32))
//   // log.debug("nonce {}", [nonce.toHex()]
//   // log.debug("ua {}", [ua.toHex()])
//   // log.debug("destination {}", [destination.toHex()])
//   // log.debug('paramsTo {}', [paramsTo.toHex()])
//   // log.debug("encodedPayload {}", [encodedPayload.toHex()])
//   // log.debug('srcContext {}', [srcContext.toHex()])
//   // let temp = ethereum.decode('(uint64)', nonce)
//   // bytes memory payload = abi.encode(params.to, actions, values, datas, params.srcContext);
//   log.debug('avd {}', [avd.toHex()])
//   const blyat = getTxnInputDataToDecode(avd)
//   // log.debug('blyat {}', [blyat.toHex()])

//   // let temp = ethereum.decode('(address,uint8[],uint256[],bytes[],bytes)', blyat)!.toTuple()
//   let temp = ethereum.decode('(uint8[],uint256[],bytes[])', blyat)!.toTuple()

//   // let temp = ethereum.decode('(uint64, address, bytes, bytes)', event.params.payload)!.toTuple()
//   if (temp === null) {
//     // log.error('failed to decode payload', [])
//     throw new Error('failed to decode payload')
//   } else {
//     // log.debug('len: {}', [temp.length.toString()])
//     // log.debug('uint64: {}', [temp.toBigInt().toString()]) //EXPECT 6880
//     // log.debug('address: {}', [temp[1].toAddress().toHex()])
//   }

//   let packet = new Packet(event.transaction.hash.toHex())
//   packet.chainId = event.params.chainId
//   packet.payload = event.params.payload
//   // packet.actions = decoded[0].toI32Array()
//   // packet.values = decoded[1].toBigIntArray()
//   // packet.datas = decoded[2].toBytesArray()
//   packet.createdAtTimestamp = event.block.timestamp
//   packet.createdAtBlock = event.block.number
//   packet.save()
// }

// export function getTxnInputDataToDecode(payload: Bytes): Bytes {
//   const functionInput = payload.subarray(4)
//   const tuplePrefix = ByteArray.fromHexString('0x0000000000000000000000000000000000000000000000000000000000000020')
//   const functionInputAsTuple = new Uint8Array(tuplePrefix.length + functionInput.length)
//   functionInputAsTuple.set(tuplePrefix, 0)
//   functionInputAsTuple.set(functionInput, tuplePrefix.length)
//   return Bytes.fromUint8Array(functionInputAsTuple)
// }


