import { Address, BigDecimal, BigInt, ethereum, log } from '@graphprotocol/graph-ts'
import { BatchAuction } from '../../generated/templates/BatchAuction/BatchAuction'
import { DutchAuction } from '../../generated/templates/DutchAuction/DutchAuction'
import { CrowdsaleAuction } from '../../generated/templates/CrowdsaleAuction/CrowdsaleAuction'
import { MarketCreated } from '../../generated/MISOMarket/MISOMarket'
import { Auction } from '../../generated/schema'
import { createDocumentcollection, updateDocument } from './document-collection'
import { getTemplate } from './template'
import { getOrCreateToken } from './token'
import { AuctionType } from '../constants'
import { toDecimal } from './number-converter'
// import { createPointList } from './pointlist'

export function createAuction(event: MarketCreated): Auction | null {
  const auctionId = event.params.addr.toHex()
  const auction = new Auction(auctionId)
  const template = getTemplate(event.params.marketTemplate.toHex())
  auction.type = template.type
  log.warning("template {}", [event.params.addr.toHex()])
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
  log.warning("created tokens ",[])
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
  // if (auction.type != AuctionType.BATCH && auctionDetails.minimumPrice.gt(BigInt.fromI32(0))) {
  //   auction.minimumRaised = auctionDetails.totalTokens.div(auctionDetails.minimumPrice)
  // } else {
  //   auction.minimumRaised = auctionDetails.minimumRaised
  // }
  // auction.minimumRaised = auctionDetails.minimumRaised
  auction.amountRaised = BigInt.fromI32(0)
  auction.usePointList = auctionDetails.usePointList
  if (auctionDetails.pointList != Address.fromString("0x0000000000000000000000000000000000000000")) {
    log.warning("pointlist {} ", [auctionDetails.pointList.toHex()])
      // createPointList(auctionDetails.pointList.toHex())
  }
  log.warning("save auction ",[])

  auction.save()
  updateDocument(auctionId, auctionDetails.documentNames, auctionDetails.documentValues)
  log.warning("updateDocument",[])

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
  pointList: Address
  usePointList: boolean
  documentNames: string[]
  documentValues: string[]
}

function getAuctionDetails<T>(contract: T): AuctionDetails {
  if (contract instanceof CrowdsaleAuction || contract instanceof DutchAuction || contract instanceof BatchAuction) {
    // CHECK ALL THESE, ADD TRY.
    let baseInfo = contract.try_getBaseInformation()
    if (baseInfo.reverted) {
      throw new Error("getBaseInformation reverted")
    }
    let bidToken = contract.try_paymentCurrency()
    if (bidToken.reverted) {
      throw new Error("try_paymentCurrency reverted")
    }
    const marketInfo = contract.try_marketInfo()
    if (marketInfo.reverted) {
      throw new Error("try_marketInfo reverted")
    }

    log.warning("fetch point list", [])
    const tryPointList = contract.try_pointList()
    const pointList = tryPointList.reverted ? Address.fromString("0x0000000000000000000000000000000000000000") : tryPointList.value
    log.warning("fetched point list {}", [pointList.toHex()])
    let totalTokens = marketInfo.reverted ? BigInt.fromI32(0) : marketInfo.value.value2
    let priceDrop = BigInt.fromI32(0)
    let priceRate = BigInt.fromI32(0)
    let priceGoal = BigInt.fromI32(0)
    let startPrice = BigInt.fromI32(0)
    let minimumPrice = BigInt.fromI32(0)
    let minimumRaised = BigInt.fromI32(0)
    let usePointList = false

    if (contract instanceof CrowdsaleAuction) {
      log.warning("cs before market price", [])
      const marketPrice = contract.marketPrice()
      priceRate = marketPrice.value0
      priceGoal = marketPrice.value1
      const marketStatus = contract.marketStatus()
      log.warning("cs before market status", [])
      usePointList = marketStatus.value2
    }
    if (contract instanceof DutchAuction) {
      log.warning("d before price drop", [])
      priceDrop = contract.priceDrop()
      log.warning("d before mp", [])
      const marketPrice = contract.marketPrice()
      startPrice = marketPrice.value0
      minimumPrice = marketPrice.value1
      log.warning("d before ms", [])
      const marketStatus = contract.marketStatus()
      usePointList = marketStatus.value2
    }
    else if (contract instanceof BatchAuction) {
      log.warning("b before ms", [])
      const marketStatus = contract.marketStatus()
      minimumRaised = marketStatus.value1

      usePointList = marketStatus.value3
    }

    log.warning("before getAllDocuments", [])
    const tryDocumentNames = contract.try_getAllDocuments()
    let documentNames: string[] = []
    if (!tryDocumentNames.reverted) {
      documentNames = tryDocumentNames.value
    }
    log.warning("before getAllDocuments", [])
    const documentValues: string[] = []
    for (let i = 0; i < documentNames.length; i++) {
      const tryDocumentValue = contract.try_getDocument(documentNames[i])
      if (!tryDocumentValue.reverted) {
      documentValues.push(tryDocumentValue.value.value0)
      }
    }
    return {
      auctionToken: baseInfo.value.value0,
      bidToken: bidToken.value,
      startTime: baseInfo.value.value1,
      endTime: baseInfo.value.value2,
      totalTokens,
      priceDrop,
      priceRate,
      priceGoal,
      startPrice,
      minimumPrice,
      minimumRaised,
      pointList,
      usePointList,
      documentNames,
      documentValues
    }
  } else {
    throw new Error("contract type not implemented")
  }
}

