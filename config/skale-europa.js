const NATIVE_ADDRESS = '0xd2aaa00700000000000000000000000000000000' // ETH
const DAI_ADDRESS = '0xd05c4be5f3be302d376518c9492ec0147fa5a718'
const USDC_ADDRESS = '0x5f795bb52dac3085f578f4877d450e2929d2f13d'
const USDP_ADDRESS = '0x73d22d8a2d1f59bf5bcf62ca382481a2073faf58'
const USDT_ADDRESS = '0x1c0491e3396ad6a35f061c62387a95d7218fc515'
const SKL_ADDRESS = '0xe0595a049d02b7674572b0d59cd4880db60edc50'
const WBTC_ADDRESS = '0xcb011e86df014a46f4e3ac3f3cbb114a4eb80870'

module.exports = {
  network: 'mainnet',
  blocks: {
    address: '0x1aaf6eb4f85f8775400c1b10e6bbbd98b2ff8483',
    startBlock: 5124080,
  },
  legacy: {
    native: {
      address: NATIVE_ADDRESS,
    },
    whitelistedTokenAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
      DAI_ADDRESS,
      USDC_ADDRESS,
      USDP_ADDRESS,
      USDT_ADDRESS,
      SKL_ADDRESS,
      WBTC_ADDRESS
    ],
    stableTokenAddresses: [
      USDC_ADDRESS,
      USDP_ADDRESS,
      USDT_ADDRESS,
      DAI_ADDRESS
    ],
    minimumNativeLiquidity: 0.5,
    factory: {
      address: '0x1aaf6eb4f85f8775400c1b10e6bbbd98b2ff8483',
      initCodeHash: '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
      startBlock: 5124080,
    },
  },
  v2: {
    nativeAddress: NATIVE_ADDRESS,
    whitelistAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
      DAI_ADDRESS,
      USDC_ADDRESS,
      USDP_ADDRESS,
      USDT_ADDRESS,
      SKL_ADDRESS,
      WBTC_ADDRESS
    ],
    stable0: USDC_ADDRESS,
    stable1: USDT_ADDRESS,
    stable2: DAI_ADDRESS,
    minimumNativeLiquidity: 0.5,
    factory: {
      address: '0x1aaf6eb4f85f8775400c1b10e6bbbd98b2ff8483',
      initCodeHash: '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
      startBlock: 5124080,
    }
  },
  v3: {
    factory: {
      address: '0x51d15889b66a2c919dbbd624d53b47a9e8fec4bb',
      startBlock: 5124251,
    },
    positionManager: {
      address: '0xa4d2268f145cd5c835115441b877295c46f25b9b',
      startBlock: 5124298,
    },
    native: { address: NATIVE_ADDRESS },
    whitelistedTokenAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
      DAI_ADDRESS,
      USDC_ADDRESS,
      USDP_ADDRESS,
      USDT_ADDRESS,
      SKL_ADDRESS,
      WBTC_ADDRESS
    ],
    stableTokenAddresses: [
      USDC_ADDRESS,
      USDP_ADDRESS,
      USDT_ADDRESS,
      DAI_ADDRESS
    ],
    nativePricePool: '0x5e359b616eab96977473ba7b7de7107abe5b345b', // USDC/ETH - 0.03%
    minimumEthLocked: 0.5,
  },
}
