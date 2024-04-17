const NATIVE_ADDRESS = '0x5300000000000000000000000000000000000004'
const WBTC_ADDRESS = '0x3c1bca5a656e69edcd0d4e36bebb3fcdaca60cf1'
const USDC_ADDRESS = '0x06efdbff2a14a7c8e15944d1f4a48f9f95f663a4'
const DAI_ADDRESS = '0xca77eb3fefe3725dc33bccb54edefc3d9f764f97'
const USDT_ADDRESS = '0xf55bec9cafdbe8730f096aa55dad6d22d44099df'
const axlUSDC_ADDRESS = '0xeb466342c4d449bc9f53a865d5cb90586f405215'
const axlFRAX_ADDRESS = '0x406cde76a3fd20e48bc1e0f60651e60ae204b040'
const frxETH_ADDRESS = '0xecc68d0451e20292406967fe7c04280e5238ac7d'
module.exports = {
  network: 'scroll',
  blocks: {
    address: '0xB45e53277a7e0F1D35f2a77160e91e25507f1763',
    startBlock: 0,
  },
  legacy: {
    native: { address: NATIVE_ADDRESS },
    whitelistedTokenAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
      WBTC_ADDRESS,
      USDC_ADDRESS,
      DAI_ADDRESS,
      USDT_ADDRESS,
      axlUSDC_ADDRESS
    ],
    stableTokenAddresses: [USDC_ADDRESS, DAI_ADDRESS, USDT_ADDRESS, axlUSDC_ADDRESS],
    minimumNativeLiquidity: 1,
    factory: {
      address: '0xB45e53277a7e0F1D35f2a77160e91e25507f1763',
      initCodeHash: '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
      startBlock: 81841,
    },
  },
  v2: {
    nativeAddress: NATIVE_ADDRESS,
    whitelistAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
      WBTC_ADDRESS,
      USDC_ADDRESS,
      DAI_ADDRESS,
      USDT_ADDRESS,
      axlUSDC_ADDRESS,
      axlFRAX_ADDRESS,
      frxETH_ADDRESS,
    ],
    stable0: USDC_ADDRESS,
    stable1: USDT_ADDRESS,
    stable2: axlUSDC_ADDRESS,
    minimumNativeLiquidity: 0.45,
    factory: {
      address: '0xB45e53277a7e0F1D35f2a77160e91e25507f1763',
      initCodeHash: '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
      startBlock: 81841,
    }
  },
  v3: {
    factory: {
      address: '0x46B3fDF7b5CDe91Ac049936bF0bDb12c5d22202e',
      startBlock: 82522,
    },
    positionManager: {
      address: '0x0389879e0156033202C44BF784ac18fC02edeE4f',
      startBlock: 82597,
    },
    native: { address: NATIVE_ADDRESS },
    whitelistedTokenAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
      WBTC_ADDRESS,
      USDC_ADDRESS,
      DAI_ADDRESS,
      USDT_ADDRESS,
      axlUSDC_ADDRESS,
      axlFRAX_ADDRESS,
      frxETH_ADDRESS,
    ],
    stableTokenAddresses: [USDC_ADDRESS, DAI_ADDRESS, USDT_ADDRESS, axlUSDC_ADDRESS],
    nativePricePool: '0xe64ae4128e725868e8fe52e771e3d272e787b041', // WETH/USDC
    minimumEthLocked: 1,
  },
}
