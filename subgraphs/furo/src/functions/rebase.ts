import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts'
import { BENTOBOX_ADDRESS, BIG_DECIMAL_ONE, BIG_INT_ONE } from '../constants'
import { Rebase } from '../../generated/schema'
import { BentoBox } from '../../generated/BentoBox/BentoBox'

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

export function toAmount(shares: BigInt, rebase: Rebase): BigInt {
  return rebase.base.gt(BIG_INT_ONE) ? shares.times(rebase.elastic).div(rebase.base) : BIG_INT_ONE
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