import { Address } from '@graphprotocol/graph-ts'

export const ACTIVE = 'ACTIVE'
export const CANCELLED = 'CANCELLED'

export const DEPOSIT = 'DEPOSIT'
export const EXTEND = 'EXTEND'
export const WITHDRAWAL = 'WITHDRAWAL'
export const DISBURSEMENT = 'DISBURSEMENT'

export const GLOBAL_ID = '1'
export const STREAM_PREFIX = 'stream:'
export const VESTING_PREFIX = 'vesting:'

export const ZERO_ADDRESS = Address.fromString('0x0000000000000000000000000000000000000000')

const HOUR = 60 * 60
const DAY = 24 * HOUR
export const WEEK = 7 * DAY
export const YEAR = 365 * DAY
