const NATIVE_ADDRESS = '0x82af49447d8a07e3bd95bd0d56f35241523fbab1'
const SUSHI_ADDRESS = '0xd4d42f0b6def4ce0383636770ef773390d85c61a'
const WETH_ADDRESS = '0x82af49447d8a07e3bd95bd0d56f35241523fbab1'
const WBTC_ADDRESS = '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f'
const USDC_ADDRESS = '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8'
const USDC_CIRCLE_ADDRESS = '0xaf88d065e77c8cc2239327c5edb3a432268e5831'
const USDT_ADDRESS = '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9'
const DAI_ADDRESS = '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1'
const MIM_ADDRESS = '0xfea7a6a0b346362bf88a9e4a88416b77a57d6c2a'
const FRAX_ADDRESS = '0x17fc002b466eec40dae837fc4be5c67993ddbd6f'
const ARBY_ADDRESS = '0x09ad12552ec45f82be90b38dfe7b06332a680864'
const DPX_ADDRESS = '0x6c2c06790b3e3e3c38e12ee22f8183b37a13ee55'
const GOHM_ADDRESS = '0x8d9ba570d6cb60c7e3e0f31343efe75ab8e65fb1'
const MAGIC_ADDRESS = '0x539bde0d7dbd336b79148aa742883198bbf60342'
const ARB_ADDRESS = '0x912ce59144191c1204e64559fe8253a0e49e6548'
const SOLV_BTC_BNN_ADDRESS = '0x346c574c56e1a4aaa8dc88cda8f7eb12b39947ab'
const SOLV_BTC_ENA_ADDRESS = '0xafafd68afe3fe65d376eec9eab1802616cfaccb8'
const SOLV_BTC_ADDRESS = '0x3647c54c4c2c65bc7a2d63c0da2809b399dbbdc0'

module.exports = {
  network: 'arbitrum-one',
  retainBlocks: 5796000,
  sushi: { address: SUSHI_ADDRESS },
  weth: { address: WETH_ADDRESS },
  wbtc: { address: WBTC_ADDRESS },
 
  bentobox: {
    address: '0x74c764d41b77dbbb4fe771dab1939b00b146894a',
    // base: '',
    startBlock: 229409,
  },
  v2: {
    base: 'QmV5qTnwjz65z6TH63DYngLr1gj52KQ6Lr6m8aeNj6yxxb',
    startBlock: 318018974,
    nativeAddress: NATIVE_ADDRESS,
    whitelistAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
      SUSHI_ADDRESS,
      WETH_ADDRESS,
      WBTC_ADDRESS,
      USDC_ADDRESS,
      USDC_CIRCLE_ADDRESS,
      USDT_ADDRESS,
      DAI_ADDRESS,
      MIM_ADDRESS,
      FRAX_ADDRESS,
      ARBY_ADDRESS,
      DPX_ADDRESS,
      GOHM_ADDRESS,
      MAGIC_ADDRESS,
      ARB_ADDRESS,
      SOLV_BTC_BNN_ADDRESS,
      SOLV_BTC_ENA_ADDRESS,
      SOLV_BTC_ADDRESS,
    ],
    stable0: USDC_ADDRESS,
    stable1: USDT_ADDRESS,
    stable2: DAI_ADDRESS,
    minimumNativeLiquidity: 3,
    factory: {
      address: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
      initCodeHash: '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
      startBlock: 70,
    }
  },
  v3: {
    base: 'QmS9GKBA49mDpWchU2Us1PJ7kmu4S7tWa4gAmRvE3HK42w',
    startBlock: 318018974,
    factory: { // 0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6
      address: '0x1af415a1eba07a4986a52b6f2e7de7003d82231e',
      startBlock: 75998697,
    },
    positionManager: {
      address: '0xf0cbce1942a68beb3d1b73f0dd86c8dcc363ef49',
      startBlock: 76057451,
    },
    native: { address: NATIVE_ADDRESS },
    whitelistedTokenAddresses: [
      NATIVE_ADDRESS,
      SUSHI_ADDRESS,
      WETH_ADDRESS,
      WBTC_ADDRESS,
      USDC_ADDRESS,
      USDC_CIRCLE_ADDRESS,
      USDT_ADDRESS,
      DAI_ADDRESS,
      MIM_ADDRESS,
      FRAX_ADDRESS,
      ARBY_ADDRESS,
      DPX_ADDRESS,
      GOHM_ADDRESS,
      MAGIC_ADDRESS,
      ARB_ADDRESS,
      SOLV_BTC_BNN_ADDRESS,
      SOLV_BTC_ENA_ADDRESS,
      SOLV_BTC_ADDRESS,
    ],
    stableTokenAddresses: [USDC_ADDRESS, USDC_CIRCLE_ADDRESS, USDT_ADDRESS, DAI_ADDRESS, MIM_ADDRESS, FRAX_ADDRESS],
    nativePricePool: '0x15e444da5b343c5a0931f5d3e85d158d1efc3d40',
    minimumEthLocked: 1
  },
  blacklistedTokenAddresses: [
    '0xeba61eb686b515fae79a96118f140924a634ab23', // ArbFloki
  ],
  furo: {
    stream: { address: '0x4ab2fc6e258a0ca7175d05ff10c5cf798a672cae', startBlock: 13964139 },
    vesting: { address: '0x0689640d190b10765f09310fcfe9c670ede4e25b', startBlock: 13964169 },
  },
  blocks: {
    address: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
    startBlock: 0,
  },
  routeprocessor: {
    address: '0x544ba588efd839d2692fc31ea991cd39993c135f',
    startBlock: 184266045,
  }
}
