const NATIVE_ADDRESS = '0x722e8bdd2ce80a4422e880164f2079488e115365' // WETH
const DAI_ADDRESS = '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1'
const USDC_ADDRESS = '0x750ba8b76187092b0d1e87e28daaf484d1b5273b'
const USDT_ADDRESS = '0xed9d63a96c27f87b07115b56b2e3572827f21646'
const WBTC_ADDRESS = '0x1d05e4e72cd994cdf976181cfb0707345763564d'
const MOON_ADDRESS = '0x0057ac2d777797d31cd3f8f13bf5e927571d6ad0'
const BRICK_ADDRESS = '0x6dcb98f460457fe4952e12779ba852f82ecc62c1'
const SUSHI_ADDRESS = '0xfe60a48a0bcf4636afecc9642a145d2f241a7011'

module.exports = {
  network: 'arbitrum-nova',
  sushi: { address: SUSHI_ADDRESS },
  minichef: {
    address: '0xc09756432dad2ff50b2d40618f7b04546dd20043',
    startBlock: 1771977,
    rewarder: {
      complex: {
        address: '0x0000000000000000000000000000000000000000',
        rewardToken: { address: "0x0000000000000000000000000000000000000000" },
      }
    }
  },
  legacy: {
    startBlock: 16548328,
    native: { address: NATIVE_ADDRESS },
    whitelistedTokenAddresses: [
      // IMPORTANT! Native should be included here
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
    minimumNativeLiquidity: 0.7,
    factory: {
      address: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
      initCodeHash: '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
      startBlock: 721,
    },
  },
  blocks: {
    address: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
    startBlock: 721,
  },
}
