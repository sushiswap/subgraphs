import { Address } from '@graphprotocol/graph-ts'

export const BENTOBOX_ADDRESS = Address.fromString('0xf5bce5077908a1b7370b9ae04adc565ebd643966')

export const DEPOSIT = 'deposit'
export const TRANSFER = 'transfer'
export const WITHDRAW = 'withdraw'

export const HOUR_INFIX = '-hour-'
export const DAY_INFIX = '-day-'
export const BENTOBOX_HOURLY_KPI_PREFIX = 'bentobox'.concat(HOUR_INFIX)
export const BENTOBOX_DAY_KPI_PREFIX = 'bentobox'.concat(DAY_INFIX)
