const NATIVE_ADDRESS = '0x4200000000000000000000000000000000000006'
const USDC_ADDRESS = '0xeb466342c4d449bc9f53a865d5cb90586f405215'
const DAI_ADDRESS = '0x5c7e299cf531eb66f2a1df637d37abb78e6200c7'

module.exports = {
  network: 'base',
  blocks: {
    address: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
    startBlock: 1759510,
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
