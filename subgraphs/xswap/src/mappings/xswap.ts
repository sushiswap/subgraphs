import { BigInt } from '@graphprotocol/graph-ts'
import { getOrCreateGlobal } from '../functions'
import {
    StargateSushiXSwapDst as DestinationEvent,
    StargateSushiXSwapSrc as SourceEvent
} from '../../generated/Xswap/Xswap'
import { createDestination, createSource } from '../functions'

export function onSource(event: SourceEvent): void {
    createSource(event)
}

export function onDestination(event: DestinationEvent): void {
    const destination = createDestination(event)
    const global = getOrCreateGlobal()
    global.swapCount = global.swapCount.plus(BigInt.fromI32(1))
    if (!destination.failed) {
        global.successfulSwaps = global.successfulSwaps.plus(BigInt.fromI32(1))
    } else {
        global.failedSwaps = global.failedSwaps.plus(BigInt.fromI32(1))
    }
    global.save()
}

