import { Address, BigInt } from '@graphprotocol/graph-ts'
import { DutchAuction } from '../../generated/templates/DutchAuction/DutchAuction'
import { MarketCreated } from '../../generated/MISOMarket/MISOMarket'
import { Auction } from '../../generated/schema'
import { createDocumentcollection, updateDocument } from './document-collection'
import { getTemplate } from './template'
import { getOrCreateToken } from './token'

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
  
  const auctionDetails = getAuctionDetails(event.params.addr)
  const token = getOrCreateToken(auctionDetails.token.toHex(), event)
  const bidToken = getOrCreateToken(auctionDetails.bidToken.toHex(), event)
  auction.token = token.id
  auction.bidToken = bidToken.id
  auction.startTime = auctionDetails.startTime
  auction.endTime = auctionDetails.endTime
  auction.totalTokens = auctionDetails.totalTokens
  auction.priceDrop = auctionDetails.priceDrop
  auction.priceRate = auctionDetails.priceRate
  auction.priceGoal = auctionDetails.priceGoal
  auction.save()
  updateDocument(auctionId, auctionDetails.documentNames, auctionDetails.documentValues)

  return auction as Auction
}

export function getAuction(id: string): Auction {
  const auction = Auction.load(id)
  return auction as Auction
}



class AuctionDetails {
  token: Address
  bidToken: Address
  startTime: BigInt
  endTime: BigInt
  totalTokens: BigInt
  priceDrop: BigInt
  priceRate: BigInt
  priceGoal: BigInt
  documentNames: string[]
  documentValues: string[]
}

function getAuctionDetails(address: Address): AuctionDetails {
  const contract = DutchAuction.bind(address)
  const baseInfo = contract.getBaseInformation()
  const bidToken = contract.paymentCurrency()
  const marketInfo = contract.marketInfo()
  const try_priceDrop = contract.try_priceDrop()
  const priceDrop = try_priceDrop.reverted ? BigInt.fromI32(0) : try_priceDrop.value
  const try_marketPrice = contract.try_marketPrice()
  const priceRate = try_marketPrice.reverted ? BigInt.fromI32(0) : try_marketPrice.value.value0
  const priceGoal = try_marketPrice.reverted ? BigInt.fromI32(0) : try_marketPrice.value.value1

  const documentNames = contract.getAllDocuments()
  const documentValues: string[] = []
  for (let i = 0; i < documentNames.length; i++) {
    documentValues.push(contract.getDocument(documentNames[i]).value0)
  }
  return {
    token: baseInfo.value0,
    bidToken: bidToken,
    startTime: baseInfo.value1,
    endTime: baseInfo.value2,
    totalTokens: marketInfo.value2,
    priceDrop,
    priceRate,
    priceGoal,
    documentNames,
    documentValues
  }
}

