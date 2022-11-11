import { BigInt } from '@graphprotocol/graph-ts'
import { Global } from '../../generated/schema'

export function getOrCreateGlobal(): Global {
  let global = Global.load("1")

  if (global === null) {
    global = new Global("1")
    global.totalSwapCount = BigInt.fromU32(0)
    global.positiveSlippageSwapCount = BigInt.fromU32(0)
    global.exactSwapCount = BigInt.fromU32(0)
    global.save()
  }

  return global as Global
}
