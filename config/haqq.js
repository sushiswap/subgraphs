const NATIVE_ADDRESS = '0xec8cc083787c6e5218d86f9ff5f28d4cc377ac54'
const USDC_ADDRESS = '0x80b5a32e4f032b2a058b4f29ec95eefeeb87adcd'
const USDT_ADDRESS = '0xd567b3d7b8fe3c79a1ad8da978812cfc4fa05e75'
const DAI_ADDRESS = '0xc5e00d3b04563950941f7137b5afa3a534f0d6d6'
const WETH_ADDRESS = '0xeceeefcee421d8062ef8d6b4d814efe4dc898265'
const WBTC_ADDRESS = '0x5fd55a1b9fc24967c4db09c513c3ba0dfa7ff687'

module.exports = {
  network: 'haqq',
  blocks: {
    address: '0x70FA2C2634a577D07A8BD4Ce11f33C6861465E3C',
    startBlock: 7000000,
  },
  v3: {
    factory: {
      address: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
      startBlock: 6541826,
    },
    positionManager: {
      address: '0x80C7DD17B01855a6D2347444a0FCC36136a314de',
      startBlock: 6587027,
    },
    native: { address: NATIVE_ADDRESS },
    whitelistedTokenAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
      DAI_ADDRESS,
      USDC_ADDRESS,
      WETH_ADDRESS,
      WBTC_ADDRESS,
      USDT_ADDRESS,
    ],
    stableTokenAddresses: [DAI_ADDRESS, USDC_ADDRESS, USDT_ADDRESS],
    nativePricePool: '0x6766f7852b63187a2054eda1fa60cc0b2e2ee930', // WISLM/USDC
    minimumEthLocked: 3500,
  },
}
