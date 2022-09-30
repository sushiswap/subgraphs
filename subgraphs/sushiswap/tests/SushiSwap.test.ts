import { Address, BigDecimal, BigInt, Bytes, log } from '@graphprotocol/graph-ts'
import { assert, newMockEvent, test } from 'matchstick-as/assembly/index'
import {
  ADDRESS_ZERO, FACTORY_ADDRESS, WHITELISTED_TOKEN_ADDRESSES
} from '../src/constants'

import {
  createPairEvent,
  createSwapEvent,
  createSyncEvent,
  createTransferEvent, getOrCreateTokenMock
} from './mocks'
import { Factory, Pair, Token } from '../generated/schema'

import { clearStore, logStore } from 'matchstick-as/assembly/store'
import { getOrCreateBundle, getOrCreateFactory, getOrCreateToken, getPair, getTokenPrice } from '../src/functions'
import { onPairCreated } from '../src/mappings/factory'
import { onSwap, onSync, onTransfer } from '../src/mappings/pair'

const BIGINT_ETH_AMOUNT = BigInt.fromString('1000000000000000001')
const BIGINT_USD_AMOUNT = BigInt.fromString('3000000001')
const ETH_AMOUNT = '1.000000000000000001'
const USD_AMOUNT = '3000.000001'

const DAI_ADDRESS = WHITELISTED_TOKEN_ADDRESSES[2]
const UDSC_ADDRESS = WHITELISTED_TOKEN_ADDRESSES[1]
let poolAddress = Address.fromString('0x0000000000000000000000000000000000000420')
let factoryAddress = FACTORY_ADDRESS.toHexString()
let factory: Factory
let alice = Address.fromString('0x0000000000000000000000000000000000080085')

const TIMESTAMP1 = BigInt.fromString('1644011546') // Equivalent to	Fri Feb 04 2022 21:52:26 GMT+0000
const TIMESTAMP2 = BigInt.fromString('1644094346') // One day later than previous, Sat Feb 05 2022 20:52:26 GMT+0000
const TIMESTAMP3 = BigInt.fromString('1644097946') // One hour later than previous, Sat Feb 05 2022 21:52:26 GMT+0000

function setup(): void {
  clearStore()
  factory = getOrCreateFactory()
  setupStablePairs()
}

function cleanup(): void {
  clearStore()
}

