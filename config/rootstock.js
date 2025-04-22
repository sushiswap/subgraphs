const NATIVE_ADDRESS = '0x542fda317318ebf1d3deaf76e0b632741a7e677d' // WRBTC
const RUSDT_ADDRESS = '0xef213441a85df4d7acbdae0cf78004e1e486bb96'
const RDAI_ADDRESS = '0x6b1a73d547f4009a26b8485b63d7015d248ad406'
const RUSDC_ADDRESS = '0x1bda44fda023f2af8280a16fd1b01d1a493ba6c4'
const RIF_ADDRESS = '0x2acc95758f8b5f583470ba265eb685a8f45fc9d5'
const SOV_ADDRESS = '0xefc78fc7d48b64958315949279ba181c2114abbd'
const ETHS_ADDRESS = '0x1d931bf8656d795e50ef6d639562c5bd8ac2b78f'
const XUSD_ADDRESS = '0xb5999795be0ebb5bab23144aa5fd6a02d080299f'
const SOLV_BTC_ADDRESS = '0x541fd749419ca806a8bc7da8ac23d346f2df8b77'
const XSOLV_BTC_ADDRESS = '0xcc0966d8418d412c599a6421b760a847eb169a8c'

module.exports = {
  network: 'rootstock',
  blocks: {
    address: '0xb45e53277a7e0f1d35f2a77160e91e25507f1763',
    startBlock: 6365043,
  },
  legacy: {
    native: {
      address: NATIVE_ADDRESS,
    },
    whitelistedTokenAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
      RUSDT_ADDRESS,
      RDAI_ADDRESS,
      RUSDC_ADDRESS,
      RIF_ADDRESS,
      SOV_ADDRESS,
      ETHS_ADDRESS,
      XUSD_ADDRESS
    ],
    stableTokenAddresses: [
      RUSDT_ADDRESS,
      RDAI_ADDRESS,
      RUSDC_ADDRESS
    ],
    minimumNativeLiquidity: 0.02,
    factory: {
      address: '0xb45e53277a7e0f1d35f2a77160e91e25507f1763',
      initCodeHash: '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
      startBlock: 6365043,
    },
  },
  v2: {
    nativeAddress: NATIVE_ADDRESS,
    whitelistAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
      RUSDT_ADDRESS,
      RDAI_ADDRESS,
      RUSDC_ADDRESS,
      RIF_ADDRESS,
      SOV_ADDRESS,
      ETHS_ADDRESS,
      XUSD_ADDRESS,
      SOLV_BTC_ADDRESS,
      XSOLV_BTC_ADDRESS,
    ],
    stable0: RUSDT_ADDRESS,
    stable1: RDAI_ADDRESS,
    stable2: RUSDC_ADDRESS,
    minimumNativeLiquidity: 0.02,
    factory: {
      address: '0xb45e53277a7e0f1d35f2a77160e91e25507f1763',
      initCodeHash: '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
      startBlock: 6365043,
    }
  },
  v3: {
    // base: 'QmNo5q6UHp39aJQww6c2cRfr7LvzUFizHDeXZPY9hkGQHd', // v3-rootstock-2 is deployed with this graft setup
    // startBlock: 6748405, // issue on 6748406
    factory: {
      address: '0x46b3fdf7b5cde91ac049936bf0bdb12c5d22202e',
      startBlock: 6365060,
    },
    positionManager: {
      address: '0x0389879e0156033202c44bf784ac18fc02edee4f',
      startBlock: 6365100,
    },
    native: { address: NATIVE_ADDRESS },
    whitelistedTokenAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
      RUSDT_ADDRESS,
      RDAI_ADDRESS,
      RUSDC_ADDRESS,
      RIF_ADDRESS,
      SOV_ADDRESS,
      ETHS_ADDRESS,
      XUSD_ADDRESS,
      SOLV_BTC_ADDRESS,
      XSOLV_BTC_ADDRESS,
    ],
    stableTokenAddresses: [
      RUSDT_ADDRESS,
      RDAI_ADDRESS,
      RUSDC_ADDRESS
    ],
    nativePricePool: '0xc0b92ac272d427633c36fd03dc104a2042b3a425', // WRBTC/RUSDT - 0.03%
    minimumEthLocked: 0.02,
  },
  routeprocessor: {
    address: "0xb46e319390de313b8cc95ea5aa30c7bbfd79da94",
    startBlock: 6365115,
  }
}
