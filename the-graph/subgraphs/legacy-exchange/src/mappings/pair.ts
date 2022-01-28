import { ADDRESS_ZERO } from '../constants'
import {
  Burn as BurnEvent,
  Mint as MintEvent,
  Pair as PairContract,
  Swap as SwapEvent,
  Sync as SyncEvent,
  Transfer as TransferEvent,
} from '../../generated/templates/Pair/Pair'
import { BigDecimal, BigInt } from '@graphprotocol/graph-ts'
import { getFactory, getOrCreateUser, getPairKpi } from '../functions'

export function onTransfer(event: TransferEvent): void {
  if (event.params.to == ADDRESS_ZERO && event.params.value.equals(BigInt.fromI32(1000))) {
    return
  }

  const amount = event.params.value.divDecimal(BigDecimal.fromString('1e18'))

  const from = event.params.from.toHex()

  const to = event.params.to.toHex()

  getOrCreateUser(from)
  getOrCreateUser(to)

  const pairAddress = event.address.toHex()

  const pairKpi = getPairKpi(pairAddress)

  // If sender is black hole, we're mintin'
  if (event.params.from == ADDRESS_ZERO) {
    pairKpi.liquidity = pairKpi.liquidity.plus(amount)
  }

  // If recipient is black hole we're burnin'
  if (event.params.to == ADDRESS_ZERO) {
    pairKpi.liquidity = pairKpi.liquidity.minus(amount)
  }

  pairKpi.save()

  // Increment factory count
  const factory = getFactory()
  factory.txCount = factory.txCount.plus(BigInt.fromI32(1))
  factory.save()
}

export function onSync(event: SyncEvent): void {
  //
}

export function onMint(event: MintEvent): void {
  //
}

export function onBurn(event: BurnEvent): void {
  //
}

export function onSwap(event: SwapEvent): void {
  //
}
