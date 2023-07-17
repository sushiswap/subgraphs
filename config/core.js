const NATIVE_ADDRESS = '0x191e94fa59739e188dce837f7f6978d84727ad01'
const NATIVE2_ADDRESS = '0x40375c92d9faf44d2f9db9bd9ba41a3317a2404f'
const USDT_ADDRESS = '0x900101d06a7426441ae63e9ab3b9b0f63be145f1'
const USDC_ADDRESS = '0xa4151b2b3e269645181dccf2d426ce75fcbdeca9'
const WETH_ADDRESS = '0xeab3ac417c4d6df6b143346a46fee1b847b50296'

module.exports = {
  network: 'core',
  blocks: {
    address: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
    startBlock: 5211850,
  },
  v3: {
    factory: {
      address: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
      startBlock: 5211850,
    },
    positionManager: {
      address: '0xF4d73326C13a4Fc5FD7A064217e12780e9Bd62c3',
      startBlock: 5212007,
    },
    native: { address: NATIVE_ADDRESS },
    whitelistedTokenAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
      NATIVE2_ADDRESS,
      USDT_ADDRESS,
      USDC_ADDRESS,
      WETH_ADDRESS,
    ],
    stableTokenAddresses: [USDT_ADDRESS, USDC_ADDRESS],
    nativePricePool: '0x72d8e6d7307dcf11a3456b9f6fdfad05385b2f3e', // WCORE/USDT
    minimumEthLocked: 1000,
  },
}
