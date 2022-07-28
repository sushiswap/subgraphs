import {
  StargateSushiXSwapDst as DestinationEvent,
  StargateSushiXSwapSrc as SourceEvent
} from '../../generated/Xswap/Xswap'
import { createDestination, createSource } from '../functions'

export function onSource(event: SourceEvent): void {
  createSource(event)
}

export function onDestination(event: DestinationEvent): void {
  createDestination(event)
}

