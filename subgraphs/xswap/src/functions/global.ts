
import { BigInt } from '@graphprotocol/graph-ts'
import { Global } from '../../generated/schema'

export function getOrCreateGlobal(): Global {
  let global = Global.load('1')
  if (global === null) {
    global = new Global('1')
    global.swapCount = BigInt.fromI32(0)
    global.successfulSwaps = BigInt.fromI32(0)
    global.failedSwaps = BigInt.fromI32(0)
    global.save()
  }
  return global
}


