const NATIVE_ADDRESS = '0x23181f21dea5936e24163ffaba4ea3b316b57f3c'
const TRON_ADDRESS = '0xedf53026aea60f8f75fca25f8830b7e2d6200662'
const BNB_ADDRESS = '0x185a4091027e2db459a2433f85f894dc3013aeb5'

const USDT_B_ADDRESS = '0x9b5f27f6ea9bbd753ce3793a07cba3c74644330d'
const USDT_T_ADDRESS = '0xdb28719f7f938507dbfe4f0eae55668903d34a15'
const USDT_E_ADDRESS = '0xe887512ab8bc60bcc9224e1c3b5be68e26048b8b'

const USDC_B_ADDRESS = '0xca424b845497f7204d9301bd13ff87c0e2e86fcf'
const USDC_T_ADDRESS = '0x935faa2fcec6ab81265b301a30467bbc804b43d3'
const USDC_E_ADDRESS = '0xae17940943ba9440540940db0f1877f101d39e8b'

const USDD_T_ADDRESS = '0x17f235fd5974318e4e2a5e37919a209f7c37a6d1'

const WETH_ADDRESS = '0x1249c65afb11d179ffb3ce7d4eedd1d9b98ad006'
const SUSHI_ADDRESS = '0x53c56ece35f8cab135e13d6d00499dfc7c07a92e'

