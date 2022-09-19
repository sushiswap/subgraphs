import { BigInt } from '@graphprotocol/graph-ts'
import { GLOBAL } from '../constants'
import { Global } from '../../generated/schema'

function getOrCreateGlobal(): Global {
  let global = Global.load(GLOBAL)

  if (global === null) {
    global = new Global(GLOBAL)
    global.save()
  }


  return global as Global
}

export function increaseTransactionCount(): BigInt {
  const global = getOrCreateGlobal()
  global.transactionCount = global.transactionCount.plus(BigInt.fromU32(1))
  global.save()

  return global.transactionCount
}

// export function increaseUserCount(): void {
//   const global = getOrCreateGlobal()
//   global.userCount = global.userCount.plus(BigInt.fromU32(1))
//   global.save()
// }

// export function increaseIncentiveCount(): void {
//   const global = getOrCreateGlobal()
//   global.incentiveCount = global.incentiveCount.plus(BigInt.fromU32(1))
//   global.save()
// }