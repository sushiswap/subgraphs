const NATIVE_ADDRESS = '0x5300000000000000000000000000000000000004'
const WBTC_ADDRESS = '0x3C1BCa5a656e69edCD0D4E36BEbb3FcDAcA60Cf1'
const USDC_ADDRESS = '0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4'
const DAI_ADDRESS = '0xcA77eB3fEFe3725Dc33bccB54eDEFc3D9f764f97'
const USDT_ADDRESS = '0xf55BEC9cafDbE8730f096Aa55dad6D22d44099Df'
const axlUSDC_ADDRESS = '0xEB466342C4d449BC9f53A865D5Cb90586f405215'

module.exports = {
  network: 'scroll',
  blocks: {
    address: '0xB45e53277a7e0F1D35f2a77160e91e25507f1763',
    startBlock: 81841,
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
      axlUSDC_ADDRESS
    ],
    stableTokenAddresses: [USDC_ADDRESS, DAI_ADDRESS, USDT_ADDRESS, axlUSDC_ADDRESS],
    nativePricePool: '0xE64AE4128e725868e8Fe52E771e3d272e787B041', // WETH/USDC
    minimumEthLocked: 1,
  },
}
