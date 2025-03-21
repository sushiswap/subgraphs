const NATIVE_ADDRESS = '0xe91d153e0b41518a2ce8dd3d7944fa863463a97d'
const SUSHI_ADDRESS = '0x2995d1317dcd4f0ab89f4ae60f3f020a4f17c7ce'
const WETH_ADDRESS = '0x6a023ccd1ff6f2045c3309768ead9e68f978f6e1'
const WBTC_ADDRESS = '0x8e5bbbb09ed1ebde8674cda39a0c169401db4252'
const USDC_ADDRESS = '0xddafbb505ad214d7b80b1f830fccc89b60fb7a83'
const USDT_ADDRESS = '0x4ecaba5870353805a9f068101a40e0f32ed605c6'
const BAO_ADDRESS = '0x82dfe19164729949fd66da1a37bc70dd6c4746ce'
const WETH2_ADDRESS = '0x6a023ccd1ff6f2045c3309768ead9e68f978f6e1'
const DAI_ADDRESS = '0x44fa8e6f47987339850636f88629646662444217'
const USDP_ADDRESS = '0xfe7ed09c4956f7cdb54ec4ffcb9818db2d7025b8'
const GNO_ADDRESS = '0x9c58bacc331c9aa871afd802db6379a98e80cedb'

module.exports = {
  network: 'gnosis',
  retainBlocks: 290640,
  sushi: { address: SUSHI_ADDRESS },
  bentobox: {
    address: '0xe2d7f5dd869fc7c126d21b13a9080e75a4bdb324',
    startBlock: 17002491,
  },
  v2: {
    base: 'QmUwneRXVUqTsPEZqScQytg257Rij3nSApe4pdDAtuG4s4',
    startBlock: 39149647,
    nativeAddress: NATIVE_ADDRESS,
    whitelistAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
      WETH_ADDRESS,
      WBTC_ADDRESS,
      USDC_ADDRESS,
      USDT_ADDRESS,
      BAO_ADDRESS,
      WETH2_ADDRESS,
      DAI_ADDRESS,
      USDP_ADDRESS,
      GNO_ADDRESS
    ],
    stable0: USDC_ADDRESS,
    stable1: USDT_ADDRESS,
    stable2: DAI_ADDRESS,
    minimumNativeLiquidity: 1250,
    factory: {
      address: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
      initCodeHash: '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
      startBlock: 14735904,
    }
  },
  v3: {
    base: 'QmS9uxga2rzpWyHKFATGYas6ntdHLpX7w45EKAatBTZJ25',
    startBlock: 39149647,
    factory: {
      address: '0xf78031cbca409f2fb6876bdfdbc1b2df24cf9bef',
      startBlock: 27232871,
    },
    positionManager: {
      address: '0xab235da7f52d35fb4551afba11bfb56e18774a65',
      startBlock: 27241490,
    },
    native: { address: NATIVE_ADDRESS },
    whitelistedTokenAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
      WETH_ADDRESS,
      WBTC_ADDRESS,
      USDC_ADDRESS,
      USDT_ADDRESS,
      BAO_ADDRESS,
      WETH2_ADDRESS,
      DAI_ADDRESS,
      USDP_ADDRESS,
    ],
    stableTokenAddresses: [USDC_ADDRESS, USDT_ADDRESS, DAI_ADDRESS, USDP_ADDRESS],
    nativePricePool: '0xf5e270c0d97f88efb023a161b9fcc5d0c7ad0b70',
    minimumEthLocked: 1000
  },
  furo: {
    stream: { address: '0x4ab2fc6e258a0ca7175d05ff10c5cf798a672cae', startBlock: 22535727 },
    vesting: { address: '0x0689640d190b10765f09310fcfe9c670ede4e25b', startBlock: 22535744 },
  },
  blocks: {
    address: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
    startBlock: 0,
  },
  routeprocessor: {
    address: '0x46b3fdf7b5cde91ac049936bf0bdb12c5d22202e',
    startBlock: 32627085,
  }
}
