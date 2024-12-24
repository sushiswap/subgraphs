const NATIVE_ADDRESS = '0x039e2fb66102314ce7b64ce5ce3e5183bc94ad38' // wS
const USDC_ADDRESS = '0x29219dd400f2bf60e5a23d13be72b486d4038894'
const WETH_ADDRESS = '0x309c92261178fa0cf748a855e90ae73fdb79ebc7'

module.exports = {
  network: 'sonic',
  blocks: {
    address: '0xb45e53277a7e0f1d35f2a77160e91e25507f1763',
    startBlock: 0,
  },
  v2: {
    nativeAddress: NATIVE_ADDRESS,
    whitelistAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
      WETH_ADDRESS,
      USDC_ADDRESS,
    ],
    stable0: USDC_ADDRESS,
    stable1: '0x0000000000000000000000000000000000000000',
    stable2: '0x0000000000000000000000000000000000000000',
    minimumNativeLiquidity: 700,
    factory: {
      address: '0xB45e53277a7e0F1D35f2a77160e91e25507f1763',
      initCodeHash: '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
      startBlock: 347155,
    }
  },
  v3: {
    factory: {
      address: '0x46b3fdf7b5cde91ac049936bf0bdb12c5d22202e',
      startBlock: 347590,
    },
    positionManager: {
      address: '0x0389879e0156033202c44bf784ac18fc02edee4f',
      startBlock: 347808,
    },
    native: { address: NATIVE_ADDRESS },
    whitelistedTokenAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
      WETH_ADDRESS,
      USDC_ADDRESS,
    ],
    stableTokenAddresses: [
      USDC_ADDRESS,
    ],
    nativePricePool: '0xdc91e26f6131599c89be765e3c1144e8a450f0f8', // wS/USDC - 0.03%
    minimumEthLocked: 700,
  }
}
