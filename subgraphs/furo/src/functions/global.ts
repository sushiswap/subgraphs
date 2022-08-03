import { BigInt } from '@graphprotocol/graph-ts'
import { Global } from '../../generated/schema'
import { GLOBAL_ID } from '../constants'

function getOrCreateGlobal(): Global {
  let global = Global.load(GLOBAL_ID)

  if (global === null) {
    global = new Global(GLOBAL_ID)
    global.streamCount = BigInt.fromU32(0)
    global.vestingCount = BigInt.fromU32(0)
    global.transactionCount = BigInt.fromU32(0)
    global.userCount = BigInt.fromU32(0)
    global.save()
  }

  return global as Global
}

export function increaseTransactionCount(): void {
  const global = getOrCreateGlobal()
  global.transactionCount = global.transactionCount.plus(BigInt.fromU32(1))
  global.save()
}

export function increaseUserCount(): void {
  const global = getOrCreateGlobal()
  global.userCount = global.userCount.plus(BigInt.fromU32(1))
  global.save()
}

export function increaseStreamCount(): void {
  const global = getOrCreateGlobal()
  global.streamCount = global.streamCount.plus(BigInt.fromU32(1))
  global.save()
}

export function increaseVestingCount(): void {
  const global = getOrCreateGlobal()
  global.vestingCount = global.vestingCount.plus(BigInt.fromU32(1))
  global.save()
}
