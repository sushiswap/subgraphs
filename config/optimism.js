const NATIVE_ADDRESS = '0x4200000000000000000000000000000000000006'
const WBTC_ADDRESS = '0x68f180fcce6836688e9084f035309e29bf0a2095'
const USDC_ADDRESS = '0x7f5c764cbc14f9669b88837ca1490cca17c31607'
const USDT_ADDRESS = '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58'
const DAI_ADDRESS = '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1'

module.exports = {
  network: 'optimism',
  native: { address: NATIVE_ADDRESS },
  bentobox: {
    address: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
    base: 'QmYJh2tYmFv9yGxeyRHDTKKCFgyHAv7wgczpWojF5B4BqN',
    startBlock: 7019815,
  },
  masterDeployer: { address: '0x1b02da8cb0d097eb8d57a175b88c7d8b47997506', startBlock: 7019990 },
  concentratedLiquidityPoolFactory: { address: '0x0000000000000000000000000000000000000000' },
  constantProductPoolFactory: {
    address: '0x0769fd68dfb93167989c6f7254cd0d766fb2841f',
    initCodeHash: '0x953e4e8b8d75b1566b035158eb8f23be70b74bb4ff3eb020de19a926e0ebbd56',
  },
  hybridPoolFactory: { address: '0x0000000000000000000000000000000000000000' },
  indexPoolFactory: { address: '0x0000000000000000000000000000000000000000' },
  whitelistedTokenAddresses: [
    // WNATIVE - This is actually quite important, though uneeded here anymore since
    // it's now apart of the whitelisted token check in createPair, because the
    // base should always be whitelisted or pricing never begins.
    NATIVE_ADDRESS,
    // WBTC
    WBTC_ADDRESS,
    // USDC
    USDC_ADDRESS,
    // USDT
    USDT_ADDRESS,
    // DAI
    DAI_ADDRESS,
  ],
  stableTokenAddresses: [
    // USDC
    USDC_ADDRESS,
    // USDT
    USDT_ADDRESS,
    // DAI
    DAI_ADDRESS,
  ],
  // List of STABLE/NATIVE pools to use to price NATIVE in USD
  stablePoolAddresses: [
    // USDC/WETH/30/FALSE
    '0xf74c68E33281e911415EEb9A032c4EF5197BB3F0',
    // DAI/WETH/30/FALSE
    '0xf1f284621a698d900cec56f5a9c2a14fd8119609',
  ],
  minimumNativeLiquidity: '0.01',

  furo: {
    stream: { address: '0x0000000000000000000000000000000000000000', startBlock: 0 },
    vesting: { address: '0x0000000000000000000000000000000000000000', startBlock: 0 },
  },
  auctionMaker: { address: '0x0000000000000000000000000000000000000000', startBlock: 0 },
  staking: { address: '0x0000000000000000000000000000000000000000', startBlock: 0 },
  blocks: {
    address: '0x0000000000000000000000000000000000000000',
    startBlock: 0,
  },
}
