const NATIVE_ADDRESS = '0xdeaddeaddeaddeaddeaddeaddeaddeaddead0000' // WETH
const BOBA_ADDRESS = '0xa18bf3994c0cc6e3b63ac420308e5383f53120d7'
const WBTC_ADDRESS = '0xdc0486f8bf31DF57a952bcd3c1d3e166e3d9eC8b'
const SUSHI_ADDRESS = '0x5ffccc55c0d2fd6d3ac32c26c020b3267e933f1b'
const USDT_ADDRESS = '0x5de1677344d3cb0d7d465c10b72a8f60699c062d'
const DAI_ADDRESS = '0xf74195bb8a5cf652411867c5c2c5b8c2a402be35'
const USDC_ADDRESS = '0x66a2a913e447d6b4bf33efbec43aaef87890fbbc'
const FRAX_ADDRESS = '0xab2af3a98d229b7daed7305bb88ad0ba2c42f9ca'
const UST_ADDRESS = '0xe5ef1407928ebce28a6f1a0759251b7187fea726'
const BUSD_ADDRESS = '0x352f2fdf653a194b42e3311f869237c66309b69e'


module.exports = {
  network: 'boba',
  native: { address: NATIVE_ADDRESS },
  sushi: { address: SUSHI_ADDRESS },
  weth: { address: NATIVE_ADDRESS },
  wbtc: { address: WBTC_ADDRESS },
  minichef: {
    address: '0x75f52766a6a23f736edefcd69dfbe6153a48c3f3',
    startBlock: 813755,
    rewarder: {
      complex: {
        address: '0xf731202a3cf7efa9368c2d7bd613926f7a144db5',
        rewardToken: { address: BOBA_ADDRESS },
      }
    },
  },
  legacy: {
    native: { address: NATIVE_ADDRESS },
    whitelistedTokenAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
      BOBA_ADDRESS,
      WBTC_ADDRESS,
      USDT_ADDRESS,
      DAI_ADDRESS,
      USDC_ADDRESS,
      FRAX_ADDRESS,
      UST_ADDRESS,
      SUSHI_ADDRESS,
      BUSD_ADDRESS
    ],
    stableTokenAddresses: [
      USDT_ADDRESS,
      DAI_ADDRESS,
      USDC_ADDRESS,
      FRAX_ADDRESS,
      UST_ADDRESS,
      BUSD_ADDRESS
    ],
    minimumNativeLiquidity: 3,
    factory: {
      address: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
      initCodeHash: '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
      startBlock: 822561,
    },
  },
  blocks: {
    graft: {
      base: 'QmYFZrHKG6CTuum3jLmC64tgKKrsAGNEzcs4Mw781bbb3W',
      startBlock: 1476119,
    },
    address: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
    startBlock: 822561,
  },
  v2: {
    nativeAddress: NATIVE_ADDRESS,
    whitelistAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
      BOBA_ADDRESS,
      WBTC_ADDRESS,
      USDT_ADDRESS,
      DAI_ADDRESS,
      USDC_ADDRESS,
      FRAX_ADDRESS,
      UST_ADDRESS,
      SUSHI_ADDRESS,
      BUSD_ADDRESS
    ],
    stable0: USDC_ADDRESS,
    stable1: USDT_ADDRESS,
    stable2: DAI_ADDRESS,
    minimumNativeLiquidity: 2,
    factory: {
      address: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
      initCodeHash: '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
      startBlock: 822561,
    }
  },
  v3: {
    factory: {
      address: '0x0be808376ecb75a5cf9bb6d237d16cd37893d904',
      startBlock: 998556,
    },
    positionManager: {
      address: '0x1b9d177ccdea3c79b6c8f40761fc8dc9d0500eaa',
      startBlock: 998558,
    },
    native: { address: NATIVE_ADDRESS },
    whitelistedTokenAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
      BOBA_ADDRESS,
      WBTC_ADDRESS,
      USDT_ADDRESS,
      DAI_ADDRESS,
      USDC_ADDRESS,
      FRAX_ADDRESS,
      UST_ADDRESS,
      SUSHI_ADDRESS,
      BUSD_ADDRESS
    ],
    stableTokenAddresses: [
      USDT_ADDRESS,
      DAI_ADDRESS,
      USDC_ADDRESS,
      FRAX_ADDRESS,
      UST_ADDRESS,
      BUSD_ADDRESS
    ],
    nativePricePool: '0x03371a9811aa5529ba402268bea8c356cd1bdad8',
    minimumEthLocked: 0.7,
  },
  routeprocessor: {
    address: "0xbe811a0d44e2553d25d11cb8dc0d3f0d0e6430e6",
    startBlock: 1008874,
  }
}
