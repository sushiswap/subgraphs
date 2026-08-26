import { Address, BigDecimal, BigInt, dataSource } from '@graphprotocol/graph-ts'

import { NativeTokenDetails } from './nativeTokenDetails'
import { StaticTokenDefinition } from './staticTokenDefinition'
import { MINIMUM_NATIVE_LOCKED, NATIVE_TOKEN_DETAILS, POOL_MANAGER_ADDRESS, POOL_MAPPINGS, POOLS_TO_SKIP, STABLECOIN_ADDRESSES, STABLECOIN_IS_TOKEN_0, STABLECOIN_WRAPPED_NATIVE_POOL_ID, TOKEN_OVERRIDES, WHITELISTED_TOKEN_ADDRESSES, WRAPPED_NATIVE_ADDRESS } from '../constants'

export enum ChainId {
  SEPOLIA = 11155111,
}


// Note: All token and pool addresses should be lowercased!
export class SubgraphConfig {
  // deployment address
  poolManagerAddress: string

  // the address of a pool where one token is a stablecoin and the other is a
  // token that tracks the price of the native token use this to calculate the
  // price of the native token, so prefer a pool with highest liquidity
  stablecoinWrappedNativePoolId: string

  // true is stablecoin is token0, false if stablecoin is token1
  stablecoinIsToken0: boolean

  // the address of a token that tracks the price of the native token, most of
  // the time, this is a wrapped asset but could also be the native token itself
  // for some chains
  wrappedNativeAddress: string

  // the mimimum liquidity in a pool needed for it to be used to help calculate
  // token prices. for new chains, this should be initialized to ~4000 USD
  minimumNativeLocked: BigDecimal

  // list of stablecoin addresses
  stablecoinAddresses: string[]

  // a token must be in a pool with one of these tokens in order to derive a
  // price (in addition to passing the minimumEthLocked check). This is also
  // used to determine whether volume is tracked or not.
  whitelistTokens: string[]

  // token overrides are used to override RPC calls for the symbol, name, and
  // decimals for tokens. for new chains this is typically empty.
  tokenOverrides: StaticTokenDefinition[]

  // skip the creation of these pools in handlePoolCreated. for new chains this is typically empty.
  poolsToSkip: string[]

  // initialize this list of pools and token addresses on factory creation. for new chains this is typically empty.
  poolMappings: Array<Address[]>

  // native token details for the chain.
  nativeTokenDetails: NativeTokenDetails
}

export function getSubgraphConfig(): SubgraphConfig {
  return {
    poolManagerAddress: POOL_MANAGER_ADDRESS,
    whitelistTokens: WHITELISTED_TOKEN_ADDRESSES,
    tokenOverrides: TOKEN_OVERRIDES,
    poolsToSkip: POOLS_TO_SKIP,
    stablecoinWrappedNativePoolId: STABLECOIN_WRAPPED_NATIVE_POOL_ID,
    stablecoinIsToken0: STABLECOIN_IS_TOKEN_0,
    wrappedNativeAddress: WRAPPED_NATIVE_ADDRESS,
    stablecoinAddresses: STABLECOIN_ADDRESSES,
    minimumNativeLocked: MINIMUM_NATIVE_LOCKED,
    nativeTokenDetails: NATIVE_TOKEN_DETAILS,
    poolMappings: POOL_MAPPINGS
  }
}
