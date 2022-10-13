import { Address } from '@graphprotocol/graph-ts'

export const BENTOBOX_ADDRESS = Address.fromString('0x80c7dd17b01855a6d2347444a0fcc36136a314de')

export const DEPOSIT = 'deposit'
export const TRANSFER = 'transfer'
export const WITHDRAW = 'withdraw'

export const HOUR_INFIX = '-hour-'
export const DAY_INFIX = '-day-'
export const BENTOBOX_HOURLY_KPI_PREFIX = 'bentobox'.concat(HOUR_INFIX)
export const BENTOBOX_DAY_KPI_PREFIX = 'bentobox'.concat(DAY_INFIX)
