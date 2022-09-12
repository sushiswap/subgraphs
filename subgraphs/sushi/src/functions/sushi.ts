import { BigInt } from '@graphprotocol/graph-ts'
import { Sushi } from '../../generated/schema'
import { SUSHI } from '../constants'

export function getOrCreateSushi(): Sushi {
  let sushi = Sushi.load(SUSHI)

  if (sushi === null) {
    sushi = new Sushi(SUSHI)
    sushi.userCount = BigInt.fromU32(0)
    sushi.transactionCount = BigInt.fromU32(0)
    sushi.totalSupply = BigInt.fromU32(0)
    sushi.save()
    return sushi
  }

  return sushi as Sushi
}
