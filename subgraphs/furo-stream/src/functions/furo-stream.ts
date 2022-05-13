import { BigInt } from '@graphprotocol/graph-ts'
import { FuroStream } from '../../generated/schema'
import { FURO_STREAM } from '../constants'

function getOrCreateFuro(): FuroStream {
  let furoStream = FuroStream.load(FURO_STREAM)

  if (furoStream === null) {
    furoStream = new FuroStream(FURO_STREAM)
    furoStream.save()
  }


  return furoStream as FuroStream
}

export function increaseTransactionCount(): void {
  const furoStream = getOrCreateFuro()
  furoStream.transactionCount = furoStream.transactionCount.plus(BigInt.fromU32(1))
  furoStream.save()
}

export function increaseUserCount(): void {
  const furoStream = getOrCreateFuro()
  furoStream.userCount = furoStream.userCount.plus(BigInt.fromU32(1))
  furoStream.save()
}

export function increaseStreamCount(): void {
  const furoStream = getOrCreateFuro()
  furoStream.streamCount = furoStream.streamCount.plus(BigInt.fromU32(1))
  furoStream.save()
}
