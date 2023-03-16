const NATIVE_ADDRESS = '0x2c1b868d6596a18e32e61b901e4060c872647b6c'
const USDC_ADDRESS = '0x964ff70695da981027c81020b1c58d833d49a640'

module.exports = {
  network: 'mainnet',
  bentobox: {
    address: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',    
    startBlock: 265498,
  },
  trident: {
    masterDeployer: { address: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506', startBlock: 265502 },
    concentratedLiquidityPoolFactory: { address: '0x0000000000000000000000000000000000000000' },
    constantProductPoolFactory: {
      address: '0x0769fd68dfb93167989c6f7254cd0d766fb2841f',
      initCodeHash: '0x3172d82413be467c1130709f7479a07def9b99caf8e0059f248c131081e4ea09',
    },
    stablePoolFactory: { address: '0xf4d73326c13a4fc5fd7a064217e12780e9bd62c3' },
    hybridPoolFactory: { address: '0x0000000000000000000000000000000000000000' },
    indexPoolFactory: { address: '0x0000000000000000000000000000000000000000' },
    native: { address: NATIVE_ADDRESS },
    whitelistedTokenAddresses: [
      // WNATIVE - This is actually quite important, though uneeded here anymore since
      // it's now apart of the whitelisted token check in createPair, because the
      // base should always be whitelisted or pricing never begins.
      NATIVE_ADDRESS,
      USDC_ADDRESS,
    ],
    stableTokenAddresses: [
      // USDC
      USDC_ADDRESS,
    ],
    tokensToPriceOffNative: [
      // These tokens will be priced off the NATIVE token
      USDC_ADDRESS
    ],
    minimumNativeLiquidity: '0.01', // Threshold for being considered for pricing
  },
  blocks: {
    address: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
    startBlock: 265498,
  },
}
