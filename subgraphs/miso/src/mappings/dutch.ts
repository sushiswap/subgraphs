import { updateDocument } from '../functions'
import { SetDocumentsCall } from '../../generated/templates/DutchAuction/DutchAuction'


export function onSetDocuments(event: SetDocumentsCall): void {
  const auctionId = event.to.toHex()
  updateDocument(auctionId, event.inputs._name, event.inputs._data)
}