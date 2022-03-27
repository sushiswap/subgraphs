import { BigInt } from '@graphprotocol/graph-ts'
import { Furo } from '../../generated/schema'
import { FURO } from '../constants'

function getOrCreateFuro(): Furo {
  let furo = Furo.load(FURO)

  if (furo === null) {
    furo = new Furo(FURO)
  }

  furo.save()

  return furo as Furo
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
