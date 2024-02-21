const NATIVE_ADDRESS = '0x413cefea29f2d07b8f2acfa69d92466b9535f717'
const TT_USDT_ADDRESS = '0x4f3c8e20942461e2c3bdd8311ac57b0c222f2b82'
const TT_WBTC_ADDRESS = '0x18fb0a62f207a2a082ca60aa78f47a1af4985190'
const TT_USDC_ADDRESS = '0x22e89898a04eaf43379beb70bf4e38b1faf8a31e'
const TT_ETH_ADDRESS = '0x6576bb918709906dcbfdceae4bb1e6df7c8a1077'
const TT_BUSD_ADDRESS = '0xbeb0131d95ac3f03fd15894d0ade5dbf7451d171'
const TT_BNB_ADDRESS = '0x8ef1a1e0671aa44852f4d87105ef482470bb3e69'
const GUESS_ADDRESS = '0xe15c1cbf2de3fd15864f48a66b9da07736daf578'
const ZIPPY_DICE_ADDRESS = '0xfcdea9f405bc6bd85c2e90c1debb9f3ca7a59d8f'
const BNB_ADDRESS = '0xf390830df829cf22c53c8840554b98eafc5dcbc2'
const SUSHI_ADDRESS = '0xabd380327fe66724ffda91a87c772fb8d00be488'
const BUSD_ADDRESS = '0xb12c13e66ade1f72f71834f2fc5082db8c091358'
const ETH_ADDRESS = '0xe6801928061cdbe32ac5ad0634427e140efd05f9'
const WBTC_ADDRESS = '0xd67de0e0a0fd7b15dc8348bb9be742f3c5850454'
const USDC_ADRESS = '0xdc42728b0ea910349ed3c6e1c9dc06b5fb591f98'
const USDT_ADDRESS = '0x0dcb0cb0120d355cde1ce56040be57add0185baa'

module.exports = {
  network: 'mainnet',
  blocks: {
    address: '0x2c66e58c123fe807ef9c36682257fa6bfb4afa52',
    startBlock: 130439811,
  },
  v3: {
    factory: {
      address: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
      startBlock: 132536332,
    },
    positionManager: {
      address: '0xf4d73326c13a4fc5fd7a064217e12780e9bd62c3',
      startBlock: 132536931,
    },
    native: { address: NATIVE_ADDRESS },
    whitelistedTokenAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
      TT_USDT_ADDRESS,
      TT_WBTC_ADDRESS,
      TT_USDC_ADDRESS,
      TT_ETH_ADDRESS,
      TT_BUSD_ADDRESS,
      TT_BNB_ADDRESS,
      GUESS_ADDRESS,
      ZIPPY_DICE_ADDRESS,
      BNB_ADDRESS,
      SUSHI_ADDRESS,
      BUSD_ADDRESS,
      ETH_ADDRESS,
      WBTC_ADDRESS,
      USDC_ADRESS,
      USDT_ADDRESS,
    ],
    stableTokenAddresses: [TT_USDT_ADDRESS, TT_USDC_ADDRESS, TT_BUSD_ADDRESS, BUSD_ADDRESS, USDC_ADRESS, USDT_ADDRESS],
    nativePricePool: '0x37cfcf5a4878bcd58b6a0cffb1746c26465625f4',
    minimumEthLocked: 300000
  },
  legacy: {
    native: { address: NATIVE_ADDRESS },
    whitelistedTokenAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
      TT_USDT_ADDRESS,
      TT_WBTC_ADDRESS,
      TT_USDC_ADDRESS,
      TT_ETH_ADDRESS,
      TT_BUSD_ADDRESS,
      TT_BNB_ADDRESS,
      GUESS_ADDRESS,
      ZIPPY_DICE_ADDRESS,
      BNB_ADDRESS,
      SUSHI_ADDRESS,
      BUSD_ADDRESS,
      ETH_ADDRESS,
      WBTC_ADDRESS,
      USDC_ADRESS,
      USDT_ADDRESS,
    ],
    stableTokenAddresses: [TT_USDT_ADDRESS, TT_USDC_ADDRESS, TT_BUSD_ADDRESS, BUSD_ADDRESS, USDC_ADRESS, USDT_ADDRESS],
    minimumNativeLiquidity: 300000,
    factory: {
      address: '0xb45e53277a7e0f1d35f2a77160e91e25507f1763',
      initCodeHash: '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
      startBlock: 145330791,
    },
  },
}
