import { Address, BigDecimal, BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts'
import { assert, createMockedFunction, newMockEvent } from 'matchstick-as'

import { handleInitializeHelper } from '../../src/mappings/poolManager'
import { Initialize } from '../../generated/PoolManager/PoolManager'
import { Pool, Token } from '../../generated/schema'
import { SubgraphConfig } from '../../src/utils/chains'
import { ADDRESS_ZERO, ZERO_BD, ZERO_BI } from '../../src/constants'

const POOL_MANAGER_ADDRESS = '0xE8E23e97Fa135823143d6b9Cba9c699040D51F70'
const USDC_MAINNET_ADDRESS = '0x5d1abc83973c773d122ae7c551251cc9be2baecc'
const WETH_MAINNET_ADDRESS = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
const WBTC_MAINNET_ADDRESS = '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'
const NATIVE_TOKEN_ADDRESS = '0x0000000000000000000000000000000000000000'
export const POOL_FEE_TIER_05 = 500

export const USDC_WETH_POOL_ID = '0x85c41d6535ebab7661979fa7a5d331e4cb229b4d1e7dde1a78ae298fab8ca5bb'
export const WBTC_WETH_POOL_ID = '0x0dac90a31985829dc2bbeb5e70fd7e302ef8ca149f58dc485e71f53735bad8e4'

export const TEST_CONFIG: SubgraphConfig = {
  poolManagerAddress: POOL_MANAGER_ADDRESS,
  stablecoinWrappedNativePoolId: USDC_WETH_POOL_ID,
  stablecoinIsToken0: true,
  wrappedNativeAddress: WETH_MAINNET_ADDRESS,
  minimumNativeLocked: ZERO_BD,
  stablecoinAddresses: [USDC_MAINNET_ADDRESS],
  whitelistTokens: [WETH_MAINNET_ADDRESS, USDC_MAINNET_ADDRESS],
  tokenOverrides: [],
  poolsToSkip: [],
  poolMappings: [],
  nativeTokenDetails: {
    symbol: 'ETH',
    name: 'Ethereum',
    decimals: BigInt.fromI32(18),
  },
}

export class TokenFixture {
  address: string
  symbol: string
  name: string
  totalSupply: string
  decimals: string
  balanceOf: string
}

export const USDC_MAINNET_FIXTURE: TokenFixture = {
  address: USDC_MAINNET_ADDRESS,
  symbol: 'USDC',
  name: 'USD Coin',
  totalSupply: '300',
  decimals: '18', // fix
  balanceOf: '1000',
}

export const WETH_MAINNET_FIXTURE: TokenFixture = {
  address: WETH_MAINNET_ADDRESS,
  symbol: 'WETH',
  name: 'Wrapped Ether',
  totalSupply: '100',
  decimals: '18',
  balanceOf: '500',
}

export const NATIVE_TOKEN_FIXTURE: TokenFixture = {
  address: NATIVE_TOKEN_ADDRESS,
  symbol: 'ETH',
  name: 'Ethereum',
  totalSupply: '1000000000000000000',
  decimals: '18',
  balanceOf: '1000000000000000000',
}

export const WBTC_MAINNET_FIXTURE: TokenFixture = {
  address: WBTC_MAINNET_ADDRESS,
  symbol: 'WBTC',
  name: 'Wrapped Bitcoin',
  totalSupply: '200',
  decimals: '8',
  balanceOf: '750',
}

export const getTokenFixture = (tokenAddress: string): TokenFixture => {
  if (tokenAddress == USDC_MAINNET_FIXTURE.address) {
    return USDC_MAINNET_FIXTURE
  } else if (tokenAddress == WETH_MAINNET_FIXTURE.address) {
    return WETH_MAINNET_FIXTURE
  } else if (tokenAddress == WBTC_MAINNET_FIXTURE.address) {
    return WBTC_MAINNET_FIXTURE
  } else {
    throw new Error('Token address not found in fixtures')
  }
}

export class PoolFixture {
  id: string
  token0: TokenFixture
  token1: TokenFixture
  feeTier: string
  tickSpacing: string
  liquidity: string
  hooks: string
  sqrtPrice: string
  tick: string
}

export const USDC_WETH_05_MAINNET_POOL_FIXTURE: PoolFixture = {
  id: USDC_WETH_POOL_ID,
  token0: USDC_MAINNET_FIXTURE,
  token1: WETH_MAINNET_FIXTURE,
  feeTier: '500',
  tickSpacing: '10',
  liquidity: '100',
  hooks: ADDRESS_ZERO,
  sqrtPrice: '1',
  tick: '1',
}

export const WBTC_WETH_03_MAINNET_POOL_FIXTURE: PoolFixture = {
  id: WBTC_WETH_POOL_ID,
  token0: WBTC_MAINNET_FIXTURE,
  token1: WETH_MAINNET_FIXTURE,
  feeTier: '3000',
  tickSpacing: '60',
  liquidity: '200',
  hooks: ADDRESS_ZERO,
  sqrtPrice: '1',
  tick: '1',
}

export class PoolKeyFixture {
  id: string
  token0: string
  token1: string
  fee: i32
  tickSpacing: i32
  hooks: string
}

export class PositionConfigFixture {
  id: string
  poolKey: PoolKeyFixture
  tickLower: i32
  tickUpper: i32
}

export class PositionFixture {
  id: string
  tokenId: BigInt
  owner: Address
  origin: Address
}

export const getPoolFixture = (poolAddress: string): PoolFixture => {
  if (poolAddress == WBTC_WETH_POOL_ID) {
    return WBTC_WETH_03_MAINNET_POOL_FIXTURE
  } else if (poolAddress == USDC_WETH_POOL_ID) {
    return USDC_WETH_05_MAINNET_POOL_FIXTURE
  } else {
    throw new Error('Pool address not found in fixtures')
  }
}

export const TEST_ETH_PRICE_USD = BigDecimal.fromString('2000')
export const TEST_USDC_DERIVED_ETH = BigDecimal.fromString('1').div(BigDecimal.fromString('2000'))
export const TEST_WETH_DERIVED_ETH = BigDecimal.fromString('1')

export const MOCK_EVENT = newMockEvent()

export const POSITION_FIXTURE: PositionFixture = {
  id: '1',
  tokenId: BigInt.fromI32(1 as i32),
  origin: MOCK_EVENT.address,
  owner: MOCK_EVENT.address,
}

export const invokePoolCreatedWithMockedEthCalls = (
  mockEvent: ethereum.Event,
  subgraphConfig: SubgraphConfig,
): void => {
  const pool = getPoolFixture(USDC_WETH_POOL_ID)
  const feeTier = pool.feeTier
  const tickSpacing = pool.tickSpacing
  const token0 = getTokenFixture(pool.token0.address)
  const token1 = getTokenFixture(pool.token1.address)
  const sqrtPriceX96 = pool.sqrtPrice
  const tick = pool.tick

  const token0Address = Address.fromString(token0.address)
  const token1Address = Address.fromString(token1.address)

  const id = Bytes.fromHexString(USDC_WETH_POOL_ID) as Bytes

  const hooksAddress = Address.fromString(ADDRESS_ZERO)
  const parameters = [
    new ethereum.EventParam('id', ethereum.Value.fromFixedBytes(id)),
    new ethereum.EventParam('currency0', ethereum.Value.fromAddress(token0Address)),
    new ethereum.EventParam('currency1', ethereum.Value.fromAddress(token1Address)),
    new ethereum.EventParam('fee', ethereum.Value.fromI32(parseInt(feeTier) as i32)),
    new ethereum.EventParam('tickSpacing', ethereum.Value.fromI32(parseInt(tickSpacing) as i32)),
    new ethereum.EventParam('hooks', ethereum.Value.fromAddress(hooksAddress)),
    new ethereum.EventParam('sqrtPriceX96', ethereum.Value.fromUnsignedBigInt(BigInt.fromString(sqrtPriceX96))),
    new ethereum.EventParam('tick', ethereum.Value.fromI32(parseInt(tick) as i32)),
  ]

  const initializeEvent = new Initialize(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    parameters,
    mockEvent.receipt,
  )
  // create mock contract calls for token0
  createMockedFunction(token0Address, 'symbol', 'symbol():(string)').returns([ethereum.Value.fromString(token0.symbol)])
  createMockedFunction(token0Address, 'name', 'name():(string)').returns([ethereum.Value.fromString(token0.name)])
  createMockedFunction(token0Address, 'totalSupply', 'totalSupply():(uint256)').returns([
    ethereum.Value.fromUnsignedBigInt(BigInt.fromString(token0.totalSupply)),
  ])
  createMockedFunction(token0Address, 'decimals', 'decimals():(uint32)').returns([
    ethereum.Value.fromUnsignedBigInt(BigInt.fromString(token0.decimals)),
  ])
  // create mock contract calls for token1
  createMockedFunction(token1Address, 'symbol', 'symbol():(string)').returns([ethereum.Value.fromString(token1.symbol)])
  createMockedFunction(token1Address, 'name', 'name():(string)').returns([ethereum.Value.fromString(token1.name)])
  createMockedFunction(token1Address, 'totalSupply', 'totalSupply():(uint256)').returns([
    ethereum.Value.fromUnsignedBigInt(BigInt.fromString(token1.totalSupply)),
  ])
  createMockedFunction(token1Address, 'decimals', 'decimals():(uint32)').returns([
    ethereum.Value.fromUnsignedBigInt(BigInt.fromString(token1.decimals)),
  ])
  handleInitializeHelper(initializeEvent)
}

// More lightweight than the method above which invokes handlePoolCreated. This
// method only creates the pool entity while the above method also creates the
// relevant token and factory entities.
export const createAndStoreTestPool = (poolFixture: PoolFixture): Pool => {
  const poolAddress = poolFixture.id
  const token0Address = poolFixture.token0.address
  const token1Address = poolFixture.token1.address
  const feeTier = parseInt(poolFixture.feeTier) as i32
  const tickSpacing = parseInt(poolFixture.tickSpacing) as i32
  const sqrtPriceX96 = poolFixture.sqrtPrice
  const tick = parseInt(poolFixture.tick) as i32

  const pool = new Pool(poolAddress)
  pool.createdAtTimestamp = ZERO_BI
  pool.createdAtBlockNumber = ZERO_BI
  pool.token0 = token0Address
  pool.token1 = token1Address
  pool.feeTier = BigInt.fromI32(feeTier)
  pool.tickSpacing = BigInt.fromI32(tickSpacing)
  pool.liquidity = ZERO_BI
  pool.parameters = Bytes.empty() // No parameters in this fixture
  pool.sqrtPrice = BigInt.fromString(sqrtPriceX96)
  pool.token0Price = ZERO_BD
  pool.token1Price = ZERO_BD
  pool.tick = BigInt.fromI32(tick)
  pool.observationIndex = ZERO_BI
  pool.volumeToken0 = ZERO_BD
  pool.volumeToken1 = ZERO_BD
  pool.volumeUSD = ZERO_BD
  pool.untrackedVolumeUSD = ZERO_BD
  pool.feesUSD = ZERO_BD
  pool.txCount = ZERO_BI
  pool.collectedFeesToken0 = ZERO_BD
  pool.collectedFeesToken1 = ZERO_BD
  pool.collectedFeesUSD = ZERO_BD
  pool.totalValueLockedToken0 = ZERO_BD
  pool.totalValueLockedToken1 = ZERO_BD
  pool.totalValueLockedUSD = ZERO_BD
  pool.totalValueLockedETH = ZERO_BD
  pool.totalValueLockedUSDUntracked = ZERO_BD
  pool.liquidityProviderCount = ZERO_BI
  pool.hooks = ADDRESS_ZERO

  pool.save()
  return pool
}

export const createAndStoreTestToken = (tokenFixture: TokenFixture): Token => {
  const token = new Token(tokenFixture.address)
  token.symbol = tokenFixture.symbol
  token.name = tokenFixture.name
  token.decimals = BigInt.fromString(tokenFixture.decimals)
  token.totalSupply = BigInt.fromString(tokenFixture.totalSupply)
  token.volume = ZERO_BD
  token.volumeUSD = ZERO_BD
  token.untrackedVolumeUSD = ZERO_BD
  token.feesUSD = ZERO_BD
  token.txCount = ZERO_BI
  token.poolCount = ZERO_BI
  token.totalValueLocked = ZERO_BD
  token.totalValueLockedUSD = ZERO_BD
  token.totalValueLockedUSDUntracked = ZERO_BD
  token.derivedETH = ZERO_BD
  token.whitelistPools = []

  token.save()
  return token
}

// Typescript for Subgraphs do not support Record types so we use a 2D string array to represent the object instead.
export const assertObjectMatches = (entityType: string, id: string, obj: string[][]): void => {
  for (let i = 0; i < obj.length; i++) {
    assert.fieldEquals(entityType, id, obj[i][0], obj[i][1])
  }
}
