import { BigInt, Bytes, log } from '@graphprotocol/graph-ts'

import { Initialize as InitializeEvent } from '../../generated/PoolManager/PoolManager'
import { PoolManager } from '../../generated/schema'
import { Bundle, Pool, Token } from '../../generated/schema'
import { getSubgraphConfig, SubgraphConfig } from '../utils/chains'
import { ADDRESS_ZERO, ONE_BI, ZERO_BD, ZERO_BI } from '../constants'
import { updatePoolDayData, updatePoolHourData } from '../utils/intervalUpdates'
import { findNativePerToken, getNativePriceInUSD, sqrtPriceX96ToTokenPrices } from '../utils/pricing'
import { fetchTokenDecimals, fetchTokenName, fetchTokenSymbol, fetchTokenTotalSupply } from '../utils/token'

// The subgraph handler must have this signature to be able to handle events,
// however, we invoke a helper in order to inject dependencies for unit tests.
export function handleInitialize(event: InitializeEvent): void {
  handleInitializeHelper(event)
}

export function handleInitializeHelper(
  event: InitializeEvent,
  subgraphConfig: SubgraphConfig = getSubgraphConfig(),
): void {
  const poolManagerAddress = subgraphConfig.poolManagerAddress
  const whitelistTokens = subgraphConfig.whitelistTokens
  const tokenOverrides = subgraphConfig.tokenOverrides
  const poolsToSkip = subgraphConfig.poolsToSkip
  const stablecoinWrappedNativePoolId = subgraphConfig.stablecoinWrappedNativePoolId
  const stablecoinIsToken0 = subgraphConfig.stablecoinIsToken0
  const wrappedNativeAddress = subgraphConfig.wrappedNativeAddress
  const stablecoinAddresses = subgraphConfig.stablecoinAddresses
  const minimumNativeLocked = subgraphConfig.minimumNativeLocked
  const nativeTokenDetails = subgraphConfig.nativeTokenDetails
  const poolId = event.params.id.toHexString()

  if (poolsToSkip.includes(poolId)) {
    return
  }

  // load pool manager
  let poolManager = PoolManager.load(poolManagerAddress)
  if (poolManager === null) {
    poolManager = new PoolManager(poolManagerAddress)
    poolManager.poolCount = ZERO_BI
    poolManager.totalVolumeETH = ZERO_BD
    poolManager.totalVolumeUSD = ZERO_BD
    poolManager.untrackedVolumeUSD = ZERO_BD
    poolManager.totalFeesUSD = ZERO_BD
    poolManager.totalFeesETH = ZERO_BD
    poolManager.totalValueLockedETH = ZERO_BD
    poolManager.totalValueLockedUSD = ZERO_BD
    poolManager.totalValueLockedUSDUntracked = ZERO_BD
    poolManager.totalValueLockedETHUntracked = ZERO_BD
    poolManager.txCount = ZERO_BI
    poolManager.owner = ADDRESS_ZERO

    // create new bundle for tracking eth price
    const bundle = new Bundle('1')
    bundle.ethPriceUSD = ZERO_BD
    bundle.save()
  }

  poolManager.poolCount = poolManager.poolCount.plus(ONE_BI)
  const pool = new Pool(poolId)
  let token0 = Token.load(event.params.currency0.toHexString())
  let token1 = Token.load(event.params.currency1.toHexString())

  // fetch info if null
  if (token0 === null) {
    token0 = new Token(event.params.currency0.toHexString())
    token0.symbol = fetchTokenSymbol(event.params.currency0, tokenOverrides, nativeTokenDetails)
    token0.name = fetchTokenName(event.params.currency0, tokenOverrides, nativeTokenDetails)
    token0.totalSupply = fetchTokenTotalSupply(event.params.currency0)
    const decimals = fetchTokenDecimals(event.params.currency0, tokenOverrides, nativeTokenDetails)

    // bail if we couldn't figure out the decimals
    if (decimals === null) {
      log.debug('mybug the decimal on token 0 was null', [])
      return
    }

    token0.decimals = decimals
    token0.derivedETH = ZERO_BD
    token0.volume = ZERO_BD
    token0.volumeUSD = ZERO_BD
    token0.feesUSD = ZERO_BD
    token0.untrackedVolumeUSD = ZERO_BD
    token0.totalValueLocked = ZERO_BD
    token0.totalValueLockedUSD = ZERO_BD
    token0.totalValueLockedUSDUntracked = ZERO_BD
    token0.txCount = ZERO_BI
    token0.poolCount = ZERO_BI
    token0.whitelistPools = []
  }

  if (token1 === null) {
    token1 = new Token(event.params.currency1.toHexString())
    token1.symbol = fetchTokenSymbol(event.params.currency1, tokenOverrides, nativeTokenDetails)
    token1.name = fetchTokenName(event.params.currency1, tokenOverrides, nativeTokenDetails)
    token1.totalSupply = fetchTokenTotalSupply(event.params.currency1)
    const decimals = fetchTokenDecimals(event.params.currency1, tokenOverrides, nativeTokenDetails)

    if (decimals === null) {
      log.debug('mybug the decimal on token 0 was null', [])
      return
    }

    token1.decimals = decimals
    token1.derivedETH = ZERO_BD
    token1.volume = ZERO_BD
    token1.volumeUSD = ZERO_BD
    token1.untrackedVolumeUSD = ZERO_BD
    token1.feesUSD = ZERO_BD
    token1.totalValueLocked = ZERO_BD
    token1.totalValueLockedUSD = ZERO_BD
    token1.totalValueLockedUSDUntracked = ZERO_BD
    token1.txCount = ZERO_BI
    token1.poolCount = ZERO_BI
    token1.whitelistPools = []
  }

  // update white listed pools
  if (whitelistTokens.includes(token0.id)) {
    const newPools = token1.whitelistPools
    newPools.push(pool.id)
    token1.whitelistPools = newPools
  }
  if (whitelistTokens.includes(token1.id)) {
    const newPools = token0.whitelistPools
    newPools.push(pool.id)
    token0.whitelistPools = newPools
  }

  pool.token0 = token0.id
  pool.token1 = token1.id
  pool.feeTier = BigInt.fromI32(event.params.fee)
  pool.hooks = event.params.hooks.toHexString()
  pool.parameters = event.params.parameters
  pool.hooksRegistration = Bytes.fromUint8Array(pool.parameters.slice(30, 32))
  const tickSpacingBytes = pool.parameters.slice(27, 30)
  tickSpacingBytes.reverse()
  pool.tickSpacing = BigInt.fromByteArray(Bytes.fromUint8Array(tickSpacingBytes))
  pool.createdAtTimestamp = event.block.timestamp
  pool.createdAtBlockNumber = event.block.number
  pool.liquidityProviderCount = ZERO_BI
  pool.txCount = ZERO_BI
  pool.liquidity = ZERO_BI
  pool.sqrtPrice = ZERO_BI
  pool.token0Price = ZERO_BD
  pool.token1Price = ZERO_BD
  pool.observationIndex = ZERO_BI
  pool.totalValueLockedToken0 = ZERO_BD
  pool.totalValueLockedToken1 = ZERO_BD
  pool.totalValueLockedUSD = ZERO_BD
  pool.totalValueLockedETH = ZERO_BD
  pool.totalValueLockedUSDUntracked = ZERO_BD
  pool.volumeToken0 = ZERO_BD
  pool.volumeToken1 = ZERO_BD
  pool.volumeUSD = ZERO_BD
  pool.feesUSD = ZERO_BD
  pool.untrackedVolumeUSD = ZERO_BD

  pool.collectedFeesToken0 = ZERO_BD
  pool.collectedFeesToken1 = ZERO_BD
  pool.collectedFeesUSD = ZERO_BD

  pool.sqrtPrice = event.params.sqrtPriceX96
  pool.tick = BigInt.fromI32(event.params.tick)

  const prices = sqrtPriceX96ToTokenPrices(pool.sqrtPrice, token0, token1, nativeTokenDetails)
  pool.token0Price = prices[0]
  pool.token1Price = prices[1]

  pool.save()
  token0.save()
  token1.save()
  poolManager.save()

  // update prices
  // update ETH price now that prices could have changed
  const bundle = Bundle.load('1')!
  bundle.ethPriceUSD = getNativePriceInUSD(stablecoinWrappedNativePoolId, stablecoinIsToken0)
  bundle.save()
  updatePoolDayData(poolId, event)
  updatePoolHourData(poolId, event)
  token1.derivedETH = findNativePerToken(token1, wrappedNativeAddress, stablecoinAddresses, minimumNativeLocked)
  token0.derivedETH = findNativePerToken(token0, wrappedNativeAddress, stablecoinAddresses, minimumNativeLocked)

  token0.save()
  token1.save()
}
