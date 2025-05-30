const NATIVE_ADDRESS = '0xee7d8bcfb72bc1880d0cf19822eb0a2e6577ab62'
const USDC_ADDRESS = '0x' // TODO

module.exports = {
  network: 'katana',
  blocks: {
    address: '0x72d111b4d6f31b38919ae39779f570b747d6acd9',
    startBlock: 0,
  },
  v2: {
    nativeAddress: NATIVE_ADDRESS,
    whitelistAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
      USDC_ADDRESS,
    ],
    stable0: USDC_ADDRESS,
    // stable1: TODO,
    // stable2: TODO,
    minimumNativeLiquidity: 0.5,
    factory: {
      address: '0x72d111b4d6f31b38919ae39779f570b747d6acd9',
      initCodeHash: '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
      startBlock: 1857623,
    }
  },
  v3: {
    factory: {
      address: '0x203e8740894c8955cb8950759876d7e7e45e04c1',
      startBlock: 1858972,
    },
    positionManager: {
      address: '0x2659c6085d26144117d904c46b48b6d180393d27',
      startBlock: 1860127,
    },
    native: { address: NATIVE_ADDRESS },
    whitelistedTokenAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
      USDC_ADDRESS,
    ],
    stableTokenAddresses: [
      USDC_ADDRESS
    ],
    nativePricePool: 'TODO', // WETH/USDC - 0.03%
    minimumEthLocked: 0.5,
  },
}
