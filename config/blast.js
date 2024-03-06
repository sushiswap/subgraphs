
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
      address: '0x42fa929fc636e657ac568c0b5cf38e203b67ac2b',
      initCodeHash: '0x0871b2842bc5ad89183710ec5587b7e7e285f1212e8960a4941335bab95cf6af',
      startBlock: 285621,
    },
  },
  v3: {
    factory: {
      address: '0x7680d4b43f3d1d54d6cfeeb2169463bfa7a6cf0d',
      startBlock: 284122,
    },
    positionManager: {
      address: '0x51edb3e5bce8618b77b60215f84ad3db14709051',
      startBlock: 284489,
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
    nativePricePool: '0xcd03572e7cfb94996beebaa539234ce5c23ae1d6', // WETH/USDB - 0.03%
    minimumEthLocked: 1,
  },
  routeprocessor3: {
    address: "0xcdbcd51a5e8728e0af4895ce5771b7d17ff71959",
    startBlock: 223662,
  }
}