test('When a Sandwich attack happens, the targeted pool is imbalanced and ignored from pricing.', () => {
  setup()

  const sushiSakePair = deployPair({
    token0: Address.fromString("0x6b3595068778dd592e39a122f4f5a5cf09c90fe2"),
    token0Decimals: 18,
    token0Symbol: "Sushi",
    token0Name: "SushiToken",
    token1: Address.fromString("0xe9f84de264e91529af07fa2c746e934397810334"),
    token1Decimals: 18,
    token1Symbol: "SAK3",
    token1Name: "Sake",
    pairAddress: Address.fromString("0x255ed38500577a0c85cf8108c0097da80a76c5e1")
  })
  sushiSakePair.reserve0 = BigInt.fromString("208519723083897106271")
  sushiSakePair.reserve1 = BigInt.fromString("174912960380911300")
  sushiSakePair.liquidityUSD = BigDecimal.fromString("5696.744779944808496914026050079535")
  sushiSakePair.liquidityNative = BigDecimal.fromString("1.515376047360042156168771795370342")
  sushiSakePair.liquidity = BigInt.fromString("5967017207026917816")
  sushiSakePair.save()

  const sushiPrice = getTokenPrice("0x6b3595068778dd592e39a122f4f5a5cf09c90fe2")
  sushiPrice.derivedNative = BigDecimal.fromString("0.003322015199611230641120784654015971")
  sushiPrice.save()

  const usdcSakePair = deployPair({
    token0: Address.fromString("0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"),
    token0Decimals: 6,
    token0Symbol: "USDC",
    token0Name: "USD Coin",
    token1: Address.fromString("0xe9f84de264e91529af07fa2c746e934397810334"),
    token1Decimals: 18,
    token1Symbol: "SAK3",
    token1Name: "Sake",
    pairAddress: Address.fromString("0xd45afa3649e57a961c001b935ded1c79d81a9d23")
  })
  usdcSakePair.reserve0 = BigInt.fromString("205529466488")
  usdcSakePair.reserve1 = BigInt.fromString("11893923583487681583")
  usdcSakePair.liquidityUSD = BigDecimal.fromString("411228.2037213843937012352510149107")
  usdcSakePair.liquidityNative = BigDecimal.fromString("102.4831973686247477008989405045703")
  usdcSakePair.liquidity = BigInt.fromString("1486566850594110")
  usdcSakePair.save()


  const wethSakePair = deployPair({
    token0: Address.fromString("0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"),
    token0Decimals: 18,
    token0Symbol: "WETH",
    token0Name: "Wrapped Ether",
    token1: Address.fromString("0xe9f84de264e91529af07fa2c746e934397810334"),
    token1Decimals: 18,
    token1Symbol: "SAK3",
    token1Name: "Sake",
    pairAddress: Address.fromString("0xfed8e81bd0fba2664e9bd9abfaffb77828f959b7")
  })
  wethSakePair.reserve0 = BigInt.fromString("1600708053412207142")
  wethSakePair.reserve1 = BigInt.fromString("328985375611547958")
  wethSakePair.liquidityUSD = BigDecimal.fromString("12060.58506417676684580276080944156")
  wethSakePair.liquidityNative = BigDecimal.fromString("3.174595261022564095788426862243385")
  wethSakePair.liquidity = BigInt.fromString("686631563275258344")
  wethSakePair.save()

  // all above mimics the state of block 13153838
  const blockNumber = BigInt.fromString("13153839")

  let temp = getTokenPrice("0xe9f84de264e91529af07fa2c746e934397810334")
  let pricedOffPair = ""
  
  // MEV: Imbalance the pool 🍞🍞🍞🍞🍞🍞🍞, WETH -> SAK3 -> USDC
  // https://etherscan.io/tx/0x9c4b943e4968018807d90d4816ef0a813c53111e2bff06ffab783d6a65b3725a
  const MEV_BOT = "0x00000000003b3cc22aF3aE1EAc0440BcEe416B40"
  // WETH->SAK3
  transfer({
    txHash: Bytes.fromHexString("0x9c4b943e4968018807d90d4816ef0a813c53111e2bff06ffab783d6a65b3725a"),
    blockNumber,
    pair: usdcSakePair.id,
    from: MEV_BOT,
    to: usdcSakePair.id,
    transferAmount: BigInt.fromString("5487288092"),
  })
  syncSwap({
    txHash: Bytes.fromHexString("0x9c4b943e4968018807d90d4816ef0a813c53111e2bff06ffab783d6a65b3725a"),
    blockNumber,
    pair: usdcSakePair.id,
    from: MEV_BOT,
    to: wethSakePair.id,
    reserve0: BigInt.fromString("190440982146"),
    reserve1: BigInt.fromString("12841324275621429790"),
    amount0In: BigInt.fromString("5487288092"),
    amount1In: BigInt.fromString("0"),
    amount0Out: BigInt.fromString("0"),
    amount1Out: BigInt.fromString("379839148415534212")
  })
  temp = getTokenPrice("0xe9f84de264e91529af07fa2c746e934397810334")
  pricedOffPair = temp.pricedOffPair ? temp.pricedOffPair! : "none"
  log.debug("MEV WETH->SAK3 priced off: {}", [pricedOffPair])
  // SAK3->USDC
  syncSwap({
    txHash: Bytes.fromHexString("0x9c4b943e4968018807d90d4816ef0a813c53111e2bff06ffab783d6a65b3725a"),
    blockNumber,
    pair: wethSakePair.id,
    from: MEV_BOT,
    to: MEV_BOT,
    reserve0: BigInt.fromString("1388335986953113719"),
    reserve1: BigInt.fromString("381584683477799751"),
    amount0In: BigInt.fromString("0"),
    amount1In: BigInt.fromString("379839148415534212"),
    amount0Out: BigInt.fromString("301204104854545030923"),
    amount1Out: BigInt.fromString("0")
  })
  temp = getTokenPrice("0xe9f84de264e91529af07fa2c746e934397810334")
  pricedOffPair = temp.pricedOffPair ? temp.pricedOffPair! : "none"
  log.debug("MEV SAK3->USDC priced off: {}", [pricedOffPair])

  // User: trade 🧀🥬🍖, SAK3 -> USDC -> WETH
  // https://etherscan.io/tx/0x76813a0c6fc439a280723842fc08d256cd6ca84da484c92af350415c5c720b4e
  const USER = "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F"
  const usdcWethPair = getPair("0x397ff1542f962076d0bfe58ea045ffa2d347aca0")
  // SAK3 -> USDC 
  transfer({
    txHash: Bytes.fromHexString("0x76813a0c6fc439a280723842fc08d256cd6ca84da484c92af350415c5c720b4e"),
    blockNumber,
    pair: usdcWethPair.id,
    from: usdcSakePair.id,
    to: usdcWethPair.id,
    transferAmount: BigInt.fromString("15088484342"),
  })
  syncSwap({
    txHash: Bytes.fromHexString("0x76813a0c6fc439a280723842fc08d256cd6ca84da484c92af350415c5c720b4e"),
    blockNumber,
    pair: usdcSakePair.id,
    from: USER,
    to: usdcWethPair.id,
    reserve0: BigInt.fromString("184953694054"),
    reserve1: BigInt.fromString("13221163424036964002"),
    amount0In: BigInt.fromString("0"),
    amount1In: BigInt.fromString("1000000000000000000"),
    amount0Out: BigInt.fromString("15088484342"),
    amount1Out: BigInt.fromString("0")
  })
  temp = getTokenPrice("0xe9f84de264e91529af07fa2c746e934397810334")
  pricedOffPair = temp.pricedOffPair ? temp.pricedOffPair! : "none"
  log.debug("USER SAK3 -> USDC  priced off: {}", [pricedOffPair])
  

  // USDC -> WETH
  syncSwap({
    txHash: Bytes.fromHexString("0x76813a0c6fc439a280723842fc08d256cd6ca84da484c92af350415c5c720b4e"),
    blockNumber,
    pair: usdcWethPair.id,
    from: USER,
    to: USER,
    reserve0: BigInt.fromString("234447256797413"),
    reserve1: BigInt.fromString("58991812335546585603938"),
    amount0In: BigInt.fromString("15088484342"),
    amount1In: BigInt.fromString("0"),
    amount0Out: BigInt.fromString("0"),
    amount1Out: BigInt.fromString("3785430779430386089")
  })
  temp = getTokenPrice("0xe9f84de264e91529af07fa2c746e934397810334")
  pricedOffPair = temp.pricedOffPair ? temp.pricedOffPair! : "none"
  log.debug("USER USDC -> WETH priced off: {}", [pricedOffPair])
  // MEV: Balance the pool back again 🍞🍞🍞🍞🍞🍞🍞, WETH -> SAK3 -> USDC
  // https://etherscan.io/tx/0x804671d6b042702e484167f0ecc0fd82d751c7247da123971b2d8427112ec036


  // WETH -> SAK3
  syncSwap({
    txHash: Bytes.fromHexString("0x804671d6b042702e484167f0ecc0fd82d751c7247da123971b2d8427112ec036"),
    blockNumber,
    pair: wethSakePair.id,
    from: MEV_BOT,
    to: usdcSakePair.id,
    reserve0: BigInt.fromString("302592440841498144642"),
    reserve1: BigInt.fromString("1745535062265539"),
    amount0In: BigInt.fromString("300991732788085937500"),
    amount1In: BigInt.fromString("0"),
    amount0Out: BigInt.fromString("0"),
    amount1Out: BigInt.fromString("327239840549282419")
  })
  temp = getTokenPrice("0xe9f84de264e91529af07fa2c746e934397810334")
  pricedOffPair = temp.pricedOffPair ? temp.pricedOffPair! : "none"
  log.debug("MEV WETH -> SAK3 priced off: {}", [pricedOffPair])
  // SAK3 -> USDC
    transfer({
    txHash: Bytes.fromHexString("0x804671d6b042702e484167f0ecc0fd82d751c7247da123971b2d8427112ec036"),
    blockNumber,
    pair: usdcSakePair.id,
    from: usdcSakePair.id,
    to: MEV_BOT,
    transferAmount: BigInt.fromString("5487288092"),
  })
  syncSwap({
    txHash: Bytes.fromHexString("0x804671d6b042702e484167f0ecc0fd82d751c7247da123971b2d8427112ec036"),
    blockNumber,
    pair: usdcSakePair.id,
    from: MEV_BOT,
    to: MEV_BOT,
    reserve0: BigInt.fromString("200042178396"),
    reserve1: BigInt.fromString("12221163424036964002"),
    amount0In: BigInt.fromString("0"),
    amount1In: BigInt.fromString("327239840549282419"),
    amount0Out: BigInt.fromString("5487288092"),
    amount1Out: BigInt.fromString("0")
  })
  
  temp = getTokenPrice("0xe9f84de264e91529af07fa2c746e934397810334")
  pricedOffPair = temp.pricedOffPair ? temp.pricedOffPair! : "none"
  log.debug("MEV SAK3 -> USDC priced off: {}", [pricedOffPair])
   logStore()
   cleanup()
})


