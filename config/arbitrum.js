const NATIVE_ADDRESS = '0x82af49447d8a07e3bd95bd0d56f35241523fbab1'
const SUSHI_ADDRESS = '0xd4d42f0b6def4ce0383636770ef773390d85c61a'
const WETH_ADDRESS = '0x82af49447d8a07e3bd95bd0d56f35241523fbab1'
const WBTC_ADDRESS = '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f'
const USDC_ADDRESS = '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8'
const USDT_ADDRESS = '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9'
const DAI_ADDRESS = '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1'
const MIM_ADDRESS = '0xfea7a6a0b346362bf88a9e4a88416b77a57d6c2a'
const FRAX_ADDRESS = '0x17fc002b466eec40dae837fc4be5c67993ddbd6f'

module.exports = {
  network: 'arbitrum-one',
  native: { address: NATIVE_ADDRESS },
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
  },
  whitelistedTokenAddresses: [
    // WNATIVE - This is actually quite important, though uneeded here anymore since
    // it's now apart of the whitelisted token check in createPair, because the
    // base should always be whitelisted or pricing never begins.
    NATIVE_ADDRESS,
    // WETH
    // WETH_ADDRESS,
    // WBTC
    WBTC_ADDRESS,
    // USDC
    USDC_ADDRESS,
    // USDT
    USDT_ADDRESS,
    // DAI
    DAI_ADDRESS,
    // MIM
    MIM_ADDRESS,
    // FRAX
    FRAX_ADDRESS,
  ],
  stableTokenAddresses: [
    // USDC
    USDC_ADDRESS,
    // USDT
    USDT_ADDRESS,
    // DAI
    DAI_ADDRESS,
    // MIM
    MIM_ADDRESS,
    // FRAX
    FRAX_ADDRESS,
  ],
  minimumNativeLiquidity: 3,
  miso: {
    accessControls: { address: '0x1be211d8da40bc0ae8719c6663307bfc987b1d6c', startBlock: 9930886 },
    market: { address: '0x351447fc9bd20a917783e159e61e86edda0b0187', startBlock: 9931078 },
  },
  legacy: {
    factory: {
      address: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
      initCodeHash: '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
      startBlock: 70,
    },
  },
  furo: {
    stream: { address: '0x0000000000000000000000000000000000000000', startBlock: 0 },
    vesting: { address: '0x0000000000000000000000000000000000000000', startBlock: 0 },
  },
  auctionMaker: { address: '0x0000000000000000000000000000000000000000', startBlock: 0 },
  staking: { address: '0x8db6749c9e8f28a4a9bbc02facb9ba9c58e3c9c5', startBlock: 13883265 },
  blocks: {
    address: '0x0000000000000000000000000000000000000000',
    startBlock: 0,
  },
}
