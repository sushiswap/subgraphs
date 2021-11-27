import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts'
import { Rebase } from '../../generated/schema'

export function getRebase(token: string): Rebase {
  return Rebase.load(token) as Rebase
}

export function getOrCreateRebase(token: string): Rebase {
  let rebase = Rebase.load(token)

  if (rebase === null) {
    rebase = new Rebase(token)
    rebase.token = token
  }

  return rebase as Rebase
}

export function toAmount(shares: BigInt, rebase: Rebase): BigDecimal {
  return rebase.base.gt(BigDecimal.fromString('0'))
    ? shares.toBigDecimal().times(rebase.elastic).div(rebase.base)
    : BigDecimal.fromString('0')
}
