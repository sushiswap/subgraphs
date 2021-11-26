import { Address } from '@graphprotocol/graph-ts'
import { Rebase } from '../../generated/schema'

export function getOrCreateRebase(token: Address): Rebase {
  let rebase = Rebase.load(token.toHex())

  if (rebase === null) {
    rebase = new Rebase(token.toHex())
    rebase.token = token.toHex()
  }

  return rebase as Rebase
}
