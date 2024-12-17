const NATIVE_ADDRESS = '0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38' // wS
const USDC_ADDRESS = '0x391071Fe567d609E4af9d32de726d4C33679C7e2'
const WETH_ADDRESS = '0x309C92261178fA0CF748A855e90Ae73FDb79EBc7'

module.exports = {
  network: 'sonic',
  blocks: {
    address: '0xB45e53277a7e0F1D35f2a77160e91e25507f1763',
    startBlock: 0,
  },
  v2: {
    nativeAddress: NATIVE_ADDRESS,
    whitelistAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
      WETH_ADDRESS,
      USDC_ADDRESS,
    ],
    stable0: USDC_ADDRESS,
    stable1: '0x0000000000000000000000000000000000000000',
    stable2: '0x0000000000000000000000000000000000000000',
    minimumNativeLiquidity: 700,
    factory: {
      address: '0xB45e53277a7e0F1D35f2a77160e91e25507f1763',
      initCodeHash: '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
      startBlock: 347155,
    }
  },
  v3: {
    factory: {
      address: '0x46B3fDF7b5CDe91Ac049936bF0bDb12c5d22202e',
      startBlock: 347590,
    },
    positionManager: {
      address: '0x0389879e0156033202C44BF784ac18fC02edeE4f',
      startBlock: 347808,
    },
    native: { address: NATIVE_ADDRESS },
    whitelistedTokenAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
      WETH_ADDRESS,
      USDC_ADDRESS,
    ],
    stableTokenAddresses: [
      USDC_ADDRESS,
    ],
    nativePricePool: '0x05F327F9D92Ff24E6ad11fE256E1f7D9dDa37808', // wS/USDC - 0.03%
    minimumEthLocked: 700,
  }
}
