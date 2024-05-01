const NATIVE_ADDRESS = '0xc86c7c0efbd6a49b35e8714c5f59d99de09a225b'
const anyWBTC_ADDRESS = '0x818ec0a7fe18ff94269904fced6ae3dae6d6dc0b'
const anyUSDC_ADDRESS = '0xfa9343c3897324496a05fc75abed6bac29f8a40f'
const anyUSDT_ADDRESS = '0xb44a9b6905af7c801311e8f4e76932ee959c663c'
const anyDAI_ADDRESS = '0x765277eebeca2e31912c9946eae1021199b39c61'
const anyWETH_ADDRESS = '0xe3f5a90f9cb311505cd691a46596599aa1a0ad7d'
const anySUSHI_ADDRESS = '0x7c598c96d02398d89fbcb9d41eab3df0c16F227d'
const USDT_ADDRESS = '0x919c1c267bc06a7039e03fcc2ef738525769109c'
const axlUSDC_ADDRESS = '0xeb466342c4d449bc9f53a865d5cb90586f405215'
const axlUSDT_ADDRESS = '0x7f5373ae26c3e8ffc4c77b7255df7ec1a9af52a6'
const WAGMI_ADDRESS = '0xaf20f5f19698f1d19351028cd7103b63d30de7d7'

module.exports = {
  network: 'kava-evm',
  sushi: { address: anySUSHI_ADDRESS },
  minichef: {
    address: '0xf731202a3cf7efa9368c2d7bd613926f7a144db5',
    startBlock: 265615,
    rewarder: {
      complex: {
        address: '0xeaf76e3bd36680d98d254b378ed706cb0dfbfc1b',
        rewardToken: { address: NATIVE_ADDRESS },
      }
    },
  },
  blocks: {
    address: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
    startBlock: 161967,
  },
  bentobox: {
    address: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
    startBlock: 161967,
  },
  trident: {
    bentobox: {
      base: 'QmXtBjEnPnD5pwxj4yYLQyWpaE38ioprpKJ3rXSZQh4xHS',
      startBlock: 162097,
    },
    masterDeployer: { address: '0x1b02da8cb0d097eb8d57a175b88c7d8b47997506', startBlock: 162097 },
    concentratedLiquidityPoolFactory: { address: '0x0000000000000000000000000000000000000000' },
    constantProductPoolFactory: {
      address: '0x0769fd68dfb93167989c6f7254cd0d766fb2841f',
      initCodeHash: '0x3172d82413be467c1130709f7479a07def9b99caf8e0059f248c131081e4ea09',
    },
    stablePoolFactory: { address: '0x9B3fF703FA9C8B467F5886d7b61E61ba07a9b51c' },
    hybridPoolFactory: { address: '0x0000000000000000000000000000000000000000' },
    indexPoolFactory: { address: '0x0000000000000000000000000000000000000000' },
    native: { address: NATIVE_ADDRESS },
    whitelistedTokenAddresses: [
      // WNATIVE - This is actually quite important, though uneeded here anymore since
      // it's now apart of the whitelisted token check in createPair, because the
      // base should always be whitelisted or pricing never begins.
      NATIVE_ADDRESS,
      // WETH
      anyWETH_ADDRESS,
      // WBTC
      anyWBTC_ADDRESS,
      // USDC
      anyUSDC_ADDRESS,
      // USDT
      anyUSDT_ADDRESS,
      // DAI
      anyDAI_ADDRESS,
    ],
    stableTokenAddresses: [
      // USDC
      anyUSDC_ADDRESS,
      // USDT
      anyUSDT_ADDRESS,
      // DAI
      anyDAI_ADDRESS,
    ],
    // List of STABLE/NATIVE pools to use to price NATIVE in USD
    stablePoolAddresses: [
      // USDC/WKAVA/30/FALSE
      '0x88395b86cf9787e131d2fb5462a22b44056bf574',
    ],
    tokensToPriceOffNative: [
      // These tokens will be priced off the NATIVE token
      anyUSDC_ADDRESS
    ],
    minimumNativeLiquidity: '50', // Threshold for being considered for pricing
  },
  furo: {
    stream: { address: '0x0000000000000000000000000000000000000000', startBlock: 0 },
    vesting: { address: '0x0000000000000000000000000000000000000000', startBlock: 0 },
  },
  auctionMaker: { address: '0x0000000000000000000000000000000000000000', startBlock: 0 },
  staking: { address: '0x0000000000000000000000000000000000000000', startBlock: 0 },

  kashi: {
    liquidationMultiplier: 12,
  },
  xswap: {
    address: '0x0000000000000000000000000000000000000000',
    startBlock: 0,
  },
  legacy: {
    native: { address: NATIVE_ADDRESS },
    whitelistedTokenAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
      anyWETH_ADDRESS,
      anyWBTC_ADDRESS,
      anyUSDC_ADDRESS,
      anyUSDT_ADDRESS,
      anyDAI_ADDRESS,
      USDT_ADDRESS,
      axlUSDC_ADDRESS,
      axlUSDT_ADDRESS,
    ],
    stableTokenAddresses: [USDT_ADDRESS, axlUSDC_ADDRESS, axlUSDT_ADDRESS],
    minimumNativeLiquidity: 200,
    factory: {
      address: '0xd408a20f1213286fb3158a2bfbf5bffaca8bf269',
      initCodeHash: '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
      startBlock: 6891276,
    },
  },
  v2: {
    nativeAddress: NATIVE_ADDRESS,
    whitelistAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
      anyWETH_ADDRESS,
      anyWBTC_ADDRESS,
      anyUSDC_ADDRESS,
      anyUSDT_ADDRESS,
      anyDAI_ADDRESS,
      USDT_ADDRESS,
      axlUSDC_ADDRESS,
      axlUSDT_ADDRESS,
      WAGMI_ADDRESS,
    ],
    stable0: USDT_ADDRESS,
    stable1: axlUSDC_ADDRESS,
    stable2: axlUSDT_ADDRESS,
    minimumNativeLiquidity: 200,
    factory: {
      address: '0xd408a20f1213286fb3158a2bfbf5bffaca8bf269',
      initCodeHash: '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
      startBlock: 6891276,
    }
  },
  v3: {
    factory: {
      address: '0x1e9b24073183d5c6b7ae5fb4b8f0b1dd83fdc77a',
      startBlock: 4214966,
    },
    positionManager: {
      address: '0xbf3b71decbcefabb3210b9d8f18ec22e0556f5f0',
      startBlock: 6890509,
    },
    native: { address: NATIVE_ADDRESS },
    whitelistedTokenAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
      anyWETH_ADDRESS,
      anyWBTC_ADDRESS,
      anyUSDC_ADDRESS,
      anyUSDT_ADDRESS,
      anyDAI_ADDRESS,
      USDT_ADDRESS,
      axlUSDC_ADDRESS,
      axlUSDT_ADDRESS,
      WAGMI_ADDRESS,
    ],
    stableTokenAddresses: [USDT_ADDRESS, axlUSDC_ADDRESS, axlUSDT_ADDRESS],
    nativePricePool: '0x324fb03755683b613d6062b5b5aca71979f582b7', // KAVA/USDT
    minimumEthLocked: 200
  },
  routeprocessor: {
    address: "0xb45e53277a7e0f1d35f2a77160e91e25507f1763",
    startBlock: 8737059,
  }
}
