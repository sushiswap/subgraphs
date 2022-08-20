import { AddedCommitment } from '../../generated/templates/MisoAuction/MisoAuction'
import { Product } from '../constants'
import { handleUser } from '../functions'

export function onAddedCommitment(event: AddedCommitment): void {
  handleUser(event.params.addr, event, Product.MISO)
}