function transfer(args: TransferArgs): void {
  const transferEvent = createTransferEvent(args.txHash, Address.fromString(args.pair), args.blockNumber, Address.fromString(args.from), Address.fromString(args.to), args.transferAmount)
  onTransfer(transferEvent)
}


function syncSwap(args: TransferSyncSwapArgs): void {
   const syncEvent = createSyncEvent(args.txHash, args.blockNumber, Address.fromString(args.pair), args.reserve0, args.reserve1)
  const swapEvent = createSwapEvent(args.txHash, args.blockNumber, Address.fromString(args.pair), Address.fromString(args.from),
    args.amount0In, args.amount1In, args.amount0Out, args.amount1Out, Address.fromString(args.to))
  onSync(syncEvent)
  onSwap(swapEvent)
}






function setupStablePairs(): void {
  const usdcWethPair = deployPair({
    token0: Address.fromString("0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"),
    token0Decimals: 6,
    token0Symbol: "USDC",
    token0Name: "USD Coin",
    token1: Address.fromString("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"),
    token1Decimals: 18,
    token1Symbol: "WETH",
    token1Name: "Wrapped Ether",
    pairAddress: Address.fromString("0x397ff1542f962076d0bfe58ea045ffa2d347aca0")
  })
  usdcWethPair.reserve0 = BigInt.fromString("234432168313071")
  usdcWethPair.reserve1 = BigInt.fromString("58995597766326015990027")
  usdcWethPair.token0Price = BigDecimal.fromString("3973.723077468029103871867415960047")
  usdcWethPair.token1Price = BigDecimal.fromString("0.000251653167698132225290878366555734")
  usdcWethPair.liquidityUSD = BigDecimal.fromString("468639855.3797914292956476172991307")
  usdcWethPair.liquidityNative = BigDecimal.fromString("117991.195532652031980054")
  usdcWethPair.liquidity = BigInt.fromString("2588826593520897216")
  usdcWethPair.save()

  const wethUsdtPair = deployPair({
    token0: Address.fromString("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"),
    token0Decimals: 18,
    token0Symbol: "WETH",
    token0Name: "Wrapped Ether",
    token1: Address.fromString("0xdac17f958d2ee523a2206206994597c13d831ec7"),
    token1Decimals: 6,
    token1Symbol: "USDT",
    token1Name: "USD Tether",
    pairAddress: Address.fromString("0x06da0fd433c1a5d7a4faa01111c044910a184553")
  })
  wethUsdtPair.reserve0 = BigInt.fromString("36678709119684762142410")
  wethUsdtPair.reserve1 = BigInt.fromString("145447270222252")
  wethUsdtPair.token0Price = BigDecimal.fromString("0.0002521787384777832760851799509438478")
  wethUsdtPair.token1Price = BigDecimal.fromString("3965.441361298978485945545269979364")
  wethUsdtPair.liquidityUSD = BigDecimal.fromString("291410835.5519973498013612012240021")
  wethUsdtPair.liquidityNative = BigDecimal.fromString("73357.41823936952428482")
  wethUsdtPair.liquidity = BigInt.fromString("1635859942807164980")
  wethUsdtPair.save()


}

