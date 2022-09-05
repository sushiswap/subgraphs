import { Address, BigInt, ethereum, log } from '@graphprotocol/graph-ts'
import { BatchAuction } from '../../generated/templates/BatchAuction/BatchAuction'
import { DutchAuction } from '../../generated/templates/DutchAuction/DutchAuction'
import { CrowdsaleAuction } from '../../generated/templates/CrowdsaleAuction/CrowdsaleAuction'
import { MarketCreated } from '../../generated/MISOMarket/MISOMarket'
import { Auction } from '../../generated/schema'
import { createDocumentcollection, updateDocument } from './document-collection'
import { getTemplate } from './template'
import { getOrCreateToken } from './token'
import { AuctionType } from '../constants'

export function createAuction(event: MarketCreated): Auction | null {
  const auctionId = event.params.addr.toHex()
  const auction = new Auction(auctionId)
  const template = getTemplate(event.params.marketTemplate.toHex())
  auction.type = template.type

  let auctionDetails: AuctionDetails
  if (auction.type == AuctionType.CROWDSALE) {
    const contract = CrowdsaleAuction.bind(event.params.addr)
    auctionDetails = getAuctionDetails(contract)
  } else if (auction.type == AuctionType.DUTCH) {
    const contract = DutchAuction.bind(event.params.addr)
    auctionDetails = getAuctionDetails(contract)
  } else if (auction.type == AuctionType.BATCH) {
    const contract = BatchAuction.bind(event.params.addr)
    auctionDetails = getAuctionDetails(contract)
  } else {
    log.warning("auction type not implemented: {}, ignoring.", [auction.type])
    return null
  }

  auction.factory = event.address.toHex()
  auction.template = event.params.marketTemplate.toHex()
  auction.deploymentTimestamp = event.block.timestamp

  const documentCollection = createDocumentcollection(auctionId)
  auction.documents = documentCollection.id

  const token = getOrCreateToken(auctionDetails.auctionToken.toHex(), event)
  const bidToken = getOrCreateToken(auctionDetails.bidToken.toHex(), event)
  auction.auctionToken = token.id
  auction.bidToken = bidToken.id
  auction.startTime = auctionDetails.startTime
  auction.endTime = auctionDetails.endTime
  auction.totalTokens = auctionDetails.totalTokens
  auction.priceDrop = auctionDetails.priceDrop
  auction.priceRate = auctionDetails.priceRate
  auction.priceGoal = auctionDetails.priceGoal
  auction.startPrice = auctionDetails.startPrice
  auction.minimumPrice = auctionDetails.minimumPrice
  auction.minimumRaised = auctionDetails.minimumRaised
  auction.save()
  updateDocument(auctionId, auctionDetails.documentNames, auctionDetails.documentValues)

  return auction as Auction
}

export function getAuction(id: string): Auction {
  const auction = Auction.load(id)
  return auction as Auction
}



class AuctionDetails {
  auctionToken: Address
  bidToken: Address
  startTime: BigInt
  endTime: BigInt
  totalTokens: BigInt
  priceDrop: BigInt
  priceRate: BigInt
  priceGoal: BigInt
  startPrice: BigInt
  minimumPrice: BigInt
  minimumRaised: BigInt
  documentNames: string[]
  documentValues: string[]
}

function getAuctionDetails<T>(contract: T): AuctionDetails {
  if (contract instanceof CrowdsaleAuction || contract instanceof DutchAuction || contract instanceof BatchAuction) {
    const baseInfo = contract.getBaseInformation()
    const bidToken = contract.paymentCurrency()
    const marketInfo = contract.marketInfo()
    let priceDrop = BigInt.fromI32(0)
    let priceRate = BigInt.fromI32(0)
    let priceGoal = BigInt.fromI32(0)
    let startPrice = BigInt.fromI32(0)
    let minimumPrice = BigInt.fromI32(0)
    let minimumRaised = BigInt.fromI32(0)

    if (contract instanceof CrowdsaleAuction) {
      const marketPrice = contract.marketPrice()
      priceRate = marketPrice.value0
      priceGoal = marketPrice.value1
    }
    if (contract instanceof DutchAuction) {
      priceDrop = contract.priceDrop()
      const marketPrice = contract.marketPrice()
      startPrice = marketPrice.value0
      minimumPrice = marketPrice.value1
    }
    else if (contract instanceof BatchAuction) {
      minimumRaised = contract.marketStatus().value1
    }

    const documentNames = contract.getAllDocuments()
    const documentValues: string[] = []
    for (let i = 0; i < documentNames.length; i++) {
      documentValues.push(contract.getDocument(documentNames[i]).value0)
    }
    return {
      auctionToken: baseInfo.value0,
      bidToken: bidToken,
      startTime: baseInfo.value1,
      endTime: baseInfo.value2,
      totalTokens: marketInfo.value2,
      priceDrop,
      priceRate,
      priceGoal,
      startPrice,
      minimumPrice,
      minimumRaised,
      documentNames,
      documentValues
    }
  } else {
    throw new Error("contract type not implemented")
  }
}

