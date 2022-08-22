const NATIVE_ADDRESS = '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83'
const SUSHI_ADDRESS = '0xae75a438b2e0cb8bb01ec1e1e376de11d44477cc'
const WETH_ADDRESS = '0x74b23882a30290451a17c44f4f05243b6b58c76d'
const FUSD_ADDRESS = '0xad84341756bf337f5a0164515b1f6f993d194e1f'
const DAI_ADDRESS = '0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e'
const USDC_ADDRESS = '0x04068da6c83afcfa0e13ba15a6696662335d5b75'

module.exports = {
  network: 'fantom',
  bentobox: {
    address: '0xf5bce5077908a1b7370b9ae04adc565ebd643966',
    startBlock: 2918231,
  },
  sushi: { address: SUSHI_ADDRESS, startBlock: 2300973 },
  miso: {
    accessControls: { address: '0x0769fd68dfb93167989c6f7254cd0d766fb2841f', startBlock: 36236619 },
    market: { address: '0x7603a35af5cf10b113f167d424eb75bb7062c8ce', startBlock: 36236954 },
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
      FUSD_ADDRESS,
      DAI_ADDRESS,
      USDC_ADDRESS,
    ],
    stableTokenAddresses: [FUSD_ADDRESS, DAI_ADDRESS, USDC_ADDRESS],
    minimumNativeLiquidity: 15000,
    minimum_usd_threshold_new_pairs: '1000',
    factory: {
      address: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
      initCodeHash: '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
      startBlock: 2457879,
    },
  },
  furo: {
    stream: { address: '0x4ab2fc6e258a0ca7175d05ff10c5cf798a672cae', startBlock: 39984551 },
    vesting: { address: '0x0689640d190b10765f09310fcfe9c670ede4e25b', startBlock: 39984585 },
  },
  auctionMaker: { address: '0x0000000000000000000000000000000000000000', startBlock: 0 },
  staking: { address: '0x0000000000000000000000000000000000000000', startBlock: 0 },
  blocks: {
    address: '0x0000000000000000000000000000000000000000',
    startBlock: 0,
  },
  miniChef: {address: '0xf731202a3cf7efa9368c2d7bd613926f7a144db5', startBlock: 28771200 },
  limitOrder: {address: '0x0dd184bec9e43701f76d75d5fffe246b2dc8d4ea', startBlock: 28769791 },
}
