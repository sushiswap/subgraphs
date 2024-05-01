const NATIVE_ADDRESS = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
const WBTC_ADDRESS = '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599'
const DAI_ADDRESS = '0x6b175474e89094c44da98b954eedeac495271d0f'
const USDC_ADDRESS = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
const OHM_ADDRESS = '0x383518188c0c6d7730d91b2c03a03c837814a899'
const USDT_ADDRESS = '0xdac17f958d2ee523a2206206994597c13d831ec7'
const TUSD_ADDRESS = '0x0000000000085d4780b73119b644ae5ecd22b376'
const CDAI_ADDRESS = '0x5d3a536e4d6dbd6114cc1ead35777bab948e3643'
const SUSD_ADDRESS = '0x57ab1ec28d129707052df4df418d58a2d46d5f51'
const LINK_ADDRESS = '0x514910771af9ca656af840dff83e8264ecf986ca'
const YFI_ADDRESS = '0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e'
const XSUSHI_ADDRESS = '0x8798249c2e607446efb7ad49ec89dd1865ff4272'
const USDP_ADDRESS = '0x1456688345527be1f37e9e627da0837d6f08c925'
const BAC_ADDRESS = '0x3449fc1cd036255ba1eb19d65ff4ba2b8903a69a'
const CREAM_ADDRESS = '0x2ba592f78db6436527729929aaf6c908497cb200'
const FXS_ADDRESS = '0x3432b6a60d23ca0dfca7761b7ab56459d9c964d0'
const ALPHA_ADDRESS = '0xa1faa113cbe53436df28ff0aee54275c13b40975'
const PWING_ADDRESS = '0xdb0f18081b505a7de20b18ac41856bcb4ba86a1a'
const UMA_ADDRESS = '0x04fa0d235c4abf4bcf4787af4cf447de572ef828'
const RUNE_ADDRESS = '0x3155ba85d5f96b2d030a4966af206230e46849cb'
const NFTX_ADDRESS = '0x87d73e916d7057945c9bcd8cdd94e42a6f47f776'
const STETH_ADDRESS = '0xdfe66b14d37c77f4e9b180ceb433d1b164f0281d'
const DOUGH_ADDRESS = '0xad32a8e6220741182940c5abf610bde99e737b2d'
const LFBTC_ADDRESS = '0xafce9b78d409bf74980cacf610afb851bf02f257'
const SUSHI_ADDRESS = '0x6b3595068778dd592e39a122f4f5a5cf09c90fe2'
const APE_ADDRESS = '0x4d224452801aced8b2f0aebe155379bb5d594381'
const ANGLE_ADDRESS = '0x31429d1856ad1377a8a0079410b297e1a9e214c2'
const CRV_ADDRESS = '0xd533a949740bb3306d119cc777fa900ba034cd52'
const INV_ADDRESS = '0x41d5d79431a913c4ae7d69a668ecdfe5ff9dfb68'
const PRIMATE_ADDRESS = '0x46e98ffe40e408ba6412beb670507e083c8b95ff'
const MIM_ADDRESS = '0x99d8a9c45b2eca8864373a26d1459e3dff1e17f3'
const FRAX_ADDRESS = '0x853d955acef822db058eb8505911ed77f175b99e'
const UST_ADDRESS = '0xa47c8bf37f92abed4a126bda807a7b7498661acd'
const ASTRAFER_ADDRESS = '0x97bbbc5d96875fb78d2f14b7ff8d7a3a74106f17'

