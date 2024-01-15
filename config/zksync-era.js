const NATIVE_ADDRESS = '0x5aea5775959fbc2557cc8789bc1bf90a239d9a91'
const USDC_ADDRESS = '0x3355df6d4c9c3035724fd0e3914de96a5a83aaf4'
const WBTC_ADDRESS = '0xbbeb516fb02a01611cbbe0453fe3c580d7281011'

module.exports = {
  network: 'zksync-era',
  blocks: {
    address: '0x0bb5111beb91cc1206386e416fc17bbf8838aaf3',
    startBlock: 10339835,
  },
  v3: {
    factory: {
      address: '0x0bb5111beb91cc1206386e416fc17bbf8838aaf3',
      startBlock: 10339835,
    },
    positionManager: {
      address: '0x9e248c543f0b19d34c0b3f5e733715db235b9ff3',
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
