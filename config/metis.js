const NATIVE_ADDRESS = '0x75cb093e4d61d2a2e65d8e0bbb01de8d89b53481'
const USDC_ADDRESS = '0xea32a96608495e54156ae48931a7c20f0dcc1a21'
const USDT_ADDRESS = '0xbb06dca3ae6887fabf931640f67cab3e3a16f4dc'
const DAI_ADDRESS = '0x4c078361fc9bbb78df910800a991c7c3dd2f6ce0'
const WETH_ADDRESS = '0x420000000000000000000000000000000000000A'
const SUSHI_ADDRESS = '0x17ee7e4da37b01fc1bcc908fa63df343f23b4b7c'

module.exports = {
  network: 'andromeda',
  sushi: { address: SUSHI_ADDRESS },
  minichef: {
    address: '0x1334c8e873e1cae8467156e2a81d1c8b566b2da1',
    startBlock: 3118733,
    native: {
      address: NATIVE_ADDRESS,
    },
    rewarder: {
      complex: { address: '0xe2d7460457f55e4786c69d2d3fa81978bf8dd11c' }
    },
  },
  auctionMaker: { address: '0x0000000000000000000000000000000000000000', startBlock: 0 },
  bentobox: {
    address: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
    base: 'QmSTz1vJeN5LKJHv9xqTxpsqiLRgpH2YWN5dVhQDv6Pd95',
    startBlock: 3030672,
  },
  blocks: {
    address: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
    startBlock: 3030672,
  },
  trident: {
    bentobox: {
      base: 'QmaoDfL5Ro7bmoE7bcpB4adt6dyZLShqeWEtLi7rQiUFmG',
      startBlock: 3030678,
    },
    masterDeployer: { address: '0x1b02da8cb0d097eb8d57a175b88c7d8b47997506', startBlock: 3030678 },
    concentratedLiquidityPoolFactory: { address: '0x0000000000000000000000000000000000000000' },
    constantProductPoolFactory: {
      address: '0x0769fd68dfb93167989c6f7254cd0d766fb2841f',
      initCodeHash: '0x3172d82413be467c1130709f7479a07def9b99caf8e0059f248c131081e4ea09',
    },
    stablePoolFactory: { address: '0x2f686751b19a9d91cc3d57d90150Bc767f050066' },
    hybridPoolFactory: { address: '0x0000000000000000000000000000000000000000' },
    indexPoolFactory: { address: '0x0000000000000000000000000000000000000000' },
    native: { address: NATIVE_ADDRESS },
    whitelistedTokenAddresses: [
      // WNATIVE - This is actually quite important, though uneeded here anymore since
      // it's now apart of the whitelisted token check in createPair, because the
      // base should always be whitelisted or pricing never begins.
      NATIVE_ADDRESS,
      // WETH
      WETH_ADDRESS,
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
    tokensToPriceOffNative: [
      // These tokens will be priced off the NATIVE token
      USDC_ADDRESS
    ],
    minimumNativeLiquidity: '2', // Threshold for being considered for pricing
    
  },
  furo: {
    stream: { address: '0x0000000000000000000000000000000000000000', startBlock: 0 },
    vesting: { address: '0x0000000000000000000000000000000000000000', startBlock: 0 },
  },
  staking: { address: '0x0000000000000000000000000000000000000000', startBlock: 0 },
  xswap: {
    address: '0x0000000000000000000000000000000000000000',
    startBlock: 0,
  }
}
