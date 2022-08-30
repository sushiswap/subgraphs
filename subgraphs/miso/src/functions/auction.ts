import { MarketCreated } from '../../generated/MISOMarket/MISOMarket'
import { Auction } from '../../generated/schema'
import { createDocumentcollection } from './document-collection'
import { getTemplate } from './template'

export function createAuction(event: MarketCreated): Auction {
  const auctionId = event.params.addr.toHex()
  const auction = new Auction(auctionId)
  auction.factory = event.address.toHex()
  auction.template = event.params.marketTemplate.toHex()
  auction.deploymentTimestamp = event.block.timestamp

  const template = getTemplate(event.params.marketTemplate.toHex())
  auction.type = template.type
  const documentCollection = createDocumentcollection(auctionId)
  auction.documents = documentCollection.id


  // documents
  // get all documents
  // get base info
  // get market info
  // get start price
  // get price drop

  // const auctionInfos = useAuctionRawInfos(addresses, auctionTemplateIds)
  // const auctionDocuments = useAuctionDocuments(addresses)
  // const pointListAddresses = useAuctionPointLists(addresses)
  // const blockTimestamp = useCurrentBlockTimestamp()
  // pointlist
  /// wallet

  documentCollection.save()

  auction.save()
  return auction as Auction
}

export function getAuction(id: string): Auction {
  const auction = Auction.load(id)
  return auction as Auction
}
