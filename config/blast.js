
const NATIVE_ADDRESS = '0x4300000000000000000000000000000000000004'
const USDB_ADDRESS = '0x4300000000000000000000000000000000000003'
module.exports = {
  network: 'zetachain-mainnet',
  blocks: {
    address: '0x4300000000000000000000000000000000000004',
    startBlock: 0,
  },
  legacy: {
    native: {
      address: NATIVE_ADDRESS,
    },
    whitelistedTokenAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
      USDB_ADDRESS,
    ],
    stableTokenAddresses: [
      USDB_ADDRESS,
    ],
    minimumNativeLiquidity: 1,
    factory: {
      address: '0',
      initCodeHash: '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
      startBlock: 0,
    },
  },
  v3: {
    factory: {
      address: '',
      startBlock: 0,
    },
    positionManager: {
      address: '',
      startBlock: 0,
    },
    native: { address: NATIVE_ADDRESS },
    whitelistedTokenAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
      USDB_ADDRESS,
    ],
    stableTokenAddresses: [
      USDB_ADDRESS,
    ],
    nativePricePool: '', // ZETA/USDT.ETH - 0.03%
    minimumEthLocked: 1,
  },
}
