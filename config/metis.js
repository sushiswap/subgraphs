const NATIVE_ADDRESS = '0x75cb093e4d61d2a2e65d8e0bbb01de8d89b53481'
const USDC_ADDRESS = '0xea32a96608495e54156ae48931a7c20f0dcc1a21'
const USDT_ADDRESS = '0xbb06dca3ae6887fabf931640f67cab3e3a16f4dc'
const DAI_ADDRESS = '0x4c078361fc9bbb78df910800a991c7c3dd2f6ce0'
const WETH_ADDRESS = '0x420000000000000000000000000000000000000A'
const SUSHI_ADDRESS = '0x17ee7e4da37b01fc1bcc908fa63df343f23b4b7c'

module.exports = {
  network: 'andromeda',
  sushi: { address: SUSHI_ADDRESS },
  minichef: {
    address: '0x1334c8e873e1cae8467156e2a81d1c8b566b2da1',
    startBlock: 3118733,
    rewarder: {
      complex: {
        address: '0xe2d7460457f55e4786c69d2d3fa81978bf8dd11c',
        rewardToken: { address: NATIVE_ADDRESS }
      }
    },
  },
  auctionMaker: { address: '0x0000000000000000000000000000000000000000', startBlock: 0 },
  bentobox: {
    address: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
    base: 'QmSTz1vJeN5LKJHv9xqTxpsqiLRgpH2YWN5dVhQDv6Pd95',
    startBlock: 3030672,
  },
  blocks: {
    address: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
    startBlock: 3030672,
  },
  trident: {
    bentobox: {
      base: 'QmaoDfL5Ro7bmoE7bcpB4adt6dyZLShqeWEtLi7rQiUFmG',
      startBlock: 3030678,
    },
    masterDeployer: { address: '0x1b02da8cb0d097eb8d57a175b88c7d8b47997506', startBlock: 3030678 },
    concentratedLiquidityPoolFactory: { address: '0x0000000000000000000000000000000000000000' },
    constantProductPoolFactory: {
      address: '0x0769fd68dfb93167989c6f7254cd0d766fb2841f',
      initCodeHash: '0x3172d82413be467c1130709f7479a07def9b99caf8e0059f248c131081e4ea09',
    },
    stablePoolFactory: { address: '0x2f686751b19a9d91cc3d57d90150Bc767f050066' },
    hybridPoolFactory: { address: '0x0000000000000000000000000000000000000000' },
    indexPoolFactory: { address: '0x0000000000000000000000000000000000000000' },
    native: { address: NATIVE_ADDRESS },
    whitelistedTokenAddresses: [
      // WNATIVE - This is actually quite important, though uneeded here anymore since
      // it's now apart of the whitelisted token check in createPair, because the
      // base should always be whitelisted or pricing never begins.
      NATIVE_ADDRESS,
      // WETH
      WETH_ADDRESS,
      // USDC
      USDC_ADDRESS,
      // USDT
      USDT_ADDRESS,
      // DAI
      DAI_ADDRESS,
    ],
    stableTokenAddresses: [
      // USDC
      USDC_ADDRESS,
      // USDT
      USDT_ADDRESS,
      // DAI
      DAI_ADDRESS,
    ],
    tokensToPriceOffNative: [
      // These tokens will be priced off the NATIVE token
      USDC_ADDRESS
    ],
    minimumNativeLiquidity: '2', // Threshold for being considered for pricing
    
  },
  furo: {
    stream: { address: '0x0000000000000000000000000000000000000000', startBlock: 0 },
    vesting: { address: '0x0000000000000000000000000000000000000000', startBlock: 0 },
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
      DAI_ADDRESS,
      USDC_ADDRESS,
      USDT_ADDRESS,
      SUSHI_ADDRESS,
    ],
    stableTokenAddresses: [DAI_ADDRESS, USDC_ADDRESS, USDT_ADDRESS],
    minimumNativeLiquidity: 2,
    factory: {
      address: '0x580ed43f3bba06555785c81c2957efcca71f7483',
      initCodeHash: '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
      startBlock: 8940434,
    },
  },
  v2: {
    nativeAddress: NATIVE_ADDRESS,
    whitelistAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
      WETH_ADDRESS,
      DAI_ADDRESS,
      USDC_ADDRESS,
      USDT_ADDRESS,
      SUSHI_ADDRESS
    ],
    stable0: USDC_ADDRESS,
    stable1: USDT_ADDRESS,
    stable2: DAI_ADDRESS,
    minimumNativeLiquidity: 2,
    factory: {
      address: '0x580ed43f3bba06555785c81c2957efcca71f7483',
      initCodeHash: '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
      startBlock: 8940434,
    }
  },
  v3: {
    factory: {
      address: '0x145d82bca93cca2ae057d1c6f26245d1b9522e6f',
      startBlock: 5220532,
    },
    positionManager: {
      address: '0x630be2985674d31920babb4f96657960f131e7b1',
      startBlock: 8940068,
    },
    native: { address: NATIVE_ADDRESS },
    whitelistedTokenAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
      WETH_ADDRESS,
      DAI_ADDRESS,
      USDC_ADDRESS,
      USDT_ADDRESS,
      SUSHI_ADDRESS
    ],
    stableTokenAddresses: [DAI_ADDRESS, USDC_ADDRESS, USDT_ADDRESS],
    nativePricePool: '0xf956887f404883a838a388b7884ca85b223bd54d', // METIS/USDC
    minimumEthLocked: 2,
  },
}
