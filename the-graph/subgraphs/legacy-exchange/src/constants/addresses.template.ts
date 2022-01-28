import { Address } from '@graphprotocol/graph-ts'

export const ADDRESS_ZERO = Address.fromString('0x0000000000000000000000000000000000000000')

export const FACTORY_ADDRESS = Address.fromString('{{ legacy.factory.address }}')

export const NATIVE_ADDRESS = '{{ native.address }}'

export const WHITELISTED_TOKEN_ADDRESSES: string[] = '{{ whitelistedTokenAddresses }}'.split(',')

export const STABLE_TOKEN_ADDRESSES: string[] = '{{ stableTokenAddresses }}'.split(',')

export const STABLE_POOL_ADDRESSES: string[] = '{{ stablePoolAddresses }}'.split(',')
