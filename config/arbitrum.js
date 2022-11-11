const NATIVE_ADDRESS = '0x82af49447d8a07e3bd95bd0d56f35241523fbab1'
const SUSHI_ADDRESS = '0xd4d42f0b6def4ce0383636770ef773390d85c61a'
const WETH_ADDRESS = '0x82af49447d8a07e3bd95bd0d56f35241523fbab1'
const WBTC_ADDRESS = '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f'
const USDC_ADDRESS = '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8'
const USDT_ADDRESS = '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9'
const DAI_ADDRESS = '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1'
const MIM_ADDRESS = '0xfea7a6a0b346362bf88a9e4a88416b77a57d6c2a'
const FRAX_ADDRESS = '0x17fc002b466eec40dae837fc4be5c67993ddbd6f'
const ARBY_ADDRESS = '0x09ad12552ec45f82be90b38dfe7b06332a680864'
const DPX_ADDRESS = '0x6c2c06790b3e3e3c38e12ee22f8183b37a13ee55'
const GOHM_ADDRESS = '0x8d9ba570d6cb60c7e3e0f31343efe75ab8e65fb1'
const MAGIC_ADDRESS = '0x539bde0d7dbd336b79148aa742883198bbf60342'

module.exports = {
  network: 'arbitrum-one',
  sushi: { address: SUSHI_ADDRESS },
  weth: { address: WETH_ADDRESS },
  wbtc: { address: WBTC_ADDRESS },
  bentobox: {
    address: '0x74c764d41b77dbbb4fe771dab1939b00b146894a',
    // base: '',
    startBlock: 229409,
  },
  kashi: {
    medium: '0xa010ee0226cd071bebd8919a1f675cae1f1f5d3e',

    mediumRiskMasterContractAddresses: ['0xa010ee0226cd071bebd8919a1f675cae1f1f5d3e'],
  },
  miso: {
    accessControls: { address: '0x1be211d8da40bc0ae8719c6663307bfc987b1d6c', startBlock: 9930886 },
    market: { address: '0x351447fc9bd20a917783e159e61e86edda0b0187', startBlock: 9931078 },
  },
  legacy: {
    base: 'QmfKgxN71Bc7TKzQi8yccRunpiWupFdWA4638yZRxve3q1',
    startBlock: 16548328,
    native: { address: NATIVE_ADDRESS },
    whitelistedTokenAddresses: [
      // IMPORTANT! The native address must be included for pricing to start
      NATIVE_ADDRESS,
      WBTC_ADDRESS,
      ARBY_ADDRESS,
      USDC_ADDRESS,
      USDT_ADDRESS,
      GOHM_ADDRESS,
      DPX_ADDRESS,
      MAGIC_ADDRESS,
      DAI_ADDRESS,
      MIM_ADDRESS,
      FRAX_ADDRESS,
    ],
    stableTokenAddresses: [USDC_ADDRESS, USDT_ADDRESS, DAI_ADDRESS, MIM_ADDRESS, FRAX_ADDRESS],
    minimumNativeLiquidity: 3,
    minimum_usd_threshold_new_pairs: '3000',
    factory: {
      address: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
      initCodeHash: '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
      startBlock: 70,
    },
  },
  furo: {
    stream: { address: '0x4ab2fc6e258a0ca7175d05ff10c5cf798a672cae', startBlock: 13964139 },
    vesting: { address: '0x0689640d190b10765f09310fcfe9c670ede4e25b', startBlock: 13964169 },
  },
  auctionMaker: { address: '0x0000000000000000000000000000000000000000', startBlock: 0 },
  staking: { address: '0x8db6749c9e8f28a4a9bbc02facb9ba9c58e3c9c5', startBlock: 13883265 },
  blocks: {
    address: '0x0000000000000000000000000000000000000000',
    startBlock: 0,
  },
  xswap: {
    address: '0x53b08dbd70327b7ba3b7886fc9987bc985d27262',
    startBlock: 18221456,
  },
  stargate: {
    address: '0x66A71Dcef29A0fFBDBE3c6a460a3B5BC225Cd675',
    startBlock: 7920342,
    usdcPool: { address: '0x892785f33cdee22a30aef750f285e18c18040c3e', startBlock: 8041115 },
    usdtPool: { address: '0xb6cfcf89a7b22988bfc96632ac2a9d6dab60d641', startBlock: 8041122 },
  },
  router: {
    address: '0x1b02da8cb0d097eb8d57a175b88c7d8b47997506',
    startBlock: 29527181,
  }
}
