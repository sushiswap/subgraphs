import { Address, BigInt, Bytes } from '@graphprotocol/graph-ts'
import { assert, clearStore, test } from 'matchstick-as/assembly/index'
import { createPacketEvent } from './mocks'
import {onPacket} from '../src/mappings/stargate'

function cleanup(): void {
  clearStore()
}

test('decode payload', () => {
  const chainId = 4 as u16
  const payload = Bytes.fromByteArray(Bytes.fromHexString(
    '0x0000000000001ae0ed2f78f4ceb26c2e40056fba5468d8aa0e105438889ddd46451a2d03768ce8edb4e30b6539089b640067616e64616c6674686562726f776e67786d786e690012c337c237ad0900000000000000000000000000001e91011bf7caf4942f199236227ba4858ae389f6000000000000000000000000db654136fd25246736872c3a4c751075e7a3f79a0000000000000000000000002791bca1f2de4661ed88a30c99a7a9449aa84174000000000000000000000000b6b833049445a52df678fbb790a05d2039cb27fa0000000000000000000000000000000000000000000000000000000000b1cf75'
  ))
  
  let packetEvent = createPacketEvent(chainId, payload)

  onPacket(packetEvent)


  cleanup()
})
