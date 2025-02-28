const NATIVE_ADDRESS = '0x4200000000000000000000000000000000000006'
const AXL_USDC_ADDRESS = '0xeb466342c4d449bc9f53a865d5cb90586f405215'
const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
const DAI_ADDRESS = '0x5c7e299cf531eb66f2a1df637d37abb78e6200c7'
const TOSHI_ADDRESS = '0x8544fe9d190fd7ec52860abbf45088e81ee24a8c'
const SUSHI_TOKEN = '0x81ab7e0d570b01411fcc4afd3d50ec8c241cb74b'
const DAI2_ADDRESS = '0x50c5725949a6f0c72e6c4a641f24049a917db0cb'
const USDBC_ADDRESS = '0xd9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca'
const BRETT_ADDRESS = '0x532f27101965dd16442e59d40670faf5ebb142e4'
const MOCHI_ADDRESS = '0xf6e932ca12afa26665dc4dde7e27be02a7c02e50'
const TYBG_ADDRESS = '0x0d97f261b1e88845184f678e2d1e7a98d9fd38de'
const NORMIE_ADDRESS = '0x7f12d13b34f5f4f0a9449c16bcd42f0da47af200'
const CBETH_ADDRESS = '0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22'

// BLACKLISTED TOKENS
const MEGA_ADDRESS = '0x750647c34e4c6158940df7740d342fefcb6ee4b5'

module.exports = {
  network: 'base',
  blocks: {
    address: '0x71524b4f93c58fcbf659783284e38825f0622859',
    startBlock: 0,
  },
  legacy: {
    native: { address: NATIVE_ADDRESS },
    whitelistedTokenAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
      DAI_ADDRESS,
      AXL_USDC_ADDRESS,
      TOSHI_ADDRESS,
      SUSHI_TOKEN,
      DAI2_ADDRESS,
    ],
    stableTokenAddresses: [DAI_ADDRESS, AXL_USDC_ADDRESS, DAI2_ADDRESS],
    minimumNativeLiquidity: 1,
    factory: {
      address: '0x71524b4f93c58fcbf659783284e38825f0622859',
      initCodeHash: '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
      startBlock: 2631214,
    },
  },
  v2: {
    nativeAddress: NATIVE_ADDRESS,
    whitelistAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
      DAI_ADDRESS,
      AXL_USDC_ADDRESS,
      TOSHI_ADDRESS,
      SUSHI_TOKEN,
      DAI2_ADDRESS,
      USDBC_ADDRESS,
      BRETT_ADDRESS,
      MOCHI_ADDRESS,
      TYBG_ADDRESS,
      NORMIE_ADDRESS,
      CBETH_ADDRESS,
    ],
    stable0: AXL_USDC_ADDRESS,
    stable1: USDBC_ADDRESS,
    stable2: USDC_ADDRESS,
    minimumNativeLiquidity: 1,
    factory: {
      address: '0x71524b4f93c58fcbf659783284e38825f0622859',
      initCodeHash: '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
      startBlock: 2631214,
    }
  },
  v3: {
    graft: {
      base: 'QmZ2R9ABG9ienaZdGyPLcDWDNDkG187RhXmh6fFuEtUaaS',
      startBlock: 26529000,
    },
    factory: {
      address: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
      startBlock: 1759510,
    },
    positionManager: {
      address: '0x80C7DD17B01855a6D2347444a0FCC36136a314de',
      startBlock: 1759765,
    },
    native: { address: NATIVE_ADDRESS },
    whitelistedTokenAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
      DAI_ADDRESS,
      AXL_USDC_ADDRESS,
      TOSHI_ADDRESS,
      SUSHI_TOKEN,
      USDBC_ADDRESS,
      DAI2_ADDRESS,
      BRETT_ADDRESS,
      MOCHI_ADDRESS,
      TYBG_ADDRESS,
      NORMIE_ADDRESS,
      USDC_ADDRESS,
      CBETH_ADDRESS,
    ],
    stableTokenAddresses: [DAI_ADDRESS, AXL_USDC_ADDRESS, USDC_ADDRESS, USDBC_ADDRESS, DAI2_ADDRESS],
    nativePricePool: '0x6ecf6b2ca5b1681412839d9b72f43ff87acd3786', // WETH/USDC
    minimumEthLocked: 1,
    blacklistedTokenAddresses: [
      MEGA_ADDRESS,
    ],
  },
  routeprocessor: {
    address: "0x0389879e0156033202c44bf784ac18fc02edee4f",
    startBlock: 11035555,
  }
}