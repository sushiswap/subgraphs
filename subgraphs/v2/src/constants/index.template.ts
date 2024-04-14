import { Address, BigDecimal } from '@graphprotocol/graph-ts'

export const NATIVE_ADDRESS = '{{ v2.nativeAddress }}'
export const WHITELIST: string[] = '{{ v2.whitelistAddresses }}'.toLowerCase().split(',')
export const USDC_NATIVE_PAIR = Address.fromString('{{ v2.usdcPair }}').toHexString().toLowerCase()
export const USDT_NATIVE_PAIR = Address.fromString('{{ v2.usdtPair }}').toHexString().toLowerCase()
export const DAI_NATIVE_PAIR = Address.fromString('{{ v2.daiPair }}').toHexString().toLowerCase()
export const NETWORK = '{{ network }}'

export const MINIMUM_LIQUIDITY_THRESHOLD_ETH = BigDecimal.fromString('{{ v2.minimumNativeLiquidity }}')

export const FACTORY_ADDRESS = Address.fromString('{{ v2.factory.address }}').toHex().toLowerCase()