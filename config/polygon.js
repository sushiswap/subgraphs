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
const THREE_ADDRESS = '0x9b034262e0095210ab9ddec60199741a8a1fbfe7'
const RENDER_ADDRESS = '0x61299774020da444af134c82fa83e3810b309991'
const GRAPH_ADDRESS = '0x5fe2b58c013d7601147dcdd68c143a77499f5531'
const BAL_ADDRESS = '0x9a71012b13ca4d3d0cdc72a177df3ef03b0e76a3'
const SNX_ADDRESS = '0x50b728d8d964fd00c2d0aad81718b71311fef68a'
const STG_ADDRESS = '0x2f6f07cdcf3588944bf4c42ac74ff24bf56e7590'
const UNI_ADDRESS = '0xb33eaad8d922b1083446dc23f610c2567fb5180f'
const LINK_ADDRESS = '0x53e0bca35ec356bd5dddfebbd1fc0fd03fabad39'
const GRT_ADDRESS = '0x5fe2b58c013d7601147dcdd68c143a77499f5531'
const TEL_ADDRESS = '0xdf7837de1f2fa4631d716cf2502f8b230f1dcc32'
const MANA_ADDRESS = '0xa1c57f48f0deb89f569dfbe6e2b7f46d33606fd4'
const GNS_ADDRESS = '0xe5417af564e4bfda1c483642db72007871397896'
const QUICK_ADDRESS = '0xb5c064f955d8e7f38fe0460c556a72987494ee17'
const AVAX_ADDRESS = '0x2c89bbc92bd86f8075d1decc58c7f4e0107f286b'
const OCEAN_ADDRESS = '0x282d8efce846a88b159800bd4130ad77443fa1a1'
module.exports = {
  network: 'matic',
  retainBlocks: 705600,
  sushi: { address: SUSHI_ADDRESS },
  weth: { address: WETH_ADDRESS },
  wbtc: { address: WBTC_ADDRESS },
  bentobox: {
    address: '0x0319000133d3ada02600f0875d2cf03d442c3367',
    startBlock: 13952308,
  },
  v2: {
    base: 'QmebwDJ8a8uGf5sW6inqVfJwDGgYrvCvif19wnQqHN8GzQ',
    startBlock: 69321624,
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
      USDC_CIRCLE_ADDRESS,
      THREE_ADDRESS,
      RENDER_ADDRESS,
      GRAPH_ADDRESS,
      BAL_ADDRESS,
      SNX_ADDRESS,
      STG_ADDRESS,
      UNI_ADDRESS,
      LINK_ADDRESS,
      GRT_ADDRESS,
      TEL_ADDRESS,
      MANA_ADDRESS,
      GNS_ADDRESS,
      QUICK_ADDRESS,
      AVAX_ADDRESS,
      OCEAN_ADDRESS,
    ],
    stable0: USDC_ADDRESS,
    stable1: USDT_ADDRESS,
    stable2: DAI_ADDRESS,
    minimumNativeLiquidity: 1000,
    factory: {
      address: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
      initCodeHash: '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
      startBlock: 11333218,
    }
  },
  v3: {
    base: 'QmfTAHYV86ymwV2Vm6kw9cNzTCmDhe9EWghQ3U3pD7jEGZ',
    startBlock: 69321624,
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
      THREE_ADDRESS,
      RENDER_ADDRESS,
      GRAPH_ADDRESS,
      BAL_ADDRESS,
      SNX_ADDRESS,
      STG_ADDRESS,
      UNI_ADDRESS,
      LINK_ADDRESS,
      GRT_ADDRESS,
      TEL_ADDRESS,
      MANA_ADDRESS,
      GNS_ADDRESS,
      QUICK_ADDRESS,
      AVAX_ADDRESS,
      OCEAN_ADDRESS,
    ],
    stableTokenAddresses: [USDC_ADDRESS, USDT_ADDRESS, DAI_ADDRESS, FRAX_ADDRESS, USDC_CIRCLE_ADDRESS],
    nativePricePool: '0x21988c9cfd08db3b5793c2c6782271dc94749251',
    minimumEthLocked: 1000,
  },
  furo: {
    stream: { address: '0x4ab2fc6e258a0ca7175d05ff10c5cf798a672cae', startBlock: 29273010 },
    vesting: { address: '0x0689640d190b10765f09310fcfe9c670ede4e25b', startBlock: 29273856 },
  },
  routeprocessor: {
    address: '0x46b3fdf7b5cde91ac049936bf0bdb12c5d22202e',
    startBlock: 53938104,
  }
}
