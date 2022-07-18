import { BigDecimal, BigInt } from '@graphprotocol/graph-ts'

export function toDecimal(amount: BigInt, decimals: BigInt): BigDecimal {
  return amount.divDecimal(
    BigInt.fromI32(10)
      .pow(decimals.toI32() as u8)
      .toBigDecimal()
  )
}
