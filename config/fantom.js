const NATIVE_ADDRESS = '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83'
const WETH_ADDRESS = '0x74b23882a30290451a17c44f4f05243b6b58c76d'
const FUSD_ADDRESS = '0xad84341756bf337f5a0164515b1f6f993d194e1f'
const DAI_ADDRESS = '0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e'
const USDC_ADDRESS = '0x04068da6c83afcfa0e13ba15a6696662335d5b75'
const SUSHI_ADDRESS = '0xae75a438b2e0cb8bb01ec1e1e376de11d44477cc'
const fUSDT_ADDRESS = '0x049d68029688eabf473097a2fc38ef61633a3c7a'
const BOO_ADDRESS = '0x841fad6eae12c286d1fd18d1d525dffa75c7effe'
const axlUSDC_ADDRESS = '0x1b6382dbdea11d97f24495c9a90b7c88469134a4'

module.exports = {
  network: 'fantom',
  retainBlocks: 1192800,
  sushi: { address: SUSHI_ADDRESS },
  bentobox: {
    address: '0xf5bce5077908a1b7370b9ae04adc565ebd643966',
    startBlock: 2918231,
  },
  v2: {
    base: 'QmVNMMgTVAJ5f3GSAASS5eYsGrcudmsCrXJyF9j5v9d5eC',
    startBlock: 106936534,
    nativeAddress: NATIVE_ADDRESS,
    whitelistAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
      WETH_ADDRESS,
      FUSD_ADDRESS,
      DAI_ADDRESS,
      USDC_ADDRESS,
      fUSDT_ADDRESS,
      BOO_ADDRESS,
      axlUSDC_ADDRESS,
      SUSHI_ADDRESS
    ],
    stable0: USDC_ADDRESS,
    stable1: DAI_ADDRESS,
    stable2: FUSD_ADDRESS,
    minimumNativeLiquidity: 4000,
    factory: {
      address: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
      initCodeHash: '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
      startBlock: 2457879,
    }
  },
  v3: {
    base: 'QmQXFxg4dCxMqcobGQAtsNe4ufnG1KmjSVgtEdtxvYo4Lf',
    startBlock: 106936534,
    factory: {
      address: '0x7770978eed668a3ba661d51a773d3a992fc9ddcb',
      startBlock: 58860670,
    },
    positionManager: {
      address: '0x10c19390e1ac2fd6d0c3643a2320b0aba38e5baa',
      startBlock: 58896145,
    },
    native: { address: NATIVE_ADDRESS },
    whitelistedTokenAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
      WETH_ADDRESS,
      FUSD_ADDRESS,
      DAI_ADDRESS,
      USDC_ADDRESS,
    ],
    stableTokenAddresses: [FUSD_ADDRESS, DAI_ADDRESS, USDC_ADDRESS],
    nativePricePool: '0x37216637e92ff3fd1aece7f39eb8d71fc2545b9b',
    minimumEthLocked: 2000
  },
  furo: {
    stream: { address: '0x4ab2fc6e258a0ca7175d05ff10c5cf798a672cae', startBlock: 39984551 },
    vesting: { address: '0x0689640d190b10765f09310fcfe9c670ede4e25b', startBlock: 39984585 },
  },
  blocks: {
    address: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
    startBlock: 0,
  },
  routeprocessor: {
    address: '0x46b3fdf7b5cde91ac049936bf0bdb12c5d22202e',
    startBlock: 76275028,
  }
}
