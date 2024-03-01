
const NATIVE_ADDRESS = '0x4300000000000000000000000000000000000004'
const USDB_ADDRESS = '0x4300000000000000000000000000000000000003'
module.exports = {
  network: 'blast',
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
      address: '0x1400fefd6f9b897970f00df6237ff2b8b27dc82c',
      initCodeHash: '0xc6c1c4cb44d57484431f0f2bd8064b7306414d895141f2a3b4a29817d0eef556',
      startBlock: 238231,
    },
  },
  v3: {
    factory: {
      address: '0x0389879e0156033202c44bf784ac18fc02edee4f',
      startBlock: 224405,
    },
    positionManager: {
      address: '0xeabce3e74ef41fb40024a21cc2ee2f5ddc615791',
      startBlock: 247740,
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
    nativePricePool: '0xf07b0020e194c20015d20936dd4eadba60d1bf56', // WETH/USDB - 0.03%
    minimumEthLocked: 1,
  },
}
