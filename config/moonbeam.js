const NATIVE_ADDRESS = '0x30d2a9f5fdf90ace8c17952cbb4ee48a55d916a7'
const WGLMR_ADDRESS = '0xacc15dc74880c9944775448304b263d191c6077f'
const USDC_ADDRESS = '0x8f552a71efe5eefc207bf75485b356a0b3f01ec9'
const USDT_ADDRESS = '0x8e70cd5b4ff3f62659049e74b6649c6603a0e594'
const DAI_ADDRESS = '0xc234a67a4f840e61ade794be47de455361b52413'
const WBTC_ADDRESS = '0x1dc78acda13a8bc4408b207c9e48cdbc096d95e0'
const UST_ADDRESS = '0x085416975fe14c2a731a97ec38b9bf8135231f62'
const FRAX_ADDRESS = '0x322e86852e492a7ee17f28a78c663da38fb33bfb'

module.exports = {
  network: 'moonbeam',
  native: { address: '0xacc15dc74880c9944775448304b263d191c6077f' },
  sushi: { address: '0x2c78f1b70ccf63cdee49f9233e9faa99d43aa07e' },
  weth: { address: '0x30d2a9f5fdf90ace8c17952cbb4ee48a55d916a7' },
  wbtc: { address: '0x1dc78acda13a8bc4408b207c9e48cdbc096d95e0' },

  bentobox: {
    address: '0x80c7dd17b01855a6d2347444a0fcc36136a314de',
    startBlock: 504558,
  },
  miso: {
    accessControls: { address: '0xbbde1d67297329148fe1ed5e6b00114842728e65', startBlock: 629842 },
    market: { address: '0x18350b048ab366ed601ffdbc669110ecb36016f3', startBlock: 629994 },
  },
  legacy: {
    native: { address: NATIVE_ADDRESS },
    whitelistedTokenAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
      WGLMR_ADDRESS,
      USDC_ADDRESS,
      USDT_ADDRESS,
      DAI_ADDRESS,
      WBTC_ADDRESS,
      UST_ADDRESS,
      FRAX_ADDRESS,
    ],
    stableTokenAddresses: [USDC_ADDRESS, USDT_ADDRESS, DAI_ADDRESS, UST_ADDRESS, FRAX_ADDRESS],
    minimumNativeLiquidity: 5,
    factory: {
      address: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
      initCodeHash: '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
      startBlock: 503713,
    },
  },
  v2: {
    nativeAddress: WGLMR_ADDRESS,
    whitelistAddresses: [
      // IMPORTANT! Native should be included here
      WGLMR_ADDRESS,
      NATIVE_ADDRESS, // WETH, not changing the name here to avoid breaking legacy/trident config.
      USDC_ADDRESS,
      USDT_ADDRESS,
      DAI_ADDRESS,
      WBTC_ADDRESS,
      UST_ADDRESS,
      FRAX_ADDRESS,
    ],
    stable0: USDC_ADDRESS,
    stable1: USDT_ADDRESS,
    stable2: DAI_ADDRESS,
    minimumNativeLiquidity: 3000,
    factory: {
      address: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
      initCodeHash: '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
      startBlock: 503713,
    }
  },
  v3: {
    factory: {
      address: '0x2ecd58f51819e8f8ba08a650bea04fc0dea1d523',
      startBlock: 3264275,
    },
    positionManager: {
      address: '0x8f54301f315c56c112d492d9443047d4745dbe9e',
      startBlock: 3267951,
    },
    native: { address: WGLMR_ADDRESS },
    whitelistedTokenAddresses: [
      // IMPORTANT! Native should be included here
      WGLMR_ADDRESS,
      NATIVE_ADDRESS, // WETH, not changing the name here to avoid breaking legacy/trident config.
      USDC_ADDRESS,
      USDT_ADDRESS,
      DAI_ADDRESS,
      WBTC_ADDRESS,
      UST_ADDRESS,
      FRAX_ADDRESS,
    ],
    stableTokenAddresses: [USDC_ADDRESS, USDT_ADDRESS, DAI_ADDRESS, UST_ADDRESS, FRAX_ADDRESS],
    nativePricePool: '', // TODO: ADD POOL ADDRESS, lowercase it.
    minimumEthLocked: 3000 // GLMR
  },
  furo: {
    stream: { address: '0x4ab2fc6e258a0ca7175d05ff10c5cf798a672cae', startBlock: 1188323 },
    vesting: { address: '0x0689640d190b10765f09310fcfe9c670ede4e25b', startBlock: 1188335 },
  },
  auctionMaker: { address: '0x0000000000000000000000000000000000000000', startBlock: 0 },
  staking: { address: '0x0000000000000000000000000000000000000000', startBlock: 0 },
  blocks: {
    address: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
    startBlock: 0,
  },
  minimumNativeLiquidity: 0.1,
  xswap: {
    address: '0x0000000000000000000000000000000000000000',
    startBlock: 0,
  },
  routeprocessor: {
    address: '0xb45e53277a7e0f1d35f2a77160e91e25507f1763',
    startBlock: 5595506,
  }
}
