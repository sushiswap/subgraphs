const NATIVE_ADDRESS = '0x4200000000000000000000000000000000000006'
const WBTC_ADDRESS = '0x68f180fcce6836688e9084f035309e29bf0a2095'
const USDC_ADDRESS = '0x7f5c764cbc14f9669b88837ca1490cca17c31607'
const USDT_ADDRESS = '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58'
const DAI_ADDRESS = '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1'

module.exports = {
  network: 'optimism',
  bentobox: {
    address: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
    base: 'QmYJh2tYmFv9yGxeyRHDTKKCFgyHAv7wgczpWojF5B4BqN',
    startBlock: 7019815,
  },
  trident: {
    masterDeployer: { address: '0xcaabdd9cf4b61813d4a52f980d6bc1b713fe66f5', startBlock: 7464195 },
    concentratedLiquidityPoolFactory: { address: '0x0000000000000000000000000000000000000000' },
    constantProductPoolFactory: {
      address: '0x93395129bd3fcf49d95730d3c2737c17990ff328',
      initCodeHash: '0x3172d82413be467c1130709f7479a07def9b99caf8e0059f248c131081e4ea09',
    },
    hybridPoolFactory: { address: '0x0000000000000000000000000000000000000000' },
    indexPoolFactory: { address: '0x0000000000000000000000000000000000000000' },
    native: { address: NATIVE_ADDRESS },
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
      '0x1e31a2c6e6614273d740358affb46bef180efb7b',
    ],
    minimumNativeLiquidity: '0.01',
    minimum_usd_threshold_new_pairs: '3000',
  },

  furo: {
    stream: { address: '0x4ab2fc6e258a0ca7175d05ff10c5cf798a672cae', startBlock: 10835062 },
    vesting: { address: '0x0689640d190b10765f09310fcfe9c670ede4e25b', startBlock: 10835089 },
  },
  auctionMaker: { address: '0x0000000000000000000000000000000000000000', startBlock: 0 },
  staking: { address: '0x0000000000000000000000000000000000000000', startBlock: 0 },
  blocks: {
    address: '0x0000000000000000000000000000000000000000',
    startBlock: 0,
  },
}
