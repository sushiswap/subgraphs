const NATIVE_ADDRESS = '0x0000000000000000000000000000000000001010'
const CLOE_ADDRESS = '0x1eaa43544daa399b87eecfcc6fa579d5ea4a6187'
const BUSDT_ADDRESS = '0xbf6c50889d3a620eb42C0F188b65aDe90De958c4'
const BNB_ADDRESS = '0xcc78d0a86b0c0a3b32debd773ec815130f9527cf'
const WETH_ADDRESS = '0xcc00860947035a26ffe24ecb1301ffad3a89f910'

module.exports = {
  network: 'bttc',
  auctionMaker: { address: '0x0000000000000000000000000000000000000000', startBlock: 0 },
  bentobox: {
    address: '0x0000000000000000000000000000000000000000',
    base: 'QmSTz1vJeN5LKJHv9xqTxpsqiLRgpH2YWN5dVhQDv6Pd95',
    startBlock: 0,
  },
  blocks: {
    address: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
    startBlock: 3030672,
  },
  legacy: {
    native: { address: NATIVE_ADDRESS },
    whitelistedTokenAddresses: [
      // IMPORTANT! The native address must be included for pricing to start
      NATIVE_ADDRESS,
      CLOE_ADDRESS,
      BUSDT_ADDRESS,
      BNB_ADDRESS,
      WETH_ADDRESS,
    ],
    stableTokenAddresses: [BUSDT_ADDRESS],
    minimumNativeLiquidity: 1000000000,
    minimum_usd_threshold_new_pairs: '3000',
    factory: {
      address: '0xbf6c50889d3a620eb42c0f188b65ade90de958c4',
      initCodeHash: '0xe410ea0a25ce340e309f2f0fe9d58d787bb87dd63d02333e8a9a747230f61758',
      startBlock: 3035123,
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
