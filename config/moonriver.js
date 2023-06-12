const NATIVE_ADDRESS = '0xf50225a84382c74cbdea10b0c176f71fc3de0c4d'
const WETH_ADDRESS = '0x639a647fbe20b6c8ac19e48e2de44ea792c62c5c'
const USDC_ADDRESS = '0xe3f5a90f9cb311505cd691a46596599aa1a0ad7d'
const USDT_ADDRESS = '0xb44a9b6905af7c801311e8f4e76932ee959c663c'
const DAI_ADDRESS = '0x80a16016cc4a2e6a2caca8a4a498b1699ff0f844'
const WMOVR_ADDRESS = '0xf50225a84382c74cbdea10b0c176f71fc3de0c4d'
const WBTC_ADDRESS = '0xe6a991ffa8cfe62b0bf6bf72959a3d4f11b2e0f5'
const FRAX_ADDRESS = '0x1a93b23281cc1cde4c4741353f3064709a16197d'
const MIM_ADDRESS = '0x0cae51e1032e8461f4806e26332c030e34de3adb'
const SUSHI_ADDRESS = '0xf390830df829cf22c53c8840554b98eafc5dcbc2'

module.exports = {
  network: 'moonriver',
  sushi: { address: SUSHI_ADDRESS },
  minichef: {
    address: '0x3db01570d97631f69bbb0ba39796865456cf89a5',
    startBlock: 800950,
    rewarder: {
      complex: {
        address: '0x1334c8e873e1cae8467156e2a81d1c8b566b2da1',
        rewardToken: { address: NATIVE_ADDRESS }
      }
    },
  },
  bentobox: {
    address: '0x145d82bca93cca2ae057d1c6f26245d1b9522e6f',
    startBlock: 1610292,
  },
  miso: {
    accessControls: { address: '0x0769fd68dfb93167989c6f7254cd0d766fb2841f', startBlock: 1610232 },
    market: { address: '0x120140d0c1ebc938befc84840575ecdc5fe55afe', startBlock: 1610328 },
  },
  legacy: {
    native: { address: '0xf50225a84382c74cbdea10b0c176f71fc3de0c4d' },
    whitelistedTokenAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
      WETH_ADDRESS,
      USDC_ADDRESS,
      USDT_ADDRESS,
      DAI_ADDRESS,
      WMOVR_ADDRESS,
      WBTC_ADDRESS,
      FRAX_ADDRESS,
      MIM_ADDRESS,
    ],
    stableTokenAddresses: [USDC_ADDRESS, USDT_ADDRESS, DAI_ADDRESS, FRAX_ADDRESS],
    minimumNativeLiquidity: 3,
    factory: {
      address: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
      initCodeHash: '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
      startBlock: 428426,
    },
  },
  v3: {
    factory: {
      address: '0x2f255d3f3c0a3726c6c99e74566c4b18e36e3ce6',
      startBlock: 3945310,
    },
    positionManager: {
      address: '0xd045d27c1f7e7f770a807b0a85d8e3f852e0f2be',
      startBlock: 3949049,
    },
    native: { address: NATIVE_ADDRESS },
    whitelistedTokenAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
      WETH_ADDRESS,
      USDC_ADDRESS,
      USDT_ADDRESS,
      DAI_ADDRESS,
      WBTC_ADDRESS,
      FRAX_ADDRESS,
      MIM_ADDRESS,
    ],
    stableTokenAddresses: [USDC_ADDRESS, USDT_ADDRESS, DAI_ADDRESS, FRAX_ADDRESS],
    nativePricePool: '0x1f6568ffe1226ba293e6d7dab116b5825b2412c9',
    minimumEthLocked: 120 // WMOVR
  },
  blocks: {
    address: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
    startBlock: 428426,
  },
  furo: {
    stream: { address: '0x4ab2fc6e258a0ca7175d05ff10c5cf798a672cae', startBlock: 1976212 },
    vesting: { address: '0x0689640d190b10765f09310fcfe9c670ede4e25b', startBlock: 1976221 },
  },
  auctionMaker: { address: '0x0000000000000000000000000000000000000000', startBlock: 0 },
  staking: { address: '0x0000000000000000000000000000000000000000', startBlock: 0 },
  xswap: {
    address: '0x0000000000000000000000000000000000000000',
    startBlock: 0,
  },
  routeprocessor3: {
    address: "0x7af71799C40F952237eAA4D81A77C1af49125113",
    startBlock: 4150808,
  }
}
