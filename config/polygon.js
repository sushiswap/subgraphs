const NATIVE_ADDRESS = '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270'
const SUSHI_ADDRESS = '0x0b3f868e0be5597d5db7feb59e1cadbb0fdda50a'
const WETH_ADDRESS = '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619'
const WBTC_ADDRESS = '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6'
const USDC_ADDRESS = '0x2791bca1f2de4661ed88a30c99a7a9449aa84174'
const USDT_ADDRESS = '0xc2132d05d31c914a87c6611c10748aeb04b58e8f'
const DAI_ADDRESS = '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063'
const AAVE_ADDRESS = '0xd6df932a45c0f255f85145f286ea0b292b21c90b'
const FRAX_ADDRESS = '0x45c32fa6df82ead1e2ef74d17b76547eddfaff89'
const BCT_ADDRESS = '0x2f800db0fdb5223b3c3f354886d907a671414a7f'
const AURUM_ADDRESS = '0x34d4ab47bee066f361fa52d792e69ac7bd05ee23'
const MSU_ADDRESS = '0xe8377a076adabb3f9838afb77bee96eac101ffb1'
const DMAGIC_ADDRESS = '0x61daecab65ee2a1d5b6032df030f3faa3d116aa7'
const NDEFI_ADDRESS = '0xd3f07ea86ddf7baebefd49731d7bbd207fedc53b'

module.exports = {
  network: 'matic',
  sushi: { address: SUSHI_ADDRESS },
  weth: { address: WETH_ADDRESS },
  wbtc: { address: WBTC_ADDRESS },
  bentobox: {
    address: '0x0319000133d3ada02600f0875d2cf03d442c3367',
    startBlock: 13952308,
  },
  masterDeployer: { address: '0x351447fc9bd20a917783e159e61e86edda0b0187', startBlock: 25840876 },
  concentratedLiquidityPoolFactory: { address: '0x0000000000000000000000000000000000000000' },
  constantProductPoolFactory: { 
    address: '0x05689fcfee31fce4a67fbc7cab13e74f80a4e288',
 },
  hybridPoolFactory: { address: '0x0000000000000000000000000000000000000000' },
  indexPoolFactory: { address: '0x0000000000000000000000000000000000000000' },

  trident: {
    native: { address: NATIVE_ADDRESS },
    // whitelistedTokenAddresses: [
    //   // WNATIVE - This is actually quite important, though uneeded here anymore since
    //   // it's now apart of the whitelisted token check in createPair, because the
    //   // base should always be whitelisted or pricing never begins.
    //   NATIVE_ADDRESS,
    //   // WETH
    //   WETH_ADDRESS,
    //   // WBTC
    //   WBTC_ADDRESS,
    //   // USDC
    //   USDC_ADDRESS,
    //   // USDT
    //   USDT_ADDRESS,
    //   // DAI
    //   DAI_ADDRESS,
    // ],
    stableTokenAddresses: [
      // USDC
      USDC_ADDRESS,
      // USDT
      USDT_ADDRESS,
      // DAI
      DAI_ADDRESS,
      // MIM
      // '0x49a0400587a7f65072c87c4910449fdcc5c47242',
      // FRAX
      // '0x45c32fa6df82ead1e2ef74d17b76547eddfaff89',
    ],
    // // List of STABLE/NATIVE pools to use to price NATIVE in USD
    stablePoolAddresses: [
      // USDC/MATIC/5/FALSE
      '0xd5ed08fdedd447a3172449e6d4e2e5265157e6a3',
      // USDC/WMATIC/30/TRUE
      '0x699e820323dd5e51b243003ef74ac812b7f280ed',
      // USDT/WMATIC/30/TRUE
      '0x25d8dfef6f432eb0f7db0b9f61fef352f08b1979',
      // DAI/WMATIC/30/TRUE
      '0x1bd908569c1157417abae2ed3de3cb04c734b984',
    ],
    minimumNativeLiquidity: 1000,
  },
  legacy: {
    native: { address: WETH_ADDRESS },
    whitelistedTokenAddresses: [
      // IMPORTANT! The native address must be included for pricing to start
      WETH_ADDRESS,
      USDC_ADDRESS,
      DAI_ADDRESS,
      USDT_ADDRESS,
      WBTC_ADDRESS,
      SUSHI_ADDRESS,
      AAVE_ADDRESS,
      FRAX_ADDRESS,
      BCT_ADDRESS,
      AURUM_ADDRESS,
      MSU_ADDRESS,
      DMAGIC_ADDRESS,
      NDEFI_ADDRESS,
    ],
    stableTokenAddresses: [USDC_ADDRESS, USDT_ADDRESS, DAI_ADDRESS, FRAX_ADDRESS],
    minimumNativeLiquidity: 3,
    minimum_usd_threshold_new_pairs: '3000',
    factory: {
      address: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
      initCodeHash: '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
      startBlock: 11333218,
    },
  },
  miso: {
    accessControls: { address: '0x6b2a3ff504798886862ca5ce501e080947a506a2', startBlock: 26075438 },
    market: { address: '0x3e603c14af37ebdad31709c4f848fc6ad5bec715', startBlock: 26075762 },
  },
  furo: {
    stream: { address: '0x4ab2fc6e258a0ca7175d05ff10c5cf798a672cae', startBlock: 29273010 },
    vesting: { address: '0x0689640d190b10765f09310fcfe9c670ede4e25b', startBlock: 29273856 },
  },
  auctionMaker: { address: '0x0000000000000000000000000000000000000000', startBlock: 0 },
  staking: { address: '0x0000000000000000000000000000000000000000', startBlock: 0 },
  blocks: {
    address: '0x0000000000000000000000000000000000000000',
    startBlock: 0,
  },
}
