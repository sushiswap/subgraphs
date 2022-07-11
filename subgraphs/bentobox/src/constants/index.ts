import { Address } from '@graphprotocol/graph-ts'

export const BENTOBOX_ADDRESS = Address.fromString('0x0319000133d3ada02600f0875d2cf03d442c3367')

export const DEPOSIT = 'deposit'
export const TRANSFER = 'transfer'
export const WITHDRAW = 'withdraw'

export const HOUR_INFIX = '-hour-'
export const DAY_INFIX = '-day-'
export const BENTOBOX_HOURLY_KPI_PREFIX = 'bentobox'.concat(HOUR_INFIX)
export const BENTOBOX_DAY_KPI_PREFIX = 'bentobox'.concat(DAY_INFIX)
