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
  retainBlocks: 487200,
  sushi: { address: SUSHI_ADDRESS },
  bentobox: {
    address: '0xf5bce5077908a1b7370b9ae04adc565ebd643966',
    startBlock: 5926250,
  },
  v2: {
    base: 'QmUJcdUCSApCahz2ZtxEBwLqBX5YPfy3NNzHGUXyERAdmi',
    startBlock: 47660399,
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
    base: 'QmXsPN4TD4PUhT1ZWd5d1mdQPePFNMdJwUr6guSh1z9ZzA',
    startBlock: 47660399,
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
  blocks: {
    address: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
    startBlock: 0,
  },
  routeprocessor: {
    address: '0x33d91116e0370970444b0281ab117e161febfcdd',
    startBlock: 36443610,
  }
}
