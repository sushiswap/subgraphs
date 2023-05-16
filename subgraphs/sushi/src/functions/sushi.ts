import { BigInt } from '@graphprotocol/graph-ts'
import { Sushi } from '../../generated/schema'
import { SUSHI } from '../constants'

export function getOrCreateSushi(): Sushi {
  let sushi = Sushi.load(SUSHI)

  if (sushi === null) {
    sushi = new Sushi(SUSHI)
    sushi.totalUserCount = BigInt.zero()
    sushi.holderCount = BigInt.zero()
    sushi.transactionCount = BigInt.zero()
    sushi.totalSupply = BigInt.zero()
    sushi.save()
    return sushi
  }

  return sushi as Sushi
}

export function updateHolderCount(prevBalance: BigInt, newBalance: BigInt): void {
  if (prevBalance.isZero() && !newBalance.isZero()) {
    //add a holder
    let sushi = getOrCreateSushi()
    sushi.holderCount = sushi.holderCount.plus(BigInt.fromU32(1))
    sushi.save()
  } else if (!prevBalance.isZero() && newBalance.isZero()) {
    //remove a holder
    let sushi = getOrCreateSushi()
    sushi.holderCount = sushi.holderCount.minus(BigInt.fromU32(1))
    sushi.save()
  }
}
