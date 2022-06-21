const NATIVE_ADDRESS = '0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6'
const USDC_ADDRESS = '0xd87ba7a50b2e7e660f678a895e4b72e7cb4ccd9c'
const USDT_ADDRESS = '0xce7f7c709e8c74d8ad069ed28abf25ddc43b32a9'
const BAT_ADDRESS = '0x70cba46d2e933030e2f274ae58c951c800548aef'
const DAI_ADDRESS = '0xdc31ee1784292379fbb2964b3b9c4124d8f89c60'
const MIM_ADDRESS = '0x5b25737e8c976111e3e9ff3d7d4c095c34d36d16'
const ZRX_ADDRESS = '0xe4e81fa6b16327d4b78cfeb83aade04ba7075165'
const UNI_ADDRESS = '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984'

module.exports = {
  network: 'goerli',
  native: { address: NATIVE_ADDRESS },
  whitelistedTokenAddresses: [
    // WNATIVE - This is actually quite important, though uneeded here anymore since
    // it's now apart of the whitelisted token check in createPair, because the
    // base should always be whitelisted or pricing never begins.
    NATIVE_ADDRESS,
    USDC_ADDRESS,
    USDT_ADDRESS,
    BAT_ADDRESS,
    DAI_ADDRESS,
    MIM_ADDRESS,
    ZRX_ADDRESS,
    UNI_ADDRESS,
  ],
  stableTokenAddresses: [USDC_ADDRESS, USDT_ADDRESS, DAI_ADDRESS, MIM_ADDRESS],
  minimumNativeLiquidity: 0.001,
  legacy: {
    minimum_usd_threshold_new_pairs: '10',
    factory: {
      address: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
      initCodeHash: '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
      startBlock: 4345820,
    },
  },
  auctionMaker: { address: '0x0000000000000000000000000000000000000000', startBlock: 0 },
  staking: { address: '0x0000000000000000000000000000000000000000', startBlock: 0 },
  blocks: {
    address: '0x0000000000000000000000000000000000000000',
    startBlock: 0,
  },
  furo: {
    stream: { address: '0x4ab2fc6e258a0ca7175d05ff10c5cf798a672cae', startBlock: 6960694 },
    vesting: { address: '0x0689640d190b10765f09310fcfe9c670ede4e25b', startBlock: 6960703 },
  },
  bentobox: {
    address: '0xf5bce5077908a1b7370b9ae04adc565ebd643966',
    startBlock: 4489937,
  },
}
