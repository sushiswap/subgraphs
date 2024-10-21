const NATIVE_ADDRESS = '0x48b62137edfa95a428d35c09e44256a739f6b557'
const APE_ETH = '0xcf800f4948d16f23333508191b1b1591daf70438'
const APE_USD = '0xa2235d059f80e176d931ef76b6c51953eb3fbef4'

module.exports = {
  network: 'apechain',
  legacy: {
    startBlock: 501359,
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
      address: '0x57bffa72db682f7eb6c132dae03ff36bbeb0c459',
      initCodeHash: '0xa0ee53d561d6427800b43a5f4cbd2551f003c447b59341c326a549ecd3fbf40a',
      startBlock: 501359,
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
      address: '0x57bffa72db682f7eb6c132dae03ff36bbeb0c459',
      initCodeHash: '0xa0ee53d561d6427800b43a5f4cbd2551f003c447b59341c326a549ecd3fbf40a',
      startBlock: 501359,
    }
  },
  routeprocessor: {
    address: '0xf2614a233c7c3e7f08b1f887ba133a13f1eb2c55',
    startBlock: 282635,
  }
}
