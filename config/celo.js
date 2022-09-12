const NATIVE_ADDRESS = '0x471ece3750da237f93b8e339c536989b8978a438'
const WETH_ADDRESS = '0x122013fd7df1c6f636a5bb8f03108e876548b455'
const CEUR_ADDRESS = '0xd8763cba276a3738e6de85b4b3bf5fded6d6ca73'
const CUSD_ADDRESS = '0x765de816845861e75a25fca122bb6898b8b1282a'
const USDC_ADDRESS = '0xef4229c8c3250c675f21bcefa42f58efbff6002a'
const USDT_ADDRESS = '0x88eec49252c8cbc039dcdb394c0c2ba2f1637ea0'
const WBTC_ADDRESS = '0xbaab46e28388d2779e6e31fd00cf0e5ad95e327b'
const DAI_ADDRESS = '0xe4fe50cdd716522a56204352f00aa110f731932d'
const DAI2_ADDRESS = '0x90ca507a5d4458a4c6c6249d186b6dcb02a5bccd'

module.exports = {
  network: 'celo',
  bentobox: {
    address: '0x0711b6026068f736bae6b213031fce978d48e026',
    startBlock: 9451612,
  },

  legacy: {
    native: {
      address: NATIVE_ADDRESS,
    },
    whitelistedTokenAddresses: [
      // IMPORTANT! The native address must be included for pricing to start
      NATIVE_ADDRESS,
      WETH_ADDRESS,
      CEUR_ADDRESS,
      CUSD_ADDRESS,
      USDC_ADDRESS,
      USDT_ADDRESS,
      WBTC_ADDRESS,
      DAI_ADDRESS,
      DAI2_ADDRESS,
    ],
    stableTokenAddresses: [USDC_ADDRESS, USDT_ADDRESS, DAI_ADDRESS, DAI2_ADDRESS],
    minimumNativeLiquidity: 1,
    minimum_usd_threshold_new_pairs: '3000',
    factory: {
      address: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
      initCodeHash: '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
      startBlock: 7253488,
    },
  },
  furo: {
    stream: { address: '0x0000000000000000000000000000000000000000', startBlock: 0 },
    vesting: { address: '0x0000000000000000000000000000000000000000', startBlock: 0 },
  },
  auctionMaker: { address: '0x0000000000000000000000000000000000000000', startBlock: 0 },
  staking: { address: '0x0000000000000000000000000000000000000000', startBlock: 0 },
  blocks: {
    address: '0x0000000000000000000000000000000000000000',
    startBlock: 0,
  },
}