module.exports = {
  network: 'mainnet',
  sushi: { address: '0x6b3595068778dd592e39a122f4f5a5cf09c90fe2' },
  weth: { address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2' },
  wbtc: { address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599' },
  bentobox: {
    address: '0xf5bce5077908a1b7370b9ae04adc565ebd643966',
    startBlock: 12094175
  },
  kashi: {
    medium: '0x2cba6ab6574646badc84f0544d05059e57a5dc42'
  },
  blocks: {
    graft: {
      base: 'QmfMF6FFweTxhiwH7LJVbV75cXcSB1CHkVZ9gpPE7aRs8o',
      startBlock: 19717605,
    },
    address: '0x6e38A457C722C6011B2dfa06d49240e797844d66',    
    startBlock: 49880
  },
  miso: {
    accessControls: { address: '0xc35dadb65012ec5796536bd9864ed8773abc74c4', startBlock: 14598164 },
    market: { address: '0x281bd3a3f96ae7c96049493a7ba9449df2c5b0fe', startBlock: 14598240 }
  },
  miso_0_1: {
    market: { address: '0x9d6c60d26B8f776B85d5731AD56b88973C3D370b', startBlock: 12453632 }
  },
  miso_0_2: {
    market: { address: '0x9a40B4497b62607ED9014e8E14284b21095a572C', startBlock: 13405590 }
  },
  legacy: {
    native: { address: NATIVE_ADDRESS },
    whitelistedTokenAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
      WBTC_ADDRESS,
      DAI_ADDRESS,
      USDC_ADDRESS,
      OHM_ADDRESS,
      USDT_ADDRESS,
      TUSD_ADDRESS,
      CDAI_ADDRESS,
      SUSD_ADDRESS,
      LINK_ADDRESS,
      YFI_ADDRESS,
      XSUSHI_ADDRESS,
      USDP_ADDRESS,
      BAC_ADDRESS,
      CREAM_ADDRESS,
      FXS_ADDRESS,
      ALPHA_ADDRESS,
      PWING_ADDRESS,
      UMA_ADDRESS,
      RUNE_ADDRESS,
      NFTX_ADDRESS,
      STETH_ADDRESS,
      DOUGH_ADDRESS,
      LFBTC_ADDRESS,
      SUSHI_ADDRESS,
      APE_ADDRESS,
      ANGLE_ADDRESS,
      CRV_ADDRESS,
      INV_ADDRESS,
      PRIMATE_ADDRESS,
      MIM_ADDRESS,
      FRAX_ADDRESS,
      ASTRAFER_ADDRESS,
      UST_ADDRESS
    ],
    stableTokenAddresses: [
      USDC_ADDRESS,
      USDT_ADDRESS,
      DAI_ADDRESS,
      MIM_ADDRESS,
      FRAX_ADDRESS,
      USDP_ADDRESS,
      SUSD_ADDRESS,
      TUSD_ADDRESS
    ],
    minimumNativeLiquidity: 3,
    factory: {
      address: '0xc0aee478e3658e2610c5f7a4a2e1777ce9e4f2ac',
      initCodeHash: '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
      startBlock: 10794229
    }
  },
  trident: {
    masterDeployer: { address: '0x10c19390e1ac2fd6d0c3643a2320b0aba38e5baa', startBlock: 16576663 },
    concentratedLiquidityPoolFactory: { address: '0x0000000000000000000000000000000000000000' },
    constantProductPoolFactory: {
      address: '0xd75f5369724b513b497101fb15211160c1d96550',
      initCodeHash: '0x3172d82413be467c1130709f7479a07def9b99caf8e0059f248c131081e4ea09'
    },
    stablePoolFactory: { address: '0xc040f84cf7046409f92d578ef9040fe45e6ef4be' },
    hybridPoolFactory: { address: '0x0000000000000000000000000000000000000000' },
    indexPoolFactory: { address: '0x0000000000000000000000000000000000000000' },
    native: { address: NATIVE_ADDRESS },
    whitelistedTokenAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
      WBTC_ADDRESS,
      DAI_ADDRESS,
      USDC_ADDRESS,
      OHM_ADDRESS,
      USDT_ADDRESS,
      TUSD_ADDRESS,
      CDAI_ADDRESS,
      SUSD_ADDRESS,
      LINK_ADDRESS,
      YFI_ADDRESS,
      XSUSHI_ADDRESS,
      USDP_ADDRESS,
      BAC_ADDRESS,
      CREAM_ADDRESS,
      FXS_ADDRESS,
      ALPHA_ADDRESS,
      PWING_ADDRESS,
      UMA_ADDRESS,
      RUNE_ADDRESS,
      NFTX_ADDRESS,
      STETH_ADDRESS,
      DOUGH_ADDRESS,
      LFBTC_ADDRESS,
      SUSHI_ADDRESS,
      APE_ADDRESS,
      ANGLE_ADDRESS,
      CRV_ADDRESS,
      INV_ADDRESS,
      PRIMATE_ADDRESS,
      MIM_ADDRESS,
      FRAX_ADDRESS,
      ASTRAFER_ADDRESS,
      UST_ADDRESS
    ],
    stableTokenAddresses: [
      USDC_ADDRESS,
      USDT_ADDRESS,
      DAI_ADDRESS,
      MIM_ADDRESS,
      FRAX_ADDRESS,
      USDP_ADDRESS,
      SUSD_ADDRESS,
      TUSD_ADDRESS
    ],
    tokensToPriceOffNative: [
      // These tokens will be priced off the NATIVE token.
      USDT_ADDRESS,
      USDC_ADDRESS
    ],
    minimumNativeLiquidity: '2'
  },
  
  v2: {
    nativeAddress: NATIVE_ADDRESS,
    whitelistAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
      WBTC_ADDRESS,
      DAI_ADDRESS,
      USDC_ADDRESS,
      OHM_ADDRESS,
      USDT_ADDRESS,
      TUSD_ADDRESS,
      CDAI_ADDRESS,
      SUSD_ADDRESS,
      LINK_ADDRESS,
      YFI_ADDRESS,
      XSUSHI_ADDRESS,
      USDP_ADDRESS,
      BAC_ADDRESS,
      CREAM_ADDRESS,
      FXS_ADDRESS,
      ALPHA_ADDRESS,
      PWING_ADDRESS,
      UMA_ADDRESS,
      RUNE_ADDRESS,
      NFTX_ADDRESS,
      STETH_ADDRESS,
      DOUGH_ADDRESS,
      LFBTC_ADDRESS,
      SUSHI_ADDRESS,
      APE_ADDRESS,
      ANGLE_ADDRESS,
      CRV_ADDRESS,
      INV_ADDRESS,
      PRIMATE_ADDRESS,
      MIM_ADDRESS,
      FRAX_ADDRESS,
      ASTRAFER_ADDRESS,
      UST_ADDRESS,
      '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2', // MKR
      '0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f', // SNX
      '0x111111111117dc0aa78b770fa6a738034120c302', // 1INCH
      '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0', // MATIC
      '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9', // AAVE
      '0x6982508145454ce325ddbe47a25d4ec3d2311933' // PEPE
    ],
    stable0: USDC_ADDRESS,
    stable1: USDT_ADDRESS,
    stable2: DAI_ADDRESS,
    minimumNativeLiquidity: 3,
    factory: {
      address: '0xc0aee478e3658e2610c5f7a4a2e1777ce9e4f2ac',
      initCodeHash: '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
      startBlock: 10794229
    }
  },
  v3: {
    factory: {
      address: '0xbaceb8ec6b9355dfc0269c18bac9d6e2bdc29c4f',
      startBlock: 16955547
    },
    positionManager: {
      address: '0x2214A42d8e2A1d20635c2cb0664422c528B6A432',
      startBlock: 16971375
    },
    native: { address: NATIVE_ADDRESS },
    whitelistedTokenAddresses: [
      NATIVE_ADDRESS,
      WBTC_ADDRESS,
      DAI_ADDRESS,
      USDC_ADDRESS,
      OHM_ADDRESS,
      USDT_ADDRESS,
      TUSD_ADDRESS,
      CDAI_ADDRESS,
      SUSD_ADDRESS,
      LINK_ADDRESS,
      YFI_ADDRESS,
      XSUSHI_ADDRESS,
      USDP_ADDRESS,
      BAC_ADDRESS,
      CREAM_ADDRESS,
      FXS_ADDRESS,
      ALPHA_ADDRESS,
      PWING_ADDRESS,
      UMA_ADDRESS,
      RUNE_ADDRESS,
      NFTX_ADDRESS,
      STETH_ADDRESS,
      DOUGH_ADDRESS,
      LFBTC_ADDRESS,
      SUSHI_ADDRESS,
      APE_ADDRESS,
      ANGLE_ADDRESS,
      CRV_ADDRESS,
      INV_ADDRESS,
      PRIMATE_ADDRESS,
      MIM_ADDRESS,
      FRAX_ADDRESS,
      ASTRAFER_ADDRESS,
      UST_ADDRESS,
      '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2', // MKR
      '0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f', // SNX
      '0x111111111117dc0aa78b770fa6a738034120c302', // 1INCH
      '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0', // MATIC
      '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9' // AAVE
    ],
    stableTokenAddresses: [
      USDC_ADDRESS,
      USDT_ADDRESS,
      DAI_ADDRESS,
      MIM_ADDRESS,
      FRAX_ADDRESS,
      USDP_ADDRESS,
      SUSD_ADDRESS,
      TUSD_ADDRESS
    ],
    nativePricePool: '0x35644fb61afbc458bf92b15add6abc1996be5014',
    minimumEthLocked: 1.5
  },
  blacklistedTokenAddresses: [
    '0x9ea3b5b4ec044b70375236a281986106457b20ef' // DELTA
  ],
  sushi: {
    address: '0x6b3595068778dd592e39a122f4f5a5cf09c90fe2',
    startBlock: 10736094
  },
  xSushi: {
    address: '0x8798249c2e607446efb7ad49ec89dd1865ff4272',
    startBlock: 10801571
  },
  furo: {
    stream: { address: '0x4ab2fc6e258a0ca7175d05ff10c5cf798a672cae', startBlock: 14857212 },
    vesting: { address: '0x0689640d190b10765f09310fcfe9c670ede4e25b', startBlock: 14857245 }
  },
  auctionMaker: { address: '0x0000000000000000000000000000000000000000', startBlock: 0 },
  staking: { address: '0x0000000000000000000000000000000000000000', startBlock: 0 },
  xswap: {
    address: '0x011e52e4e40cf9498c79273329e8827b21e2e581',
    startBlock: 15187118
  },
  stargate: {
    usdcPool: { address: '0xdf0770df86a8034b3efef0a1bb3c889b8332ff56', startBlock: 14403393 },
    usdtPool: { address: '0x38ea452219524bb87e18de1c24d3bb59510bd783', startBlock: 14403402 }
  },
  router: {
    address: '0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f',
    startBlock: 13600375 // 2021-11-12
  },
  routeprocessor: {
    address: '0xe43ca1dee3f0fc1e2df73a0745674545f11a59f5',
    startBlock: 19303329,
  }
}
