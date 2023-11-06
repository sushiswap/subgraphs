const NATIVE_ADDRESS = '0xe5d7c2a44ffddf6b295a15c148167daaaf5cf34f'
const USDC_ADDRESS = '0xeb466342c4d449bc9f53a865d5cb90586f405215'
const DAI_ADDRESS = '0x5c7e299cf531eb66f2a1df637d37abb78e6200c7'
const WETH_ADDRESS = '0xeab3ac417c4d6df6b143346a46fee1b847b50296'

module.exports = {
  network: 'linea-mainnet',
  blocks: {
    address: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
    startBlock: 53256,
  },
  v3: {
    factory: {
      address: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
      startBlock: 53256,
    },
    positionManager: {
      address: '0x80C7DD17B01855a6D2347444a0FCC36136a314de',
      startBlock: 53306,
    },
    native: { address: NATIVE_ADDRESS },
    whitelistedTokenAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
      DAI_ADDRESS,
      USDC_ADDRESS,
      WETH_ADDRESS,
    ],
    stableTokenAddresses: [DAI_ADDRESS, USDC_ADDRESS],
    nativePricePool: '0xe5ea78ebbacb76cd430e6832ee3e46ef15a82c56', // WETH/USDC
    minimumEthLocked: 1,
  },
  legacy: {
    native: { address: NATIVE_ADDRESS },
    whitelistedTokenAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
      DAI_ADDRESS,
      USDC_ADDRESS,
      WETH_ADDRESS,
    ],
    stableTokenAddresses: [DAI_ADDRESS, USDC_ADDRESS],
    minimumNativeLiquidity: 1,
    factory: {
      address: '0xfbc12984689e5f15626bad03ad60160fe98b303c',
      initCodeHash: '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
      startBlock: 631714,
    },
  },
}
