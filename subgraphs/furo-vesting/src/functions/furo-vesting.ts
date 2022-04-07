import { BigInt } from '@graphprotocol/graph-ts'
import { FuroVesting } from '../../generated/schema'
import { FURO_VESTING } from '../constants'

function getOrCreateFuro(): FuroVesting {
  let furoVesting = FuroVesting.load(FURO_VESTING)

  if (furoVesting === null) {
    furoVesting = new FuroVesting(FURO_VESTING)
    furoVesting.save()
  }


  return furoVesting as FuroVesting
}

export function increaseTransactionCount(): void {
  const furoVesting = getOrCreateFuro()
  furoVesting.transactionCount = furoVesting.transactionCount.plus(BigInt.fromU32(1))
  furoVesting.save()
}

export function increaseUserCount(): void {
  const furoVesting = getOrCreateFuro()
  furoVesting.userCount = furoVesting.userCount.plus(BigInt.fromU32(1))
  furoVesting.save()
}

export function increaseVestingCount(): void {
  const furoVesting = getOrCreateFuro()
  furoVesting.vestingCount = furoVesting.vestingCount.plus(BigInt.fromU32(1))
  furoVesting.save()
}
