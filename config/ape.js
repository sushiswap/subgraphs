const NATIVE_ADDRESS = '0x48b62137edfa95a428d35c09e44256a739f6b557'
const APE_ETH = '0xcf800f4948d16f23333508191b1b1591daf70438'
const APE_USD = '0xa2235d059f80e176d931ef76b6c51953eb3fbef4'

module.exports = {
  network: 'apechain',
  legacy: {
    startBlock: 316146,
    native: { address: NATIVE_ADDRESS },
    whitelistedTokenAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
      APE_ETH,
      APE_USD
    ],
    stableTokenAddresses: [APE_USD],
    minimumNativeLiquidity: 500,
    factory: {
      address: '0x46b3fdf7b5cde91ac049936bf0bdb12c5d22202e',
      initCodeHash: '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
      startBlock: 316146,
    },
  },
  v2: {
    nativeAddress: NATIVE_ADDRESS,
    whitelistAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
      APE_ETH,
      APE_USD
    ],
    stable0: APE_USD,
    stable1: '0x0000000000000000000000000000000000000000',
    stable2: '0x0000000000000000000000000000000000000000',
    minimumNativeLiquidity: 500,
    factory: {
      address: '0x46b3fdf7b5cde91ac049936bf0bdb12c5d22202e',
      initCodeHash: '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
      startBlock: 316146,
    }
  },
  routeprocessor: {
    address: '0xf2614a233c7c3e7f08b1f887ba133a13f1eb2c55',
    startBlock: 282635,
  }
}
