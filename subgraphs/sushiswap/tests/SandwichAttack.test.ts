import { Address, BigDecimal, BigInt, Bytes, log } from '@graphprotocol/graph-ts'
import { assert, test } from 'matchstick-as/assembly/index'

import { Factory, Pair, Swap, Token } from '../generated/schema'
import {
  createPairEvent,
  createSwapEvent,
  createSyncEvent,
  createTransferEvent, getOrCreateTokenMock
} from './mocks'

import { clearStore, logStore } from 'matchstick-as/assembly/store'
import { getOrCreateBundle, getOrCreateFactory, getPair, getTokenPrice } from '../src/functions'
import { onPairCreated } from '../src/mappings/factory'
import { onSwap, onSync, onTransfer } from '../src/mappings/pair'


let factory: Factory

function setup(): void {
  clearStore()
  factory = getOrCreateFactory()
  // setupStablePairs()
}

function cleanup(): void {
  clearStore()
}

test('#1 When a Sandwich attack happens, the targeted pool is imbalanced and ignored from pricing.', () => {
  setup()

  let usdcWethPair = deployPair({
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

  const SAKE_ADDRESS = Address.fromString("0xe9f84de264e91529af07fa2c746e934397810334")
  // Given: the state before the sandwich attack
  const sushiSakePair = deployPair({
    token0: Address.fromString("0x6b3595068778dd592e39a122f4f5a5cf09c90fe2"),
    token0Decimals: 18,
    token0Symbol: "Sushi",
    token0Name: "SushiToken",
    token1: SAKE_ADDRESS,
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
  sushiSakePair.token0Price = BigDecimal.fromString("1192.134205663203665510901705656786")
  sushiSakePair.token1Price = BigDecimal.fromString("0.0008388317315697553706850324562159755")
  sushiSakePair.save()

  const sushiPrice = getTokenPrice("0x6b3595068778dd592e39a122f4f5a5cf09c90fe2")
  sushiPrice.derivedNative = BigDecimal.fromString("0.003322015199611230641120784654015971")
  sushiPrice.save()


  const sakePrice = getTokenPrice(SAKE_ADDRESS.toHex())
  sakePrice.derivedNative = BigDecimal.fromString("4.308216571649326694087664014313883")
  sakePrice.save()


  const usdcPrice = getTokenPrice(Address.fromString("0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48").toHex())
  usdcPrice.derivedNative = BigDecimal.fromString("0.000251653167698132225290878366555734")
  usdcPrice.save()

  const wethPrice = getTokenPrice(Address.fromString("0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2").toHex())
  wethPrice.derivedNative = BigDecimal.fromString("1")
  wethPrice.save()

  const usdcSakePair = deployPair({
    token0: Address.fromString("0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"),
    token0Decimals: 6,
    token0Symbol: "USDC",
    token0Name: "USD Coin",
    token1: SAKE_ADDRESS,
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
  usdcSakePair.token0Price = BigDecimal.fromString("17280.20741392153276741045046801718")
  usdcSakePair.token1Price = BigDecimal.fromString("0.00005786967575368137148375353009445506")
  usdcSakePair.save()


  const wethSakePair = deployPair({
    token0: Address.fromString("0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"),
    token0Decimals: 18,
    token0Symbol: "WETH",
    token0Name: "Wrapped Ether",
    token1: SAKE_ADDRESS,
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
  wethSakePair.token0Price = BigDecimal.fromString("4.865590303023851220502317347103956")
  wethSakePair.token1Price = BigDecimal.fromString("0.2055249081244105685849411660884587")
  wethSakePair.save()

  // all above mimics the state of block 13153838
  const blockNumber = BigInt.fromString("13153839")

  const MEV_BOT = "0x00000000003b3cc22aF3aE1EAc0440BcEe416B40"
  const USER = "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F"
  usdcWethPair = getPair("0x397ff1542f962076d0bfe58ea045ffa2d347aca0")
  const bundle = getOrCreateBundle()
  bundle.nativePrice = BigDecimal.fromString("3971.883690798685479000638956680192")
  bundle.save()
  // MEV: Balance the pool back again 🍞🍞🍞🍞🍞🍞🍞, WETH -> SAK3 -> USDC
  // https://etherscan.io/tx/0x804671d6b042702e484167f0ecc0fd82d751c7247da123971b2d8427112ec036

  // When: 

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
  logInfo(SAKE_ADDRESS, "MEV", "300 WETH -> 0.32 SAK3", "0x804671d6b042702e484167f0ecc0fd82d751c7247da123971b2d8427112ec036-0")

  // SAK3 -> USDC

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

  logInfo(SAKE_ADDRESS, "MEV", "0.327 SAK3 -> 5487 USDC", "0x804671d6b042702e484167f0ecc0fd82d751c7247da123971b2d8427112ec036-1")


  // User: trade 🧀🥬🍖, SAK3 -> USDC -> WETH
  // https://etherscan.io/tx/0x76813a0c6fc439a280723842fc08d256cd6ca84da484c92af350415c5c720b4e
  // SAK3 -> USDC 

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
  logInfo(SAKE_ADDRESS, "USER", "1 SAK3 -> 15088 USDC", "0x76813a0c6fc439a280723842fc08d256cd6ca84da484c92af350415c5c720b4e-0",)

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
  logInfo(SAKE_ADDRESS, "USER", "15088 USDC -> 3.79 WETH", "0x76813a0c6fc439a280723842fc08d256cd6ca84da484c92af350415c5c720b4e-1")


  // MEV: Imbalance the pool 🍞🍞🍞🍞🍞🍞🍞, USDC -> SAK3 -> WETH
  // https://etherscan.io/tx/0x9c4b943e4968018807d90d4816ef0a813c53111e2bff06ffab783d6a65b3725a
  // USDC->SAK3

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

  logInfo(SAKE_ADDRESS, "MEV", "5487 USDC -> 0.38 SAK3", "0x9c4b943e4968018807d90d4816ef0a813c53111e2bff06ffab783d6a65b3725a-0")
  // SAK3-> WETH
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
  logInfo(SAKE_ADDRESS, "MEV", "0.38 SAK3 -> 301.2 WETH", "0x9c4b943e4968018807d90d4816ef0a813c53111e2bff06ffab783d6a65b3725a-1")

  assert.fieldEquals('TokenPrice', SAKE_ADDRESS.toHex(), 'pricedOffPair', usdcSakePair.id)
  log.info("SAK3 is priced off the expected pair: {}", [usdcSakePair.name])

  cleanup()
})


test('#2 When a Sandwich attack happens, the targeted pool is imbalanced and ignored from pricing.', () => {
  setup()

  let usdcWethPair = deployPair({
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
  usdcWethPair.reserve0 = BigInt.fromString("222799548915438")
  usdcWethPair.reserve1 = BigInt.fromString("74192105507267934873040")
  usdcWethPair.token0Price = BigDecimal.fromString("3003.008842950444738440169515352456")
  usdcWethPair.token1Price = BigDecimal.fromString("0.000332999352415327492929462453521848")
  usdcWethPair.liquidityUSD = BigDecimal.fromString("423751835.7644308851771984931291267")
  usdcWethPair.liquidityNative = BigDecimal.fromString("148384.21101453586974608")
  usdcWethPair.liquidity = BigInt.fromString("2839913416190056074")
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
  wethUsdtPair.reserve0 = BigInt.fromString("43093857402633060266978")
  wethUsdtPair.reserve1 = BigInt.fromString("129308134781836")
  wethUsdtPair.token0Price = BigDecimal.fromString("0.0003332648597502350113512059470691809")
  wethUsdtPair.token1Price = BigDecimal.fromString("3000.61638886694780333197631433288")
  wethUsdtPair.liquidityUSD = BigDecimal.fromString("258529650.2890071774218784973795823")
  wethUsdtPair.liquidityNative = BigDecimal.fromString("86187.714805266120533956")
  wethUsdtPair.liquidity = BigInt.fromString("1678282145191165286")
  wethUsdtPair.save()

  const SAKE_ADDRESS = Address.fromString("0xe9f84de264e91529af07fa2c746e934397810334")
  // Given: the state before the sandwich attack
  const sushiSakePair = deployPair({
    token0: Address.fromString("0x6b3595068778dd592e39a122f4f5a5cf09c90fe2"),
    token0Decimals: 18,
    token0Symbol: "Sushi",
    token0Name: "SushiToken",
    token1: SAKE_ADDRESS,
    token1Decimals: 18,
    token1Symbol: "SAK3",
    token1Name: "Sake",
    pairAddress: Address.fromString("0x255ed38500577a0c85cf8108c0097da80a76c5e1")
  })

  sushiSakePair.reserve0 = BigInt.fromString("230724078756435521397")
  sushiSakePair.reserve1 = BigInt.fromString("157475661347550399")
  sushiSakePair.token0Price = BigDecimal.fromString("1465.141195674835835417599746675233")
  sushiSakePair.token1Price = BigDecimal.fromString("0.0006825280750770273688601240885637129")
  sushiSakePair.liquidityUSD = BigDecimal.fromString("5930.243788711957706538594268287372")
  sushiSakePair.liquidityNative = BigDecimal.fromString("1.968917909211034107097219086044003")
  sushiSakePair.liquidity = BigInt.fromString("5967017207026917816")
  sushiSakePair.save()

  const sushiPrice = getTokenPrice("0x6b3595068778dd592e39a122f4f5a5cf09c90fe2")
  sushiPrice.derivedNative = BigDecimal.fromString("0.004297010888233922696996568494811301")
  sushiPrice.save()


  const sakePrice = getTokenPrice(SAKE_ADDRESS.toHex())
  sakePrice.derivedNative = BigDecimal.fromString("6.138780446823460796680033371847275")
  sakePrice.save()


  const usdcPrice = getTokenPrice("0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48")
  usdcPrice.derivedNative = BigDecimal.fromString("0.000332999352415327492929462453521848")
  usdcPrice.save()

  const wethPrice = getTokenPrice("0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2")
  wethPrice.derivedNative = BigDecimal.fromString("1")
  wethPrice.save()

  const usdcSakePair = deployPair({
    token0: Address.fromString("0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"),
    token0Decimals: 6,
    token0Symbol: "USDC",
    token0Name: "USD Coin",
    token1: SAKE_ADDRESS,
    token1Decimals: 18,
    token1Symbol: "SAK3",
    token1Name: "Sake",
    pairAddress: Address.fromString("0xd45afa3649e57a961c001b935ded1c79d81a9d23")
  })
  usdcSakePair.reserve0 = BigInt.fromString("210654996060")
  usdcSakePair.reserve1 = BigInt.fromString("11445886383221678456")
  usdcSakePair.token0Price = BigDecimal.fromString("18404.4283690248242380785808589335")
  usdcSakePair.token1Price = BigDecimal.fromString("0.00005433474922171603042681711747482587")
  usdcSakePair.liquidityUSD = BigDecimal.fromString("421239.1746673339667314365371048335")
  usdcSakePair.liquidityNative = BigDecimal.fromString("140.5275670517682818176582809455937")
  usdcSakePair.liquidity = BigInt.fromString("1485074701312550")
  usdcSakePair.save()


  const wethSakePair = deployPair({
    token0: Address.fromString("0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"),
    token0Decimals: 18,
    token0Symbol: "WETH",
    token0Name: "Wrapped Ether",
    token1: SAKE_ADDRESS,
    token1Decimals: 18,
    token1Symbol: "SAK3",
    token1Name: "Sake",
    pairAddress: Address.fromString("0xfed8e81bd0fba2664e9bd9abfaffb77828f959b7")
  })
  wethSakePair.reserve0 = BigInt.fromString("1130667472220894228")
  wethSakePair.reserve1 = BigInt.fromString("201036193679964216")
  wethSakePair.token0Price = BigDecimal.fromString("5.624198566059398366149407636910121")
  wethSakePair.token1Price = BigDecimal.fromString("0.1778031106573556182885792421351992")
  wethSakePair.liquidityUSD = BigDecimal.fromString("7050.194387000236143306292237101637")
  wethSakePair.liquidityNative = BigDecimal.fromString("2.353679801028571112115849699413966")
  wethSakePair.liquidity = BigInt.fromString("458127029022455980")
  wethSakePair.save()

  // all above mimics the state of block 13055947
  const blockNumber = BigInt.fromString("13055948")

  const MEV_BOT = "0x00000000003b3cc22aF3aE1EAc0440BcEe416B40"
  const USER = "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F"
  usdcWethPair = getPair("0x397ff1542f962076d0bfe58ea045ffa2d347aca0")
  const bundle = getOrCreateBundle()
  bundle.nativePrice = BigDecimal.fromString("2999.880441592825168543063824406217")
  bundle.save()
  // MEV: Balance the pool back again 🍞🍞🍞🍞🍞🍞🍞, WETH -> SAK3 -> USDC
  // https://etherscan.io/tx/0x01014d57e53d42d80962702373a074f282868689c7f72009f5438ae7954e16c5

  // When: 

  // WETH -> SAK3
  syncSwap({
    txHash: Bytes.fromHexString("0x01014d57e53d42d80962702373a074f282868689c7f72009f5438ae7954e16c5"),
    blockNumber,
    pair: wethSakePair.id,
    from: MEV_BOT,
    to: usdcSakePair.id,
    reserve0: BigInt.fromString("151130667472220894228"),
    reserve1: BigInt.fromString("1508521887686360"),
    amount0In: BigInt.fromString("150000000000000000000"),
    amount1In: BigInt.fromString("0"),
    amount0Out: BigInt.fromString("0"),
    amount1Out: BigInt.fromString("199527671792277856")
  })
  logInfo(SAKE_ADDRESS, "MEV", "150 WETH -> 0.20 SAK3", "0x01014d57e53d42d80962702373a074f282868689c7f72009f5438ae7954e16c5-0")

  // SAK3 -> USDC

  syncSwap({
    txHash: Bytes.fromHexString("0x01014d57e53d42d80962702373a074f282868689c7f72009f5438ae7954e16c5"),
    blockNumber,
    pair: usdcSakePair.id,
    from: MEV_BOT,
    to: MEV_BOT,
    reserve0: BigInt.fromString("207056363990"),
    reserve1: BigInt.fromString("11645414055013956312"),
    amount0In: BigInt.fromString("0"),
    amount1In: BigInt.fromString("199527671792277856"),
    amount0Out: BigInt.fromString("3598632070"),
    amount1Out: BigInt.fromString("0")
  })

  logInfo(SAKE_ADDRESS, "MEV", "0.2 SAK3 -> 3598 USDC", "0x01014d57e53d42d80962702373a074f282868689c7f72009f5438ae7954e16c5-1")


  // User: trade 🧀🥬🍖, SAK3 -> USDC -> WETH
  // https://etherscan.io/tx/0x76813a0c6fc439a280723842fc08d256cd6ca84da484c92af350415c5c720b4e
  // SAK3 -> USDC 

  syncSwap({
    txHash: Bytes.fromHexString("0xf9a70de8197cafe21ad13b575e985dc1694760257db8469938ca99a36452da8f"),
    blockNumber,
    pair: usdcSakePair.id,
    from: USER,
    to: usdcWethPair.id,
    reserve0: BigInt.fromString("198556831057"),
    reserve1: BigInt.fromString("12145414055013956312"),
    amount0In: BigInt.fromString("0"),
    amount1In: BigInt.fromString("500000000000000000"),
    amount0Out: BigInt.fromString("8499532933"),
    amount1Out: BigInt.fromString("0")
  })
  logInfo(SAKE_ADDRESS, "USER", "0.5 SAK3 -> 8499 USDC", "0xf9a70de8197cafe21ad13b575e985dc1694760257db8469938ca99a36452da8f-0",)

  // USDC -> WETH
  syncSwap({
    txHash: Bytes.fromHexString("0xf9a70de8197cafe21ad13b575e985dc1694760257db8469938ca99a36452da8f"),
    blockNumber,
    pair: usdcWethPair.id,
    from: USER,
    to: USER,
    reserve0: BigInt.fromString("222808048448371"),
    reserve1: BigInt.fromString("74189283766645349745571"),
    amount0In: BigInt.fromString("8499532933"),
    amount1In: BigInt.fromString("0"),
    amount0Out: BigInt.fromString("0"),
    amount1Out: BigInt.fromString("2821740622585127469")
  })
  logInfo(SAKE_ADDRESS, "USER", "8499 USDC -> 2.82 WETH", "0xf9a70de8197cafe21ad13b575e985dc1694760257db8469938ca99a36452da8f-1")


  // MEV: Imbalance the pool 🍞🍞🍞🍞🍞🍞🍞, USDC -> SAK3 -> WETH
  // https://etherscan.io/tx/0x9c4b943e4968018807d90d4816ef0a813c53111e2bff06ffab783d6a65b3725a
  // USDC->SAK3

  syncSwap({
    txHash: Bytes.fromHexString("0x74be6ad3484972ed86d9124edacf98d1276a9a0bd8e963af65360873092b7db1"),
    blockNumber,
    pair: usdcSakePair.id,
    from: MEV_BOT,
    to: wethSakePair.id,
    reserve0: BigInt.fromString("202155463127"),
    reserve1: BigInt.fromString("11929846874889012368"),
    amount0In: BigInt.fromString("3598632070"),
    amount1In: BigInt.fromString("0"),
    amount0Out: BigInt.fromString("0"),
    amount1Out: BigInt.fromString("215567180124943944")
  })

  logInfo(SAKE_ADDRESS, "MEV", "5487 USDC -> 0.38 SAK3", "0x74be6ad3484972ed86d9124edacf98d1276a9a0bd8e963af65360873092b7db1-0")
  // SAK3-> WETH
  syncSwap({
    txHash: Bytes.fromHexString("0x74be6ad3484972ed86d9124edacf98d1276a9a0bd8e963af65360873092b7db1"),
    blockNumber,
    pair: wethSakePair.id,
    from: MEV_BOT,
    to: MEV_BOT,
    reserve0: BigInt.fromString("1053388960282704849"),
    reserve1: BigInt.fromString("217075702012630304"),
    amount0In: BigInt.fromString("0"),
    amount1In: BigInt.fromString("215567180124943944"),
    amount0Out: BigInt.fromString("150077278511938189379"),
    amount1Out: BigInt.fromString("0")
  })
  logInfo(SAKE_ADDRESS, "MEV", "0.38 SAK3 -> 301.2 WETH", "0x74be6ad3484972ed86d9124edacf98d1276a9a0bd8e963af65360873092b7db1-1")

  assert.fieldEquals('TokenPrice', SAKE_ADDRESS.toHex(), 'pricedOffPair', usdcSakePair.id)
  log.info("SAK3 is priced off the expected pair: {}", [usdcSakePair.name])

  cleanup()
})




test('#2 When a Sandwich attack happens, the targeted pool is imbalanced and ignored from pricing.', () => {
  setup()

  let usdcWethPair = deployPair({
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
  usdcWethPair.reserve0 = BigInt.fromString("232934913685533")
  usdcWethPair.reserve1 = BigInt.fromString("59474100117483077873479")
  usdcWethPair.token0Price = BigDecimal.fromString("3916.577354266839476194924319054973")
  usdcWethPair.token1Price = BigDecimal.fromString("0.0002553249711538492489679606886892349")
  usdcWethPair.liquidityUSD = BigDecimal.fromString("465740016.2319234143074069343523508")
  usdcWethPair.liquidityNative = BigDecimal.fromString("118948.200234966155746958")
  usdcWethPair.liquidity = BigInt.fromString("2590685129866904334")
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
  wethUsdtPair.reserve0 = BigInt.fromString("37061303383206154616296")
  wethUsdtPair.reserve1 = BigInt.fromString("145155744946997")
  wethUsdtPair.token0Price = BigDecimal.fromString("0.000255320954721695177682495511994412")
  wethUsdtPair.token1Price = BigDecimal.fromString("3916.638965611026762007025133196241")
  wethUsdtPair.liquidityUSD = BigDecimal.fromString("290221449.6000799801487021214008045")
  wethUsdtPair.liquidityNative = BigDecimal.fromString("74122.606766412309232592")
  wethUsdtPair.liquidity = BigInt.fromString("1642535554735717884")
  wethUsdtPair.save()

  const DRC_ADDRESS = Address.fromString("0xa150db9b1fa65b44799d4dd949d922c0a33ee606")
  // Given: the state before the sandwich attack
  const drcWethPair = deployPair({
    token0: DRC_ADDRESS,
    token0Decimals: 0,
    token0Symbol: "DRC",
    token0Name: "Dig Res Currency",
    token1: Address.fromString("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"),
    token1Decimals: 18,
    token1Symbol: "WETH",
    token1Name: "Wrapped Ether",
    pairAddress: Address.fromString("0x9a367a38429d509f00e062b3a6143c1ad0c1250a")
  })

  drcWethPair.reserve0 = BigInt.fromString("6944801")
  drcWethPair.reserve1 = BigInt.fromString("5117363887271666998")
  drcWethPair.token0Price = BigDecimal.fromString("1357105.172308282893830632931048055")
  drcWethPair.token1Price = BigDecimal.fromString("0.0000007368625662955161707297300527401721")
  drcWethPair.liquidityUSD = BigDecimal.fromString("40535.16847774246398466107497427765")
  drcWethPair.liquidityNative = BigDecimal.fromString("10.234727774543333996")
  drcWethPair.liquidity = BigInt.fromString("139507090264")
  drcWethPair.save()

  // const sushiPrice = getTokenPrice("0x6b3595068778dd592e39a122f4f5a5cf09c90fe2")
  // sushiPrice.derivedNative = BigDecimal.fromString("0.004297010888233922696996568494811301")
  // sushiPrice.save()


  const drcPrice = getTokenPrice(DRC_ADDRESS.toHex())
  drcPrice.derivedNative = BigDecimal.fromString("0.0000007368625662955161707297300527401721")
  drcPrice.save()


  const usdcPrice = getTokenPrice(Address.fromString("0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48").toHex())
  usdcPrice.derivedNative = BigDecimal.fromString("0.0002553249711538492489679606886892349")
  usdcPrice.save()

  const wethPrice = getTokenPrice(Address.fromString("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2").toHex())
  wethPrice.derivedNative = BigDecimal.fromString("1")
  wethPrice.save()

  const usdcDrcPair = deployPair({
    token0: Address.fromString("0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"),
    token0Decimals: 6,
    token0Symbol: "USDC",
    token0Name: "USD Coin",
    token1: DRC_ADDRESS,
    token1Decimals: 0,
    token1Symbol: "DRC",
    token1Name: "Dig Res Currency",
    pairAddress: Address.fromString("0x73dd8c30403dae43660aaf4ec645f03256ab8eef")
  })
  usdcDrcPair.reserve0 = BigInt.fromString("131965")
  usdcDrcPair.reserve1 = BigInt.fromString("82")
  usdcDrcPair.token0Price = BigDecimal.fromString("0.001609329268292682926829268292682927")
  usdcDrcPair.token1Price = BigDecimal.fromString("621.3768802333952184291289357026484")
  usdcDrcPair.liquidityUSD = BigDecimal.fromString("0.2745417281083021251293995088908296")
  usdcDrcPair.liquidityNative = BigDecimal.fromString("0.0001285739378368626295652712777186325")
  usdcDrcPair.liquidity = BigInt.fromString("2287")
  usdcDrcPair.save()


  // all above mimics the state of block 13159345
  const blockNumber = BigInt.fromString("13159346")

  const MEV_BOT = "0x00000000003b3cc22aF3aE1EAc0440BcEe416B40"
  const USER = "0x000000000035B5e5ad9019092C665357240f594e"
  usdcWethPair = getPair("0x397ff1542f962076d0bfe58ea045ffa2d347aca0")
  const bundle = getOrCreateBundle()
  bundle.nativePrice = BigDecimal.fromString("3915.475429861143250231105400837069")
  bundle.save()
  // MEV: Balance the pool back again 🍞🍞🍞🍞🍞🍞🍞, WETH -> DRC 
  // https://etherscan.io/tx/0xde31add6f74475a28252abc8ca3bc6d3fa56d6d76135d89260406d154cee2a83

  syncSwap({
    txHash: Bytes.fromHexString("0xde31add6f74475a28252abc8ca3bc6d3fa56d6d76135d89260406d154cee2a83"),
    blockNumber,
    pair: drcWethPair.id,
    from: MEV_BOT,
    to: "0x53455f3B566d6968e9282d982dD1e038E78033ac", // Another dex 
    reserve0: BigInt.fromString("131412"),
    reserve1: BigInt.fromString("271239866129549323396"),
    amount0In: BigInt.fromString("0"),
    amount1In: BigInt.fromString("266122502242277656398"),
    amount0Out: BigInt.fromString("6813389"),
    amount1Out: BigInt.fromString("0")
  })
  logInfo(DRC_ADDRESS, "MEV", "266.12 WETH ->  6813389 DRC", "0xde31add6f74475a28252abc8ca3bc6d3fa56d6d76135d89260406d154cee2a83-0")



  // User: trade 🧀🥬🍖, DRC -> WETH
  // https://etherscan.io/tx/0x0deb96d9a5278eb8a9b1f1bfff5e3d8aea52da4b9b0189639dd05d1663bace3b

  syncSwap({
    txHash: Bytes.fromHexString("0x706c60c2818dfe984f1ec9d36f8feeea0e8991a59d9f2830e0e09e17b62fc0e3"),
    blockNumber,
    pair: drcWethPair.id,
    from: USER,
    to: "0x53455f3B566d6968e9282d982dD1e038E78033ac", // Another dex 
    reserve0: BigInt.fromString("67746807"),
    reserve1: BigInt.fromString("39980310178344908709"),
    amount0In: BigInt.fromString("966061"),
    amount1In: BigInt.fromString("0"),
    amount0Out: BigInt.fromString("0"),
    amount1Out: BigInt.fromString("576626505129314588")
  })
  logInfo(DRC_ADDRESS, "USER", "966061 DRC -> 0.12 WETH", "0x706c60c2818dfe984f1ec9d36f8feeea0e8991a59d9f2830e0e09e17b62fc0e3-0")



  // MEV: Imbalance the pool 🍞🍞🍞🍞🍞🍞🍞, DRC -> WETH
  // https://etherscan.io/tx/0x0deb96d9a5278eb8a9b1f1bfff5e3d8aea52da4b9b0189639dd05d1663bace3b

  syncSwap({
    txHash: Bytes.fromHexString("0x74be6ad3484972ed86d9124edacf98d1276a9a0bd8e963af65360873092b7db1"),
    blockNumber,
    pair: drcWethPair.id,
    from: MEV_BOT,
    to: "0x53455f3B566d6968e9282d982dD1e038E78033ac", // Another dex 
    reserve0: BigInt.fromString("7095118"),
    reserve1: BigInt.fromString("5038596285130615308"),
    amount0In: BigInt.fromString("6963706"),
    amount1In: BigInt.fromString("0"),
    amount0Out: BigInt.fromString("0"),
    amount1Out: BigInt.fromString("266201269844418708088")
  })

  logInfo(DRC_ADDRESS, "MEV", "6963706 DRC -> 266.2 WETH", "0x74be6ad3484972ed86d9124edacf98d1276a9a0bd8e963af65360873092b7db1-0")


  assert.fieldEquals('TokenPrice', DRC_ADDRESS.toHex(), 'pricedOffPair', drcWethPair.id)
  log.info("DRC is priced off the expected pair: {}", [drcWethPair.name])

  cleanup()
})



test('When a false positive is triggered, use the lower price.', () => {
  setup()

  let usdcWethPair = deployPair({
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
  usdcWethPair.reserve0 = BigInt.fromString("155647950612038")
  usdcWethPair.reserve1 = BigInt.fromString("58063745987771889031274")
  usdcWethPair.token0Price = BigDecimal.fromString("2680.639148649092550397838524243443")
  usdcWethPair.token1Price = BigDecimal.fromString("0.0003730453614034361013340540329102197")
  usdcWethPair.liquidityUSD = BigDecimal.fromString("312114190.9652510375572245615946636")
  usdcWethPair.liquidityNative = BigDecimal.fromString("116127.491975543778062548")
  usdcWethPair.liquidity = BigInt.fromString("2212304642560604697")
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
  wethUsdtPair.reserve0 = BigInt.fromString("42160959567302735945226")
  wethUsdtPair.reserve1 = BigInt.fromString("113249059872499")
  wethUsdtPair.token0Price = BigDecimal.fromString("0.000372285294154048459520647082080346")
  wethUsdtPair.token1Price = BigDecimal.fromString("2686.112010608210010750242567012104")
  wethUsdtPair.liquidityUSD = BigDecimal.fromString("226678494.9849786240499101801724845")
  wethUsdtPair.liquidityNative = BigDecimal.fromString("84321.91913460547189045200000000001")
  wethUsdtPair.liquidity = BigInt.fromString("1622656990119285453")
  wethUsdtPair.save()

  const LUCK_ADDRESS = Address.fromString("0x0955a73d014f0693ac7b53cfe77706dab02b3ef9")
  // Given: the state before the sandwich attack
  const luckWethPair = deployPair({
    token0: LUCK_ADDRESS,
    token0Decimals: 18,
    token0Symbol: "LUCK",
    token0Name: "Lady Luck",
    token1: Address.fromString("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"),
    token1Decimals: 18,
    token1Symbol: "WETH",
    token1Name: "Wrapped Ether",
    pairAddress: Address.fromString("0x9a367a38429d509f00e062b3a6143c1ad0c1250a")
  })

  luckWethPair.reserve0 = BigInt.fromString("279238647890285339211867343")
  luckWethPair.reserve1 = BigInt.fromString("17235679684269785254")
  luckWethPair.token0Price = BigDecimal.fromString("16201197.34211199414117758524040205")
  luckWethPair.token1Price = BigDecimal.fromString("0.00000006172383305280075220795140477964181")
  luckWethPair.liquidityUSD = BigDecimal.fromString("93869.74872683029695977280926611257")
  luckWethPair.liquidityNative = BigDecimal.fromString("34.471359368539570508")
  luckWethPair.liquidity = BigInt.fromString("65341308566161519905683")
  luckWethPair.save()

  const luckPrice = getTokenPrice(LUCK_ADDRESS.toHex())
  luckPrice.derivedNative = BigDecimal.fromString("0.00000006172383305280075220795140477964181")
  luckPrice.save()


  const usdcPrice = getTokenPrice(Address.fromString("0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48").toHex())
  usdcPrice.derivedNative = BigDecimal.fromString("0.0003730453614034361013340540329102197")
  usdcPrice.save()

  const wethPrice = getTokenPrice(Address.fromString("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2").toHex())
  wethPrice.derivedNative = BigDecimal.fromString("1")
  wethPrice.save()


  // all above mimics the state of block 12465847
  const blockNumber = BigInt.fromString("12465848")

  // const MEV_BOT = "0x00000000003b3cc22aF3aE1EAc0440BcEe416B40"
  const USER = "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F"
  usdcWethPair = getPair("0x397ff1542f962076d0bfe58ea045ffa2d347aca0")
  const bundle = getOrCreateBundle()
  bundle.nativePrice = BigDecimal.fromString("2687.685625992694940183514157831612")
  bundle.save()

  // // User: trade 🧀🥬🍖, LUCK -> WETH
  // // https://etherscan.io/tx/0x0deb96d9a5278eb8a9b1f1bfff5e3d8aea52da4b9b0189639dd05d1663bace3b

  syncSwap({
    txHash: Bytes.fromHexString("0x706c60c2818dfe984f1ec9d36f8feeea0e8991a59d9f2830e0e09e17b62fc0e3"),
    blockNumber,
    pair: luckWethPair.id,
    from: USER,
    to: "0x53455f3B566d6968e9282d982dD1e038E78033ac", // Another dex 
    reserve0: BigInt.fromString("7102340871822879581410121127478"),
    reserve1: BigInt.fromString("679684269785254"),
    amount0In: BigInt.fromString("7102061633174989296070909260135"),
    amount1In: BigInt.fromString("0"),
    amount0Out: BigInt.fromString("0"),
    amount1Out: BigInt.fromString("17235000000000000000")
  })
  logInfo(LUCK_ADDRESS, "USER", "7,102,061,633,174 LUCK -> 17.235 WETH", "0x706c60c2818dfe984f1ec9d36f8feeea0e8991a59d9f2830e0e09e17b62fc0e3-0")


  assert.fieldEquals('TokenPrice', LUCK_ADDRESS.toHex(), 'pricedOffPair', luckWethPair.id)
  assert.fieldEquals('TokenPrice', LUCK_ADDRESS.toHex(), 'derivedNative', "0.00000000000000009569862698110783957728500542666224")
  log.info("LUCK is priced off the expected pair: {}", [luckWethPair.name])
  cleanup()
})


function syncSwap(args: TransferSyncSwapArgs): void {
  const syncEvent = createSyncEvent(args.txHash, args.blockNumber, Address.fromString(args.pair), args.reserve0, args.reserve1)
  const swapEvent = createSwapEvent(args.txHash, args.blockNumber, Address.fromString(args.pair), Address.fromString(args.from),
    args.amount0In, args.amount1In, args.amount0Out, args.amount1Out, Address.fromString(args.to))
  onSync(syncEvent)
  onSwap(swapEvent)
}


function logInfo(token: Address, user: string, swap: string, txHash: string): void {
  log.info("*** {}: {}", [user, swap])
  let temp = getTokenPrice(token.toHex())
  if (temp.pricedOffPair) {
    const pair = getPair(temp.pricedOffPair!)
    log.info("Priced off pair: {}", [pair.name])
  }
  log.info("lastUsdPrice: {}", [temp.lastUsdPrice.toString()])
  const swapTx = Swap.load(txHash)!
  log.info("swap.amountUSD: {}", [swapTx.amountUSD.toString()])
  log.info("----------------------------------------", [])
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