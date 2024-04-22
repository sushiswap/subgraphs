const NATIVE_ADDRESS = '0xc58aad327d6d58d979882601ba8dda0685b505ea' // BOBA

const USDC_ADDRESS = '0x9f98f9f312d23d078061962837042b8918e6aff2'
const BUSD_ADDRESS = '0x4a2c2838c3907d024916c3f4fe07832745ae4bec'
const USDT_ADDRESS = '0x1e633dcd0d3d349126983d58988051f7c62c543d'

module.exports = {
  network: 'boba-bnb',
  native: { address: NATIVE_ADDRESS },
  legacy: {
    native: { address: NATIVE_ADDRESS },
    whitelistedTokenAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
      USDC_ADDRESS,
      BUSD_ADDRESS,
      USDT_ADDRESS,
    ],
    stableTokenAddresses: [
      USDC_ADDRESS,
      BUSD_ADDRESS,
      USDT_ADDRESS,
    ],
    minimumNativeLiquidity: 3000,
    factory: {
      address: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
      initCodeHash: '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
      startBlock: 3292,
    },
  },
  blocks: {
    address: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
    startBlock: 3292,
  },
  v2: {
    nativeAddress: NATIVE_ADDRESS,
    whitelistAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
      USDC_ADDRESS,
      BUSD_ADDRESS,
      USDT_ADDRESS,
    ],
    stable0: USDC_ADDRESS,
    stable1: USDT_ADDRESS,
    stable2: BUSD_ADDRESS,
    minimumNativeLiquidity: 3000,
    factory: {
      address: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
      initCodeHash: '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
      startBlock: 3292,
    }
  },
}
