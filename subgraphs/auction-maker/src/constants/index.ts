import { Address, BigInt } from '@graphprotocol/graph-ts'

const HOUR_IN_SECONDS = 3600
const DAY_IN_SECONDS = HOUR_IN_SECONDS * 24

export const MIN_TTL = BigInt.fromU64(12 * HOUR_IN_SECONDS)
export const MAX_TTL = BigInt.fromU64(3 * DAY_IN_SECONDS)

export const AUCTION_MAKER = 'Auction-maker'
export const BID_TOKEN_ADDRESS = Address.fromString('0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa')

export const ONGOING = 'ONGOING'
export const FINISHED = 'FINISHED'
