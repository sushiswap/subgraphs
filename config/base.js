const NATIVE_ADDRESS = '0x4200000000000000000000000000000000000006'
const USDC_ADDRESS = '0xeb466342c4d449bc9f53a865d5cb90586f405215'
const DAI_ADDRESS = '0x5c7e299cf531eb66f2a1df637d37abb78e6200c7'
const TOSHI_ADDRESS = '0x8544fe9d190fd7ec52860abbf45088e81ee24a8c'
const SUSHI_TOKEN = '0x81ab7e0d570b01411fcc4afd3d50ec8c241cb74b'
const DAI2_ADDRESS = '0x50c5725949a6f0c72e6c4a641f24049a917db0cb'

module.exports = {
  network: 'base',
  blocks: {
    address: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
    startBlock: 1759510,
  },
  legacy: {
    native: { address: NATIVE_ADDRESS },
    whitelistedTokenAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
      DAI_ADDRESS,
      USDC_ADDRESS,
      TOSHI_ADDRESS,
      SUSHI_TOKEN,
      DAI2_ADDRESS,
    ],
    stableTokenAddresses: [DAI_ADDRESS, USDC_ADDRESS, DAI2_ADDRESS],
    minimumNativeLiquidity: 1,
    factory: {
      address: '0x71524b4f93c58fcbf659783284e38825f0622859',
      initCodeHash: '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
      startBlock: 2631214,
    },
  },
  v3: {
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
      USDC_ADDRESS,
    ],
    stableTokenAddresses: [DAI_ADDRESS, USDC_ADDRESS],
    nativePricePool: '0x6ecf6b2ca5b1681412839d9b72f43ff87acd3786', // WETH/USDC
    minimumEthLocked: 1,
  },
}
