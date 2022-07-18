import { Address } from '@graphprotocol/graph-ts'

export const SUSHI_LP_TOKEN = 'Sushi LP Token'
export const SUSHISWAP_LP_TOKEN = 'SushiSwap LP Token'
export const KASHI_MEDIUM_RISK = 'Kashi Medium Risk'

export const TRIDENT = 'TRIDENT'
export const LEGACY = 'LEGACY'
export const KASHI = 'KASHI'
export const TOKEN = 'TOKEN'

export const STAKE = 'STAKE'
export const UNSTAKE = 'UNSTAKE'
export const CLAIM = 'CLAIM'

export const GLOBAL = 'GLOBAL'

export const ADDRESS_ZERO = Address.fromString('0x0000000000000000000000000000000000000000')
export const STAKING_CONTRACT_ADDRESS = Address.fromString('{{ staking.address }}')
