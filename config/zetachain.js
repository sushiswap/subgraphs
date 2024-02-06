const NATIVE_ADDRESS = '0x5f0b1a82749cb4e2278ec87f8bf6b618dc71a8bf'
const USDC_BSC_ADDRESS = '0x05ba149a7bd6dc1f937fa9046a9e05c05f3b18b0'
const USDC_ETH_ADDRESS = '0x0cbe0df132a6c6b4a2974fa1b7fb953cf0cc798a'
const USDT_BSC_ADDRESS = '0x91d4f0d54090df2d81e834c3c8ce71c6c865e79f'
const USDT_ETH_ADDRESS = '0x7c8dda80bbbe1254a7aacf3219ebe1481c6e01d7'
const ETH_ETH_ADDRESS = '0xd97b1de3619ed2c6beb3860147e30ca8a7dc9891'
const BNB_BSC_ADDRESS = '0x48f80608b672dc30dc7e3dbbd0343c5f02c738eb'
const BTC_BTC_ADDRESS = '0x13a0c5930c028511dc02665e7285134b6d11a5f4'

module.exports = {
  network: 'zetachain-mainnet',
  blocks: {
    address: '0xb45e53277a7e0f1d35f2a77160e91e25507f1763',
    startBlock: 1551069,
  },
  legacy: {
    native: {
      address: NATIVE_ADDRESS,
    },
    whitelistedTokenAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
      USDC_BSC_ADDRESS,
      USDC_ETH_ADDRESS,
      USDT_BSC_ADDRESS,
      USDT_ETH_ADDRESS,
      ETH_ETH_ADDRESS,
      BNB_BSC_ADDRESS,
      BTC_BTC_ADDRESS
    ],
    stableTokenAddresses: [
      USDC_BSC_ADDRESS,
      USDC_ETH_ADDRESS,
      USDT_BSC_ADDRESS,
      USDT_ETH_ADDRESS
    ],
    minimumNativeLiquidity: 1000,
    factory: {
      address: '0x33d91116e0370970444b0281ab117e161febfcdd',
      initCodeHash: '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
      startBlock: 1552091,
    },
  },
  v3: {
    factory: {
      address: '0xb45e53277a7e0f1d35f2a77160e91e25507f1763',
      startBlock: 1551069,
    },
    positionManager: {
      address: '0xcdbcd51a5e8728e0af4895ce5771b7d17ff71959',
      startBlock: 1551670,
    },
    native: { address: NATIVE_ADDRESS },
    whitelistedTokenAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
      USDC_BSC_ADDRESS,
      USDC_ETH_ADDRESS,
      USDT_BSC_ADDRESS,
      USDT_ETH_ADDRESS,
      ETH_ETH_ADDRESS,
      BNB_BSC_ADDRESS,
      BTC_BTC_ADDRESS
    ],
    stableTokenAddresses: [
      USDC_BSC_ADDRESS,
      USDC_ETH_ADDRESS,
      USDT_BSC_ADDRESS,
      USDT_ETH_ADDRESS
    ],
    nativePricePool: '0xe449be94d63ce46c80ac21c486630013e66d2fe5', // ZETA/USDT.ETH - 0.03%
    minimumEthLocked: 1000,
  },
}
