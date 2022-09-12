import { Address, BigInt } from '@graphprotocol/graph-ts'
import { BentoBox } from '../../generated/BentoBox/BentoBox'
import { Rebase } from '../../generated/schema'
import { BENTOBOX_ADDRESS, BIG_INT_ONE } from '../constants'

export function createRebase(token: string): Rebase {
  const rebase = new Rebase(token)
  const totals = getRebaseFromContract(token)
  rebase.token = token
  rebase.elastic = totals.elastic
  rebase.base = totals.base
  rebase.save()
  return rebase as Rebase
}

export function getRebase(token: string): Rebase {
  return Rebase.load(token) as Rebase
}

export function getOrCreateRebase(token: string): Rebase {
  let rebase = Rebase.load(token)

  if (rebase === null) {
    rebase = createRebase(token)
  }

  return rebase as Rebase
}

/**
 * To base (shares)
 * @param total 
 * @param elastic 
 * @param roundUp 
 * @returns 
 */
export function toBase(total: Rebase, elastic: BigInt, roundUp: boolean): BigInt {
  if (total.elastic.equals(BigInt.fromU32(0))) {
    return elastic
  }

  const base = elastic.times(total.base).div(total.elastic)

  if (roundUp && base.times(total.elastic).div(total.base).lt(elastic)) {
    return base.plus(BigInt.fromU32(1))
  }

  return base
}

/**
 * To elastic (amount)
 * @param total 
 * @param base 
 * @param roundUp 
 * @returns 
 */
export function toElastic(total: Rebase, base: BigInt, roundUp: boolean): BigInt {
  if (total.base.equals(BigInt.fromU32(0))) {
    return base
  }

  const elastic = base.times(total.elastic).div(total.base)

  if (roundUp && elastic.times(total.base).div(total.elastic).lt(base)) {
    return elastic.plus(BigInt.fromU32(1))
  }

  return elastic
}

class Totals {
  elastic: BigInt
  base: BigInt
}

function getRebaseFromContract(tokenAddress: string): Totals {
  const contract = BentoBox.bind(BENTOBOX_ADDRESS)
  const totals = contract.try_totals(Address.fromString(tokenAddress))

  if (!totals.reverted) {
    return { elastic: totals.value.getElastic(), base: totals.value.getBase() }
  }

  return { elastic: BIG_INT_ONE, base: BIG_INT_ONE }
}