function deployPair(args: DeployPairArgs): Pair {
  if (Token.load(args.token0.toHex()) == null) {
  getOrCreateTokenMock(args.token0.toHex(), args.token0Decimals, args.token0Name, args.token0Symbol)
  }
  if (Token.load(args.token1.toHex()) == null) {
  getOrCreateTokenMock(args.token1.toHex(), args.token1Decimals, args.token1Name, args.token1Symbol)
  }
  const pairCreatedEvent = createPairEvent(args.token0, args.token1, args.pairAddress)
  onPairCreated(pairCreatedEvent)
  return Pair.load(args.pairAddress.toHexString()) as Pair
}

class DeployPairArgs {
  token0: Address
  token0Decimals: i32
  token0Symbol: string
  token0Name: string
  token1: Address
  token1Decimals: i32
  token1Symbol: string
  token1Name: string
  pairAddress: Address
}


class TransferArgs {
  txHash: Bytes
  blockNumber: BigInt
  pair: string
  from: string
  to: string
  transferAmount: BigInt
}

class TransferSyncSwapArgs {
  blockNumber: BigInt
  pair: string
  txHash: Bytes

  from: string
  to: string

  reserve0: BigInt
  reserve1: BigInt

  amount0In: BigInt
  amount1In: BigInt
  amount0Out: BigInt
  amount1Out: BigInt
}