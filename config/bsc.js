const NATIVE_ADDRESS = '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c'
const WETH_ADDRESS = '0x2170ed0880ac9a755fd29b2688956bd959f933f8'
const WBTC_ADDRESS = '0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c'
const USDT_ADDRESS = '0x55d398326f99059ff775485246999027b3197955'
const BUSD_ADDRESS = '0xe9e7cea3dedca5984780bafc599bd69add087d56'
const DAI_ADDRESS = '0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3'
const ICE_ADDRESS = '0xf16e81dce15b08f326220742020379b855b87df9'
const SUSHI_ADDRESS = '0x947950bcc74888a40ffa2593c5798f11fc9124c4'

module.exports = {
  network: 'bsc',
  bentobox: {
    address: '0xf5bce5077908a1b7370b9ae04adc565ebd643966',
    startBlock: 5926250,
  },
  sushi: { address: SUSHI_ADDRESS, startBlock: 4407770 },
  kashi: {
    mediumRiskMasterContractAddresses: '0x2cba6ab6574646badc84f0544d05059e57a5dc42',
  },
  miso: {
    accessControls: { address: '0x0769fd68dfb93167989c6f7254cd0d766fb2841f', startBlock: 16167236 },
    market: { address: '0x7603a35af5cf10b113f167d424eb75bb7062c8ce', startBlock: 16168070 },
  },
  trident: {
    constantProductPoolFactory: { address: '0x0000000000000000000000000000000000000000' },
  },
  legacy: {
    native: { address: NATIVE_ADDRESS },
    whitelistedTokenAddresses: [
      // IMPORTANT! The native address must be included for pricing to start
      NATIVE_ADDRESS,
      WETH_ADDRESS,
      WBTC_ADDRESS,
      USDT_ADDRESS,
      BUSD_ADDRESS,
      DAI_ADDRESS,
      ICE_ADDRESS,
    ],
    stableTokenAddresses: [USDT_ADDRESS, BUSD_ADDRESS, DAI_ADDRESS],
    minimumNativeLiquidity: 5,
    minimum_usd_threshold_new_pairs: '3000',
    factory: {
      address: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
      initCodeHash: '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
      startBlock: 5205069,
    },
  },
  furo: {
    stream: { address: '0x4ab2fc6e258a0ca7175d05ff10c5cf798a672cae', startBlock: 18479521 },
    vesting: { address: '0x0689640d190b10765f09310fcfe9c670ede4e25b', startBlock: 18479576 },
  },
  auctionMaker: { address: '0x0000000000000000000000000000000000000000', startBlock: 0 },
  staking: { address: '0x0000000000000000000000000000000000000000', startBlock: 0 },
  blocks: {
    address: '0x0000000000000000000000000000000000000000',
    startBlock: 0,
  },
}
