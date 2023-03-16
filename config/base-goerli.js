const NATIVE_ADDRESS = '0x4200000000000000000000000000000000000006'
const USDC_ADDRESS = '0x5cdeaa74e9ccc9d5eeab8166eb955505634d2a4e'

module.exports = {
  network: 'base-testnet',
  bentobox: {
    address: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',    
    startBlock: 1853555,
  },
  trident: {
    masterDeployer: { address: '0x1b02da8cb0d097eb8d57a175b88c7d8b47997506', startBlock: 1853574 },
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
    address: '0x1b02da8cb0d097eb8d57a175b88c7d8b47997506',
    startBlock: 1853574,
  },
}
