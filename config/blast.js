const NATIVE_ADDRESS = '0x4300000000000000000000000000000000000004'
const USDB_ADDRESS = '0x4300000000000000000000000000000000000003'
const axlUSDC_ADDRESS = '0xeb466342c4d449bc9f53a865d5cb90586f405215'
const ORE_ADDRESS = '0x0000000000a1c217530f17948cbb487c743b9f63'
const MIM_ADDRESS = '0x76da31d7c9cbeae102aff34d3398bc450c8374c1'
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
      axlUSDC_ADDRESS,
      ORE_ADDRESS
    ],
    stableTokenAddresses: [
      USDB_ADDRESS, 
      axlUSDC_ADDRESS,
    ],
    minimumNativeLiquidity: 1,
    factory: {
      address: '0x42fa929fc636e657ac568c0b5cf38e203b67ac2b',
      initCodeHash: '0x0871b2842bc5ad89183710ec5587b7e7e285f1212e8960a4941335bab95cf6af',
      startBlock: 285621,
    },
  },
  v2: {
    nativeAddress: NATIVE_ADDRESS,
    whitelistAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
      USDB_ADDRESS,
      axlUSDC_ADDRESS,
      ORE_ADDRESS,
    ],
    stable0: USDB_ADDRESS,
    stable1: axlUSDC_ADDRESS,
    stable2: MIM_ADDRESS,
    minimumNativeLiquidity: 0.45,
    factory: {
      address: '0x42fa929fc636e657ac568c0b5cf38e203b67ac2b',
      initCodeHash: '0x0871b2842bc5ad89183710ec5587b7e7e285f1212e8960a4941335bab95cf6af',
      startBlock: 285621,
    }
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
      axlUSDC_ADDRESS,
      ORE_ADDRESS,
      MIM_ADDRESS
    ],
    stableTokenAddresses: [
      USDB_ADDRESS, axlUSDC_ADDRESS, MIM_ADDRESS
    ],
    nativePricePool: '0xcd03572e7cfb94996beebaa539234ce5c23ae1d6', // WETH/USDB - 0.03%
    minimumEthLocked: 1,
  },
  routeprocessor: {
    address: "0xcdbcd51a5e8728e0af4895ce5771b7d17ff71959",
    startBlock: 223662
  }
}
