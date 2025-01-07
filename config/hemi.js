const NATIVE_ADDRESS = '0x4200000000000000000000000000000000000006'
const USDC_ADDRESS = '0xad11a8beb98bbf61dbb1aa0f6d6f2ecd87b35afa'
const USDT_ADDRESS = '0xbb0d083fb1be0a9f6157ec484b6c79e0a4e31c2e'

module.exports = {
  network: 'hemi',
  blocks: {
    address: '0x9b3336186a38e1b6c21955d112dbb0343ee061ee',
    startBlock: 0,
  },
  v2: {
    nativeAddress: NATIVE_ADDRESS,
    whitelistAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
      USDC_ADDRESS,
      USDT_ADDRESS
    ],
    stable0: USDC_ADDRESS,
    stable1: USDT_ADDRESS,
    stable2: '0x0000000000000000000000000000000000000000',
    minimumNativeLiquidity: 0.5,
    factory: {
      address: '0x9b3336186a38e1b6c21955d112dbb0343ee061ee',
      initCodeHash: '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
      startBlock: 452730,
    }
  },
  v3: {
    factory: {
      address: '0xcdbcd51a5e8728e0af4895ce5771b7d17ff71959',
      startBlock: 507517,
    },
    positionManager: {
      address: '0xe43ca1dee3f0fc1e2df73a0745674545f11a59f5',
      startBlock: 507584,
    },
    native: { address: NATIVE_ADDRESS },
    whitelistedTokenAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
      USDC_ADDRESS,
      USDT_ADDRESS
    ],
    stableTokenAddresses: [
      USDC_ADDRESS, USDT_ADDRESS
    ],
    nativePricePool: '0x9580d4519c9f27642e21085e763e761a74ef3735', // WETH/USDC - 0.03%
    minimumEthLocked: 0.5,
  },
}
