const NATIVE_ADDRESS = '0x40375c92d9faf44d2f9db9bd9ba41a3317a2404f'
const NATIVE2_ADDRESS = '0x191e94fa59739e188dce837f7f6978d84727ad01'
const USDT_ADDRESS = '0x900101d06a7426441ae63e9ab3b9b0f63be145f1'
const USDC_ADDRESS = '0xa4151b2b3e269645181dccf2d426ce75fcbdeca9'
const WETH_ADDRESS = '0xeab3ac417c4d6df6b143346a46fee1b847b50296'

module.exports = {
  network: 'core',
  blocks: {
    address: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
    startBlock: 5211850,
  },
  v2: {
    nativeAddress: NATIVE_ADDRESS,
    whitelistAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
      NATIVE2_ADDRESS,
      USDT_ADDRESS,
      USDC_ADDRESS,
      WETH_ADDRESS,
    ],
    stable0: USDC_ADDRESS,
    stable1: USDT_ADDRESS,
    stable2: "0x0000000000000000000000000000000000000000", // NOT 3 STABLES ON HERE
    minimumNativeLiquidity: 1000,
    factory: {
      address: '0xb45e53277a7e0f1d35f2a77160e91e25507f1763',
      initCodeHash: '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
      startBlock: 8051339,
    }
  },
  v3: {
    // graft using base w/ nativePricingPool = WCORE/USDT 0.3%
    // (0x72d8e6d7307dcf11a3456b9f6fdfad05385b2f3e)
    base: 'QmZ2DS4ygETCH1DPXLY42moVjeswZPRHmTnv3Aeuz5S1ji',
    startBlock: 13174609,
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
    nativePricePool: '0x95dcc9e9bf80980375494346e00fc5aef6883ef7', // WCORE/USDT 0.05%
    minimumEthLocked: 1000,
  },
  legacy: {
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
    minimumNativeLiquidity: 1000,
    factory: {
      address: '0xb45e53277a7e0f1d35f2a77160e91e25507f1763',
      initCodeHash: '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
      startBlock: 8051339,
    },
  },
  furo: {
    stream: { address: '0x33d91116e0370970444b0281ab117e161febfcdd', startBlock: 12934361 },
    vesting: { address: '0xBda8a8423B7F02Cd935412FB9F13CB88f7875991', startBlock: 12934442 }
  },
  bentobox: {
    address: '0x1400feFD6F9b897970f00Df6237Ff2B8b27Dc82C',
    startBlock: 12932398
  },
  routeprocessor: {
    address: '0x0389879e0156033202c44bf784ac18fc02edee4f',
    startBlock: 11856234,
  }
}
