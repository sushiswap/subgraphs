import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts'

export const ACTIVE = 'ACTIVE'
export const CANCELLED = 'CANCELLED'

export const DEPOSIT = 'DEPOSIT'
export const EXTEND = 'EXTEND'
export const WITHDRAWAL = 'WITHDRAWAL'
export const DISBURSEMENT = 'DISBURSEMENT'

export const GLOBAL_ID = '1'

export const BENTOBOX_ADDRESS = Address.fromString('{{ bentobox.address }}')
export const ZERO_ADDRESS = Address.fromString('0x0000000000000000000000000000000000000000')
export const FURO_STREAM_ADDRESS = Address.fromString('{{ furo.stream.address }}')
export const FURO_VESTING_ADDRESS = Address.fromString('{{ furo.vesting.address }}')

export const BIG_INT_ZERO = BigInt.fromI32(0)
export const BIG_DECIMAL_ZERO = BigDecimal.fromString('0')
export const BIG_DECIMAL_ONE = BigDecimal.fromString('1')
export const BIG_INT_ONE = BigInt.fromI32(1)

export const HOUR = 60 * 60
export const DAY = 24 * HOUR
export const WEEK = 7 * DAY
export const YEAR = 365 * DAY
