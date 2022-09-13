const NATIVE_ADDRESS = '0x722e8bdd2ce80a4422e880164f2079488e115365' // WETH
const DAI_ADDRESS = '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1'
const USDC_ADDRESS = '0x750ba8b76187092b0d1e87e28daaf484d1b5273b'
const USDT_ADDRESS = '0xed9d63a96c27f87b07115b56b2e3572827f21646'
const WBTC_ADDRESS = '0x1d05e4e72cd994cdf976181cfb0707345763564d'
const MOON_ADDRESS = '0x0057ac2d777797d31cd3f8f13bf5e927571d6ad0'
const BRICK_ADDRESS = '0x6dcb98f460457fe4952e12779ba852f82ecc62c1'

module.exports = {
  network: 'arbitrum-nova',
  blocks: {
    address: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
    startBlock: 721,
  },
  legacy: {
    startBlock: 16548328,
    native: { address: NATIVE_ADDRESS },
    whitelistedTokenAddresses: [
      // IMPORTANT! The native address must be included for pricing to start
      NATIVE_ADDRESS,
      WBTC_ADDRESS,
      USDC_ADDRESS,
      USDT_ADDRESS,
      WBTC_ADDRESS,
      MOON_ADDRESS,
      BRICK_ADDRESS,
      DAI_ADDRESS,
    ],
    stableTokenAddresses: [USDC_ADDRESS, USDT_ADDRESS, DAI_ADDRESS],
    minimumNativeLiquidity: 3,
    minimum_usd_threshold_new_pairs: '500',
    factory: {
      address: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
      initCodeHash: '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
      startBlock: 721,
    },
  },
}
