const NATIVE_ADDRESS = '0xee7d8bcfb72bc1880d0cf19822eb0a2e6577ab62'
const vbUSDC_ADDRESS = '0x203a662b0bd271a6ed5a60edfbd04bfce608fd36'
const vbUSDT_ADDRESS = '0x2dca96907fde857dd3d816880a0df407eeb2d2f2'
const vbUSDS_ADDRESS = '0x62d6a123e8d19d06d68cf0d2294f9a3a0362c6b3'
const vbWBTC_ADDRESS = '0x0913da6da4b42f538b445599b46bb4622342cf52'

module.exports = {
  network: 'katana',
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
      vbWBTC_ADDRESS
    ],
    stable0: vbUSDC_ADDRESS,
    stable1: vbUSDT_ADDRESS,
    stable2: vbUSDS_ADDRESS,
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
      vbWBTC_ADDRESS
    ],
    stableTokenAddresses: [
      vbUSDC_ADDRESS,
      vbUSDT_ADDRESS,
      vbUSDS_ADDRESS,
    ],
    nativePricePool: '0x105f833d8522f33d8dc3e9599455e9412b63d049', // WETH/USDC - 0.03%
    minimumEthLocked: 0.5,
  },
}
