const NATIVE_ADDRESS = '0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91'
const USDC_ADDRESS = '0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4'
const WBTC_ADDRESS = '0xBBeB516fb02a01611cBBE0453Fe3c580D7281011'

module.exports = {
  network: 'zksync-era',
  blocks: {
    address: '0x0bB5111bEB91cC1206386e416FC17BBF8838Aaf3',
    startBlock: 10339835,
  },
  v3: {
    factory: {
      address: '0x0bB5111bEB91cC1206386e416FC17BBF8838Aaf3',
      startBlock: 10339835,
    },
    positionManager: {
      address: '0x9E248c543f0B19D34C0B3f5e733715dB235b9fF3',
      startBlock: 10342968,
    },
    native: { address: NATIVE_ADDRESS },
    whitelistedTokenAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
      WBTC_ADDRESS,
      USDC_ADDRESS,
    ],
    stableTokenAddresses: [USDC_ADDRESS],
    nativePricePool: '0x4f98226ff839feff281fa6741fc2ef4f6ff22468', // WETH/USDC
    minimumEthLocked: 1,
  },
}