module.exports = {
  network: 'bttc',
  sushi: { address: SUSHI_ADDRESS },
  minichef: {
    address: '0xc09756432dad2ff50b2d40618f7b04546dd20043',
    startBlock: 13314532,
    rewarder: {
      complex: {
        address: '0x75f52766a6a23f736edefcd69dfbe6153a48c3f3',
        rewardToken: { address: NATIVE_ADDRESS }
      }
    },
  },
  auctionMaker: { address: '0x0000000000000000000000000000000000000000', startBlock: 0 },
  bentobox: {
    address: '0x8dacffa7f69ce572992132697252e16254225d38',
    base: '',
    startBlock: 13310741,
  },
  blocks: {
    address: '0x8dacffa7f69ce572992132697252e16254225d38',
    startBlock: 13310741,
  },
  trident: {
    bentobox: {
      address: '0x8dacffa7f69ce572992132697252e16254225d38',
      startBlock: 13310741,
    },
    masterDeployer: { address: '0x281bd3a3f96ae7c96049493a7ba9449df2c5b0fe', startBlock: 13310765 },
    concentratedLiquidityPoolFactory: { address: '0x0000000000000000000000000000000000000000' },
    constantProductPoolFactory: {
      address: '0x752dc00aba9c930c84ac81d288db5e2a02afe633',
      initCodeHash: '0x3172d82413be467c1130709f7479a07def9b99caf8e0059f248c131081e4ea09',
      startBlock: 13310769
    },
    stablePoolFactory: { address: '0x120140d0c1ebc938befc84840575ecdc5fe55afe' },
    hybridPoolFactory: { address: '0x0000000000000000000000000000000000000000' },
    indexPoolFactory: { address: '0x0000000000000000000000000000000000000000' },
    native: { address: NATIVE_ADDRESS },
    whitelistedTokenAddresses: [
      // WNATIVE - This is actually quite important, though uneeded here anymore since
      // it's now apart of the whitelisted token check in createPair, because the
      // base should always be whitelisted or pricing never begins.
      NATIVE_ADDRESS,
      WETH_ADDRESS,
      TRON_ADDRESS,
      BNB_ADDRESS,
      USDT_B_ADDRESS,
      USDT_T_ADDRESS,
      USDT_E_ADDRESS,
      USDC_B_ADDRESS,
      USDC_T_ADDRESS,
      USDC_E_ADDRESS,
      USDD_T_ADDRESS,
    ],
    stableTokenAddresses: [
      USDT_T_ADDRESS,
      USDC_B_ADDRESS,
      USDC_T_ADDRESS,
      USDC_E_ADDRESS,
      USDD_T_ADDRESS,
    ],
    tokensToPriceOffNative: [
      // These tokens will be priced off the NATIVE token
      USDC_E_ADDRESS
    ],
    minimumNativeLiquidity: '1000000000',  // Threshold for being considered for pricing
  },
  furo: {
    stream: { address: '0x3db923fbab372ab8c796fef9bb8341cdb37cb9ec', startBlock: 13312382 },
    vesting: { address: '0x5629ce74ddcad7cc72b3ea30444da7172ad851d9', startBlock: 13312542 },
  },
  staking: { address: '0x0000000000000000000000000000000000000000', startBlock: 0 },
  xswap: {
    address: '0x0000000000000000000000000000000000000000',
    startBlock: 0,
  },
  legacy: {
    native: { address: NATIVE_ADDRESS },
    whitelistedTokenAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
      WETH_ADDRESS,
      TRON_ADDRESS,
      BNB_ADDRESS,
      USDT_B_ADDRESS,
      USDT_T_ADDRESS,
      USDT_E_ADDRESS,
      USDC_B_ADDRESS,
      USDC_T_ADDRESS,
      USDC_E_ADDRESS,
      USDD_T_ADDRESS,
    ],
    stableTokenAddresses: [
      USDT_T_ADDRESS,
      USDC_B_ADDRESS,
      USDC_T_ADDRESS,
      USDC_E_ADDRESS,
      USDD_T_ADDRESS,
    ],
    minimumNativeLiquidity: 1000000000,
    factory: {
      address: '0xb45e53277a7e0f1d35f2a77160e91e25507f1763',
      initCodeHash: '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
      startBlock: 28215551,
    },
  },
  v2: {
    nativeAddress: NATIVE_ADDRESS,
    whitelistAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
      WETH_ADDRESS,
      TRON_ADDRESS,
      BNB_ADDRESS,
      USDT_B_ADDRESS,
      USDT_T_ADDRESS,
      USDT_E_ADDRESS,
      USDC_B_ADDRESS,
      USDC_T_ADDRESS,
      USDC_E_ADDRESS,
      USDD_T_ADDRESS,
    ],
    stable0: USDC_E_ADDRESS,
    stable1: USDD_T_ADDRESS,
    stable2: USDT_E_ADDRESS,
    minimumNativeLiquidity: 1000000000,
    factory: {
      address: '0xb45e53277a7e0f1d35f2a77160e91e25507f1763',
      initCodeHash: '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
      startBlock: 28215551,
    }
  },
  v3: {
    factory: {
      address: '0xbbde1d67297329148fe1ed5e6b00114842728e65',
      startBlock: 19975843,
    },
    positionManager: {
      address: '0x57bffa72db682f7eb6c132dae03ff36bbeb0c459',
      startBlock: 28216924,
    },
    native: { address: NATIVE_ADDRESS },
    whitelistedTokenAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
      WETH_ADDRESS,
      TRON_ADDRESS,
      BNB_ADDRESS,
      USDT_B_ADDRESS,
      USDT_T_ADDRESS,
      USDT_E_ADDRESS,
      USDC_B_ADDRESS,
      USDC_T_ADDRESS,
      USDC_E_ADDRESS,
      USDD_T_ADDRESS,
    ],
    stableTokenAddresses: [
      USDT_T_ADDRESS,
      USDC_B_ADDRESS,
      USDC_T_ADDRESS,
      USDC_E_ADDRESS,
      USDD_T_ADDRESS,
    ],
    nativePricePool: '0x0a75979346b82c5af448c620bf9762384a7c765e',
    minimumEthLocked: 1000000000,
  },
  routeprocessor: {
    address: "0x2F255d3f3C0A3726c6c99E74566c4b18E36E3ce6",
    startBlock: 17630887,
  }
}
