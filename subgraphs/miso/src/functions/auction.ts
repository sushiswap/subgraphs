// import { CrowdsaleAuction } from '../..generated/MISOMarket/CrowdsaleAuction'
import { AuctionType, CROWDSALE_AUCTION_TEMPLATE_ID } from '../constants'
import { MarketCreated } from '../../generated/MISOMarket/MISOMarket'
import { Auction } from '../../generated/schema'
import { getTemplate } from './template'
import { log } from '@graphprotocol/graph-ts'

export function createAuction(event: MarketCreated): Auction {
  const auction = new Auction(event.params.addr.toHex())

  auction.factory = event.address.toHex()
  auction.template = event.params.marketTemplate.toHex()
  auction.deploymentTimestamp = event.block.timestamp
  auction.save()

  const template = getTemplate(event.params.marketTemplate.toHex())

  if (template.type == AuctionType.CROWDSALE) {
    log.debug('CROWDSALE', [])

    // const contract = CrowdsaleAuction.bind(event.params.addr)
    // const document = contract.try_getDocument().value.
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
  } else if (template.type == AuctionType.DUTCH) {
    log.debug('DUTCH', [])
    //..
  } else if (template.type == AuctionType.BATCH) {
    log.debug('BATCH', [])
    //..
  } else if (template.type == AuctionType.HYBERBOLIC) {
    //..
    log.warning('Hyperbolic auctions are not yet supported, ignoring auction', [])
  }


  return auction as Auction
}

export function getAuction(id: string): Auction {
  const auction = Auction.load(id)
  return auction as Auction
}
