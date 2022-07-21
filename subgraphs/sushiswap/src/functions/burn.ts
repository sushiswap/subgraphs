import { BigDecimal, BigInt, ethereum } from '@graphprotocol/graph-ts'
import { BIG_DECIMAL_ZERO } from '../constants'
import { Burn } from '../../generated/schema'
import { Transfer as TransferEvent, Burn as BurnEvent} from '../../generated/templates/Pair/Pair'

export function getOrCreateBurn<T extends ethereum.Event>(event: T, burnCount: i32): Burn {
  const id = event.transaction.hash.toHex().concat('-').concat(BigInt.fromI32(burnCount).toString())

  let burn = Burn.load(id)
  if (burn === null) {
    if (event instanceof BurnEvent) {

      burn = new Burn(id)
      burn.pair = event.address.toHex()
      burn.complete = true
      burn.liquidity = BIG_DECIMAL_ZERO
      burn.transaction = event.transaction.hash.toHex()
      burn.timestamp = event.block.timestamp
      // No need to save it, it will be saved when more fields are populated

    } else if (event instanceof TransferEvent) {

      burn = new Burn(id)
      burn.pair = event.address.toHex()
      burn.liquidity = event.params.value.divDecimal(BigDecimal.fromString('1e18'))
      burn.timestamp = event.block.timestamp
      burn.to = event.params.to.toHex()
      burn.sender = event.params.from.toHex()
      burn.complete = false
      burn.transaction = event.transaction.hash.toHex()
      burn.save()
    }
  }
  return burn as Burn
}
