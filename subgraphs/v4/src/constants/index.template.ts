import { BigInt, BigDecimal, Address } from '@graphprotocol/graph-ts'
import { PoolManager as PoolManagerContract } from '../../generated/PoolManager/PoolManager'
import { hexToBigInt } from '../utils'
import { NativeTokenDetails } from '../utils/nativeTokenDetails'
import { StaticTokenDefinition } from '../utils/staticTokenDefinition'

export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000'

// Note: All token and pool addresses should be lowercased!
export const POOL_MANAGER_ADDRESS = '{{ v4.poolManager.address }}'.toLowerCase()

export const ZERO_BI = BigInt.fromI32(0)
export const ONE_BI = BigInt.fromI32(1)
export const ZERO_BD = BigDecimal.fromString('0')
export const ONE_BD = BigDecimal.fromString('1')
export const BI_18 = BigInt.fromI32(18)
export const MaxUint256 = hexToBigInt('ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')
export const Q96 = BigInt.fromI32(2).pow(96)


export const STABLECOIN_WRAPPED_NATIVE_POOL_ID = '{{ v4.stablecoinWrappedNativePoolId }}'.toLowerCase()
export const STABLECOIN_IS_TOKEN_0: boolean = {{ v4.stablecoinIsToken0 }}

export const WRAPPED_NATIVE_ADDRESS = '{{ v4.wrappedNativeAddress }}'.toLowerCase()

export const MINIMUM_NATIVE_LOCKED = BigDecimal.fromString('{{ v4.minimumNativeLocked }}')

export const STABLECOIN_ADDRESSES: string[] = '{{ v4.stablecoinAddresses }}'.toLowerCase().split(',')

export const WHITELISTED_TOKEN_ADDRESSES: string[] = '{{ v4.whitelistTokens }}'.toLowerCase().split(',')

export const TOKEN_OVERRIDES: StaticTokenDefinition[] = [
{{#v4.tokenOverrides}}
  {
    address: Address.fromString('{{address}}'.toLowerCase()),
    symbol: '{{symbol}}',
    name: '{{name}}',
    decimals: BigInt.fromI32({{decimals}}),
  },
{{/v4.tokenOverrides}}
];
export const POOLS_TO_SKIP: string[] = []
export const POOL_MAPPINGS: Address[][] = []

export const NATIVE_TOKEN_DETAILS: NativeTokenDetails = {
  symbol: '{{ v4.nativeTokenDetails.symbol }}',
  name: '{{ v4.nativeTokenDetails.name }}',
  decimals: BigInt.fromString('{{ v4.nativeTokenDetails.decimals }}'),

}

export const poolManagerContract = PoolManagerContract.bind(Address.fromString(POOL_MANAGER_ADDRESS))
