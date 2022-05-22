import { Address, BigInt } from '@graphprotocol/graph-ts'

export const MIN_TTL = BigInt.fromString('{{ auctionMaker.minTTL }}')
export const MAX_TTL = BigInt.fromString('{{ auctionMaker.maxTTL }}')

export const AUCTION_MAKER = 'Auction-maker'
export const BID_TOKEN_ADDRESS = Address.fromString('{{ auctionMaker.bidToken }}')

export const ONGOING = 'ONGOING'
export const FINISHED = 'FINISHED'
