const NATIVE_ADDRESS = '0x4f9a0e7fd2bf6067db6994cf12e4495df938e6e9'
const WETH_ADDRESS = '0x4f9a0e7fd2bf6067db6994cf12e4495df938e6e9'
const WBTC_ADDRESS = '0xea034fb02eb1808c2cc3adbc15f447b93cbe08e1'
const USDC_ADDRESS = '0xa8ce8aee21bc2a48a5ef670afcc9274c7bbbc035'
const USDT_ADDRESS = '0x1e4a5963abfd975d8c9021ce480b42188849d41d'
const DAI_ADDRESS = '0xc5015b9d9161dca7e18e32f6f25c4ad850731fd4'
const MATIC_ADDRESS = '0xa2036f0538221a77a3937f1379699f44945018d0'

module.exports = {
  network: 'polygon-zkevm',
  // sushi: { address: SUSHI_ADDRESS },
  weth: { address: WETH_ADDRESS },
  wbtc: { address: WBTC_ADDRESS },
  blocks: {
    address: '0x1b02da8cb0d097eb8d57a175b88c7d8b47997506',
    startBlock: 80860,
  },
  v3: {
    factory: {
      address: '0x1b02da8cb0d097eb8d57a175b88c7d8b47997506',
      startBlock: 80860,
    },
    positionManager: {
      address: '0xf4d73326c13a4fc5fd7a064217e12780e9bd62c3',
      startBlock: 81001,
    },
    native: { address: NATIVE_ADDRESS },
    whitelistedTokenAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
      WBTC_ADDRESS,
      USDC_ADDRESS,
      USDT_ADDRESS,
      DAI_ADDRESS,
      MATIC_ADDRESS,
    ],
    stableTokenAddresses: [USDC_ADDRESS, USDT_ADDRESS, DAI_ADDRESS],
    nativePricePool: '0x41bbde5dfa689a2e53808d752e864c013ac4b733',
    minimumEthLocked: 0.7,
  },
  legacy: {
    native: { address: NATIVE_ADDRESS },
    whitelistedTokenAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
      WBTC_ADDRESS,
      USDC_ADDRESS,
      USDT_ADDRESS,
      DAI_ADDRESS,
      MATIC_ADDRESS,
    ],
    stableTokenAddresses: [USDC_ADDRESS, USDT_ADDRESS, DAI_ADDRESS],
    minimumNativeLiquidity: 0.7,
    factory: {
      address: '0xb45e53277a7e0f1d35f2a77160e91e25507f1763',
      initCodeHash: '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
      startBlock: 6312213,
    },
  },
}
