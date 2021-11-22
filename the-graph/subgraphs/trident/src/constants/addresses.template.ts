import { Address } from '@graphprotocol/graph-ts'

export const ADDRESS_ZERO = Address.fromString('0x0000000000000000000000000000000000000000')

export const MASTER_DEPLOYER_ADDRESS = Address.fromString('{{ masterDeployer.address }}')

export const CONSTANT_PRODUCT_POOL_FACTORY_ADDRESS = Address.fromString('{{ constantProductPoolFactory.address }}')

export const HYBRID_POOL_FACTORY_ADDRESS = Address.fromString('{{ hybridPoolFactory.address }}')

export const INDEX_POOL_FACTORY_ADDRESS = Address.fromString('{{ indexPoolFactory.address }}')

export const CONCENTRATED_LIQUIDITY_POOL_FACTORY_ADDRESS = Address.fromString(
  '{{ concentratedLiquidityPoolFactory.address }}'
)

export const NATIVE_ADDRESS = Address.fromString('{{ native.address }}')

export const WHITELISTED_TOKEN_ADDRESSES: string[] = '{{ whitelistedTokenAddresses }}'.split(',')

export const STABLE_TOKEN_ADDRESSES: string[] = '{{ stableTokenAddresses }}'.split(',')

export const STABLE_POOL_ADDRESSES: string[] = '{{ stablePoolAddresses }}'.split(',')
