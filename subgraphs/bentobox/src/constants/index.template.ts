import { Address } from '@graphprotocol/graph-ts'

export const BENTOBOX_ADDRESS = Address.fromString('{{ bentobox.address }}')

export const DEPOSIT = 'deposit'
export const TRANSFER = 'transfer'
export const WITHDRAW = 'withdraw'

export const BENTOBOX_HOURLY_KPI_PREFIX = 'bentobox-hour-'
export const BENTOBOX_DAY_KPI_PREFIX = 'bentobox-day-'