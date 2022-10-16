const NATIVE_ADDRESS = '0x23181f21dea5936e24163ffaba4ea3b316b57f3c'
const BUSD_ADDRESS = '0xde47772ac041a4ccf3c865632131d1093e51c02d'
const USDT_B_ADDRESS = '0x9b5f27f6ea9bbd753ce3793a07cba3c74644330d'
const USDT_T_ADDRESS = '0xdb28719f7f938507dbfe4f0eae55668903d34a15'
const WETH_ADDRESS = '0x1249c65afb11d179ffb3ce7d4eedd1d9b98ad006'

module.exports = {
  network: 'bttc',
  auctionMaker: { address: '0x0000000000000000000000000000000000000000', startBlock: 0 },
  bentobox: {
    address: '0x0000000000000000000000000000000000000000',
    base: 'QmSTz1vJeN5LKJHv9xqTxpsqiLRgpH2YWN5dVhQDv6Pd95',
    startBlock: 0,
  },
  blocks: {
    address: '0xb8c7aa0f2b3ddcc5340b5706d81eefaded74e5ac',
    startBlock: 12938709,
  },
  legacy: {
    native: { address: NATIVE_ADDRESS },
    whitelistedTokenAddresses: [
      // IMPORTANT! The native address must be included for pricing to start
      NATIVE_ADDRESS,
      BUSD_ADDRESS,
      USDT_B_ADDRESS,
      USDT_T_ADDRESS,
      WETH_ADDRESS,
    ],
    stableTokenAddresses: [BUSD_ADDRESS, USDT_B_ADDRESS, USDT_T_ADDRESS],
    minimumNativeLiquidity: 1000000000,
    minimum_usd_threshold_new_pairs: '3000',
    factory: {
      address: '0xb8c7aa0f2b3ddcc5340b5706d81eefaded74e5ac',
      initCodeHash: '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
      startBlock: 12938709,
    },
  },
  // trident: {
  //   bentobox: {
  //     base: '0x0000000000000000000000000000000000000000',
  //     startBlock: 3030678,
  //   },
  //   masterDeployer: { address: '0x0000000000000000000000000000000000000000', startBlock: 3030678 },
  //   concentratedLiquidityPoolFactory: { address: '0x0000000000000000000000000000000000000000' },
  //   constantProductPoolFactory: {
  //     address: '0x0769fd68dfb93167989c6f7254cd0d766fb2841f',
  //     initCodeHash: '0x3172d82413be467c1130709f7479a07def9b99caf8e0059f248c131081e4ea09',
  //   },
  //   stablePoolFactory: { address: '0x0000000000000000000000000000000000000000' },
  //   hybridPoolFactory: { address: '0x0000000000000000000000000000000000000000' },
  //   indexPoolFactory: { address: '0x0000000000000000000000000000000000000000' },
  //   native: { address: NATIVE_ADDRESS },
  //   whitelistedTokenAddresses: [
  //     // WNATIVE - This is actually quite important, though uneeded here anymore since
  //     // it's now apart of the whitelisted token check in createPair, because the
  //     // base should always be whitelisted or pricing never begins.
  //     NATIVE_ADDRESS,
  //     // WETH
  //     WETH_ADDRESS,
  //     // USDC
  //     USDC_ADDRESS,
  //     // USDT
  //     USDT_ADDRESS,
  //     // DAI
  //     DAI_ADDRESS,
  //   ],
  //   stableTokenAddresses: [
  //     // USDC
  //     USDC_ADDRESS,
  //     // USDT
  //     USDT_ADDRESS,
  //     // DAI
  //     DAI_ADDRESS,
  //   ],
  //   minimumNativeLiquidity: '0.1',
  // },
  furo: {
    stream: { address: '0x0000000000000000000000000000000000000000', startBlock: 0 },
    vesting: { address: '0x0000000000000000000000000000000000000000', startBlock: 0 },
  },
  staking: { address: '0x0000000000000000000000000000000000000000', startBlock: 0 },
  xswap: {
    address: '0x0000000000000000000000000000000000000000',
    startBlock: 0,
  },
}
