import { Address, BigInt } from '@graphprotocol/graph-ts'

export const MIN_TTL = BigInt.fromString('600')
export const MAX_TTL = BigInt.fromString('1200')

export const AUCTION_MAKER = 'Auction-maker'
export const BID_TOKEN_ADDRESS = Address.fromString('0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa')

export const ONGOING = 'ONGOING'
export const FINISHED = 'FINISHED'
