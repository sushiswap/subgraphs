const NATIVE_ADDRESS = '0xee7d8bcfb72bc1880d0cf19822eb0a2e6577ab62'
const vbUSDC_ADDRESS = '0x203a662b0bd271a6ed5a60edfbd04bfce608fd36'
const vbUSDT_ADDRESS = '0x2dca96907fde857dd3d816880a0df407eeb2d2f2'
const vbUSDS_ADDRESS = '0x62d6a123e8d19d06d68cf0d2294f9a3a0362c6b3'
const vbWBTC_ADDRESS = '0x0913da6da4b42f538b445599b46bb4622342cf52'
const KAT_ADDRESS = '0x7f1f4b4b29f5058fa32cc7a97141b8d7e5abdc2d'
const AUSD_ADDRESS = '0x00000000efe302beaa2b3e6e1b18d08d69a9012a'
const bvUSD_ADDRESS = '0x876aac7648d79f87245e73316eb2d100e75f3df1'
const sbvUSD_ADDRESS = '0x24e2ae2f4c59b8b7a03772142d439fdf13aaf15b'
const weETH_ADDRESS = '0x9893989433e7a383cb313953e4c2365107dc19a7'
const jitoSOL_ADDRESS = '0x6c16e26013f2431e8b2e1ba7067ecccad0db6c52'
const uSOL_ADDRESS = '0x9b8df6e244526ab5f6e6400d331db28c8fdddb55'
const MORPHO_ADDRESS = '0x1e5efca3d0db2c6d5c67a4491845c43253eb9e4e'
const POL_ADDRESS = '0xb24e3035d1fcbc0e43cf3143c3fd92e53df2009b'
const SUSHI_ADDRESS = '0x17bff452dae47e07cea877ff0e1aba17eb62b0ab'
const YFI_ADDRESS = '0x476eacd417cd65421bd34fca054377658bb5e02b'
const LBTC_ADDRESS = '0xecac9c5f704e954931349da37f60e39f515c11c1'
const BTCK_ADDRESS = '0xb0f70c0bd6fd87dbeb7c10dc692a2a6106817072'
const wstETH_ADDRESS = '0x7fb4d0f51544f24f385a421db6e7d4fc71ad8e5c'
const unKAT_ADDRESS  = '0xfa8df5ecbc41ced29aa417852d40dab9a855107d'

module.exports = {
  network: 'katana',
  retainBlocks: 725760,
  blocks: {
    address: '0x72d111b4d6f31b38919ae39779f570b747d6acd9',
    startBlock: 0,
  },
  v2: {
    nativeAddress: NATIVE_ADDRESS,
    whitelistAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
      vbUSDC_ADDRESS,
      vbUSDT_ADDRESS,
      vbUSDS_ADDRESS,
      vbWBTC_ADDRESS,
      KAT_ADDRESS,
      AUSD_ADDRESS,
      bvUSD_ADDRESS,
      sbvUSD_ADDRESS,
      weETH_ADDRESS,
      jitoSOL_ADDRESS,
      uSOL_ADDRESS,
      MORPHO_ADDRESS,
      POL_ADDRESS,
      SUSHI_ADDRESS,
      YFI_ADDRESS,
      LBTC_ADDRESS,
      BTCK_ADDRESS,
      wstETH_ADDRESS,
      unKAT_ADDRESS
    ],
    stable0: vbUSDC_ADDRESS,
    stable1: vbUSDT_ADDRESS,
    stable2: AUSD_ADDRESS,
    minimumNativeLiquidity: 0.5,
    factory: {
      address: '0x72d111b4d6f31b38919ae39779f570b747d6acd9',
      initCodeHash: '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
      startBlock: 1857623,
    }
  },
  v3: {
    factory: {
      address: '0x203e8740894c8955cb8950759876d7e7e45e04c1',
      startBlock: 1858972,
    },
    positionManager: {
      address: '0x2659c6085d26144117d904c46b48b6d180393d27',
      startBlock: 1860127,
    },
    native: { address: NATIVE_ADDRESS },
    whitelistedTokenAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
      vbUSDC_ADDRESS,
      vbUSDT_ADDRESS,
      vbUSDS_ADDRESS,
      vbWBTC_ADDRESS,
      KAT_ADDRESS,
      AUSD_ADDRESS,
      bvUSD_ADDRESS,
      sbvUSD_ADDRESS,
      weETH_ADDRESS,
      jitoSOL_ADDRESS,
      uSOL_ADDRESS,
      MORPHO_ADDRESS,
      POL_ADDRESS,
      SUSHI_ADDRESS,
      YFI_ADDRESS,
      LBTC_ADDRESS,
      BTCK_ADDRESS,
      wstETH_ADDRESS,
      unKAT_ADDRESS
    ],
    stableTokenAddresses: [
      vbUSDC_ADDRESS,
      vbUSDT_ADDRESS,
      vbUSDS_ADDRESS,
      AUSD_ADDRESS,
      bvUSD_ADDRESS
    ],
    nativePricePool: '0x105f833d8522f33d8dc3e9599455e9412b63d049', // WETH/USDC - 0.03%
    minimumEthLocked: 0.5,
  },
}
