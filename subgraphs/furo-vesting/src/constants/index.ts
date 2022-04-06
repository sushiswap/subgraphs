import { Address } from "@graphprotocol/graph-ts"

export const ACTIVE = 'ACTIVE'
export const CANCELLED = 'CANCELLED'
export const EXPIRED = 'EXPIRED'

export const DEPOSIT = 'DEPOSIT'
export const WITHDRAWAL = 'WITHDRAWAL'
export const DISBURSEMENT = 'DISBURSEMENT'

export const START = 'START'
export const CLIFF = 'CLIFF'
export const STEP = 'STEP'
export const END = 'END'

export const FURO_VESTING = 'FuroVesting'

export const ZERO_ADDRESS = Address.fromString('0x0000000000000000000000000000000000000000')
export const MAX_STEP_THRESHOLD = 160

const HOUR = 60 * 60
const DAY = 24 * HOUR
export const WEEK = 7 * DAY
export const YEAR = 365 * DAY
