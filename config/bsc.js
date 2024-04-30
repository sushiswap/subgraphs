const NATIVE_ADDRESS = '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c'
const WETH_ADDRESS = '0x2170ed0880ac9a755fd29b2688956bd959f933f8'
const WBTC_ADDRESS = '0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c'
const USDT_ADDRESS = '0x55d398326f99059ff775485246999027b3197955'
const BUSD_ADDRESS = '0xe9e7cea3dedca5984780bafc599bd69add087d56'
const DAI_ADDRESS = '0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3'
const ICE_ADDRESS = '0xf16e81dce15b08f326220742020379b855b87df9'
const SUSHI_ADDRESS = '0x986cdf0fd180b40c4d6aeaa01ab740b996d8b782'
const USDC_ADDRESS = '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d'
const CAKE_ADDRESS = '0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82'

module.exports = {
  network: 'bsc',
  sushi: { address: SUSHI_ADDRESS },
  minichef: {
    address: '0x5219c5e32b9fff87f29d5a833832c29134464aaa',
    startBlock: 24709457,
    rewarder: {
      complex: {
        address: '0x21cb1bffd7bdbf4b48812a141620815972258a50',
        rewardToken: { address: NATIVE_ADDRESS }
      }
    },
  },
  bentobox: {
    address: '0xf5bce5077908a1b7370b9ae04adc565ebd643966',
    startBlock: 5926250,
  },
  kashi: {
    mediumRiskMasterContractAddresses: '0x2cba6ab6574646badc84f0544d05059e57a5dc42'
  },
  miso: {
    accessControls: { address: '0x0769fd68dfb93167989c6f7254cd0d766fb2841f', startBlock: 16167236 },
    market: { address: '0x7603a35af5cf10b113f167d424eb75bb7062c8ce', startBlock: 16168070 },
  },
  legacy: {
    native: { address: NATIVE_ADDRESS },
    whitelistedTokenAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
      WETH_ADDRESS,
      WBTC_ADDRESS,
      USDT_ADDRESS,
      BUSD_ADDRESS,
      DAI_ADDRESS,
      ICE_ADDRESS,
      USDC_ADDRESS
    ],
    stableTokenAddresses: [USDT_ADDRESS, BUSD_ADDRESS, DAI_ADDRESS, USDC_ADDRESS],
    minimumNativeLiquidity: 5,
    factory: {
      address: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
      initCodeHash: '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
      startBlock: 5205069,
    },
  },
  trident: {
    masterDeployer: { address: '0x9e4791ad13f14783c7b2a6a7bd8d6ddd1dc95847', startBlock: 23136876 },
    concentratedLiquidityPoolFactory: { address: '0x0000000000000000000000000000000000000000' },
    constantProductPoolFactory: {
      address: '0x3d2f8ae0344d38525d2ae96ab750b83480c0844f',
      initCodeHash: '0x3172d82413be467c1130709f7479a07def9b99caf8e0059f248c131081e4ea09',
    },
    stablePoolFactory: { address: '0xa4c0363edd74f55ac8f316a3bf447f8aa09607d3' },
    hybridPoolFactory: { address: '0x0000000000000000000000000000000000000000' },
    indexPoolFactory: { address: '0x0000000000000000000000000000000000000000' },
    native: { address: NATIVE_ADDRESS },
    whitelistedTokenAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
      WETH_ADDRESS,
      WBTC_ADDRESS,
      USDT_ADDRESS,
      BUSD_ADDRESS,
      DAI_ADDRESS,
      ICE_ADDRESS,
      USDC_ADDRESS,
    ],
    stableTokenAddresses: [
      USDC_ADDRESS,
      USDT_ADDRESS,
      DAI_ADDRESS,
      BUSD_ADDRESS
    ],
    tokensToPriceOffNative: [
      // These tokens will be priced off the NATIVE token. At least one token needs to 
      USDC_ADDRESS
    ],
    minimumNativeLiquidity: '5',
  },
  v2: {
    nativeAddress: NATIVE_ADDRESS,
    whitelistAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
      WETH_ADDRESS,
      WBTC_ADDRESS,
      USDT_ADDRESS,
      BUSD_ADDRESS,
      DAI_ADDRESS,
      ICE_ADDRESS,
      USDC_ADDRESS,
      CAKE_ADDRESS
    ],
    stable0: USDC_ADDRESS,
    stable1: USDT_ADDRESS,
    stable2: BUSD_ADDRESS,
    minimumNativeLiquidity: 5,
    factory: {
      address: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
      initCodeHash: '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
      startBlock: 5205069,
    }
  },
  v3: {
    factory: {
      address: '0x126555dd55a39328f69400d6ae4f782bd4c34abb',
      startBlock: 26976538,
    },
    positionManager: {
      address: '0xf87bc5535602077d340806d71f805ea9907a843d',
      startBlock: 26990543,
    },
    native: { address: NATIVE_ADDRESS },
    whitelistedTokenAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
      WETH_ADDRESS,
      WBTC_ADDRESS,
      USDT_ADDRESS,
      BUSD_ADDRESS,
      DAI_ADDRESS,
      ICE_ADDRESS,
      USDC_ADDRESS,
      CAKE_ADDRESS
    ],
    stableTokenAddresses: [
      USDC_ADDRESS,
      USDT_ADDRESS,
      DAI_ADDRESS,
      BUSD_ADDRESS
    ],
    nativePricePool: '0xc0e2792774b2f602f74f6056ed95ab958d253823',
    minimumEthLocked: 3
  },
  furo: {
    stream: { address: '0x4ab2fc6e258a0ca7175d05ff10c5cf798a672cae', startBlock: 18479521 },
    vesting: { address: '0x0689640d190b10765f09310fcfe9c670ede4e25b', startBlock: 18479576 },
  },
  auctionMaker: { address: '0x0000000000000000000000000000000000000000', startBlock: 0 },
  staking: { address: '0x0000000000000000000000000000000000000000', startBlock: 0 },
  blocks: {
    graft: {
      base: 'QmT8JpwE7E7g1MGnsT3xnCWGi1bjZFBxWmLKKfgfs4qbbU',
      startBlock: 38134922,
    },
    address: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
    startBlock: 5205069,
  },
  xswap: {
    address: '0x7a4af156379f512de147ed3b96393047226d923f',
    startBlock: 19749928,
  },
  stargate: {
    busdPool: { address: '0x98a5737749490856b401DB5Dc27F522fC314A4e1', startBlock: 26032726 },
    usdtPool: { address: '0x9aA83081AA06AF7208Dcc7A4cB72C94d057D2cda', startBlock: 26032728 },
  },
  routeprocessor: {
    address: '0xd36990D74b947eC4Ad9f52Fe3D49d14AdDB51E44',
    startBlock: 31678968,
  }
}
