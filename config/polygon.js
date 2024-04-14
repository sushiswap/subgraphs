const NATIVE_ADDRESS = '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270'
const SUSHI_ADDRESS = '0x0b3f868e0be5597d5db7feb59e1cadbb0fdda50a'
const WETH_ADDRESS = '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619'
const WBTC_ADDRESS = '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6'
const USDC_ADDRESS = '0x2791bca1f2de4661ed88a30c99a7a9449aa84174'
const USDC_CIRCLE_ADDRESS = '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359'
const USDT_ADDRESS = '0xc2132d05d31c914a87c6611c10748aeb04b58e8f'
const DAI_ADDRESS = '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063'
const AAVE_ADDRESS = '0xd6df932a45c0f255f85145f286ea0b292b21c90b'
const FRAX_ADDRESS = '0x45c32fa6df82ead1e2ef74d17b76547eddfaff89'
const BCT_ADDRESS = '0x2f800db0fdb5223b3c3f354886d907a671414a7f'
const AURUM_ADDRESS = '0x34d4ab47bee066f361fa52d792e69ac7bd05ee23'
const MSU_ADDRESS = '0xe8377a076adabb3f9838afb77bee96eac101ffb1'
const DMAGIC_ADDRESS = '0x61daecab65ee2a1d5b6032df030f3faa3d116aa7'
const NDEFI_ADDRESS = '0xd3f07ea86ddf7baebefd49731d7bbd207fedc53b'
const USDPLUS_ADDRESS = '0x236eec6359fb44cce8f97e99387aa7f8cd5cde1f'
const BOB_ADDRESS = '0xb0b195aefa3650a6908f15cdac7d92f8a5791b0b'
const NPM_ADDRESS = '0x57f12fe6a4e5fe819eec699fadf9db2d06606bb4'

module.exports = {
  network: 'matic',
  sushi: { address: SUSHI_ADDRESS },
  weth: { address: WETH_ADDRESS },
  wbtc: { address: WBTC_ADDRESS },
  minichef: {
    address: '0x0769fd68dfb93167989c6f7254cd0d766fb2841f',
    startBlock: 13911377,
    rewarder: {
      complex: {
        address: '0xa3378ca78633b3b9b2255eaa26748770211163ae',
        rewardToken: { address: NATIVE_ADDRESS }
      }
    },
  },
  bentobox: {
    address: '0x0319000133d3ada02600f0875d2cf03d442c3367',
    startBlock: 13952308,
  },
  kashi: {
    mediumRiskMasterContractAddresses: ['0xb527c5295c4bc348cbb3a2e96b2494fd292075a7'],
  },
  trident: {
    masterDeployer: { address: '0x2f28678432edF5243955054cC04a32B18ca63c97', startBlock: 34188953 },
    concentratedLiquidityPoolFactory: { address: '0x0000000000000000000000000000000000000000' },
    constantProductPoolFactory: {
      address: '0x28890e3C0aA9B4b48b1a716f46C9abc9B12abfab',
      initCodeHash: '0x3172d82413be467c1130709f7479a07def9b99caf8e0059f248c131081e4ea09',
    },
    stablePoolFactory: { address: '0x2A0Caa28331bC6a18FF195f06694f90671dE70f2' },
    hybridPoolFactory: { address: '0x0000000000000000000000000000000000000000' },
    indexPoolFactory: { address: '0x0000000000000000000000000000000000000000' },
    native: { address: NATIVE_ADDRESS },
    whitelistedTokenAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
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
      USDPLUS_ADDRESS,
      BOB_ADDRESS,
      USDC_CIRCLE_ADDRESS,
      NPM_ADDRESS
    ],
    stableTokenAddresses: [
      // USDC
      USDC_ADDRESS,
      // USDT
      USDT_ADDRESS,
      // DAI
      DAI_ADDRESS,
      USDC_CIRCLE_ADDRESS,
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
    tokensToPriceOffNative: [
      // These tokens will be priced off the NATIVE token
      USDC_ADDRESS
    ],
    minimumNativeLiquidity: 500, // Threshold for being considered for pricing
  },
  legacy: {
    native: { address: WETH_ADDRESS },
    whitelistedTokenAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
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
      NPM_ADDRESS,
      USDC_CIRCLE_ADDRESS,
    ],
    stableTokenAddresses: [USDC_ADDRESS, USDT_ADDRESS, DAI_ADDRESS, FRAX_ADDRESS, USDC_CIRCLE_ADDRESS],
    minimumNativeLiquidity: 3,
    factory: {
      address: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
      initCodeHash: '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
      startBlock: 11333218,
    },
  },
  v2: {
    nativeAddress: NATIVE_ADDRESS,
    whitelistAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
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
      NPM_ADDRESS,
      USDC_CIRCLE_ADDRESS
    ],
    // ALWAYS PRE-GENEARTE THESE WITH create2 keccak256
    usdcPair: "0x0000000000000000000000000000000000000000",
    usdtPair: "0x0000000000000000000000000000000000000000",
    daiPair: "0x0000000000000000000000000000000000000000",
    minimumNativeLiquidity: 1000,
    factory: {
      address: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
      startBlock: 11333218,
    }
  },
  v3: {
    factory: {
      address: '0x917933899c6a5f8e37f31e19f92cdbff7e8ff0e2',
      startBlock: 41024971,
    },
    positionManager: {
      address: '0xb7402ee99f0a008e461098ac3a27f4957df89a40',
      startBlock: 41046124,
    },
    native: { address: NATIVE_ADDRESS },
    whitelistedTokenAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
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
      NPM_ADDRESS,
      USDC_CIRCLE_ADDRESS,
    ],
    stableTokenAddresses: [USDC_ADDRESS, USDT_ADDRESS, DAI_ADDRESS, FRAX_ADDRESS, USDC_CIRCLE_ADDRESS],
    nativePricePool: '0x21988c9cfd08db3b5793c2c6782271dc94749251',
    minimumEthLocked: 1000,
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
  xswap: {
    address: '0xd08b5f3e89f1e2d6b067e0a0cbdb094e6e41e77c',
    startBlock: 30981164,
  },
  stargate: {
    usdcPool: { address: '0x1205f31718499dbf1fca446663b532ef87481fe1', startBlock: 16135136 },
    usdtPool: { address: '0x29e38769f23701a2e4a8ef0492e19da4604be62c', startBlock: 16135132 },
  }
}
