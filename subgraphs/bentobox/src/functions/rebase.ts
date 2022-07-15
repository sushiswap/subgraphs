import { BigInt } from '@graphprotocol/graph-ts'
import { BENTOBOX_ADDRESS } from '../constants'
import { Rebase } from '../../generated/schema'

export function createRebase(token: string): Rebase {
  const rebase = new Rebase(token)
  rebase.token = token
  rebase.bentoBox = BENTOBOX_ADDRESS.toHex()
  rebase.base = BigInt.fromU32(0)
  rebase.elastic = BigInt.fromU32(0)
  rebase.save()
  return rebase as Rebase
}

export function getRebase(token: string): Rebase {
  return Rebase.load(token) as Rebase
}

export function getOrCreateRebase(token: string): Rebase {
  const rebase = Rebase.load(token)

  if (rebase === null) {
    return createRebase(token)
  }

  return rebase
}

export function toBase(total: Rebase, elastic: BigInt, roundUp: Boolean = false): BigInt {
  if (total.elastic.equals(BigInt.fromU32(0))) {
    return elastic
  }

  const base = elastic.times(total.base).div(total.elastic)

  if (roundUp && base.times(total.elastic).div(total.base).lt(elastic)) {
    return base.plus(BigInt.fromU32(1))
  }
}

export function toElastic(total: Rebase, base: BigInt, roundUp: Boolean = false): BigInt {
  if (total.base.equals(BigInt.fromU32(0))) {
    return base
  }

  const elastic = base.times(total.elastic).div(total.base)

  if (roundUp && elastic.times(total.base).div(total.elastic).lt(base)) {
    return base.plus(BigInt.fromU32(1))
  }
}
