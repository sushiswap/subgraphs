import { BigInt } from '@graphprotocol/graph-ts'
import { FuroStream } from '../../generated/schema'
import { FURO_STREAM } from '../constants'

function getOrCreateFuro(): FuroStream {
  let furo = FuroStream.load(FURO_STREAM)

  if (furo === null) {
    furo = new FuroStream(FURO_STREAM)
  }

  furo.save()

  return furo as FuroStream
}

export function increaseTransactionCount(): void {
  const furo = getOrCreateFuro()
  furo.transactionCount = furo.transactionCount.plus(BigInt.fromU32(1))
  furo.save()
}

export function increaseUserCount(): void {
  const furo = getOrCreateFuro()
  furo.userCount = furo.userCount.plus(BigInt.fromU32(1))
  furo.save()
}

export function increaseStreamCount(): void {
  const furo = getOrCreateFuro()
  furo.streamCount = furo.streamCount.plus(BigInt.fromU32(1))
  furo.save()
}
