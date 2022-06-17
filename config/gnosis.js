const NATIVE_ADDRESS = '0xe91d153e0b41518a2ce8dd3d7944fa863463a97d'
const WETH_ADDRESS = '0x6a023ccd1ff6f2045c3309768ead9e68f978f6e1'
const WBTC_ADDRESS = '0x8e5bbbb09ed1ebde8674cda39a0c169401db4252'
const USDC_ADDRESS = '0xddafbb505ad214d7b80b1f830fccc89b60fb7a83'
const USDT_ADDRESS = '0x4ecaba5870353805a9f068101a40e0f32ed605c6'
const BAO_ADDRESS = '0x82dfe19164729949fd66da1a37bc70dd6c4746ce'
const WETH2_ADDRESS = '0x6a023ccd1ff6f2045c3309768ead9e68f978f6e1'
const DAI_ADDRESS = '0x44fa8e6f47987339850636f88629646662444217'
const USDP_ADDRESS = '0xfe7ed09c4956f7cdb54ec4ffcb9818db2d7025b8'

module.exports = {
  network: 'xdai',
  bentobox: {
    address: '0xf5bce5077908a1b7370b9ae04adc565ebd643966',
    startBlock: 15157559,
  },
  legacy: {
    native: { address: NATIVE_ADDRESS },
    whitelistedTokenAddresses: [
      NATIVE_ADDRESS,
      WETH_ADDRESS,
      WBTC_ADDRESS,
      USDC_ADDRESS,
      USDT_ADDRESS,
      BAO_ADDRESS,
      WETH2_ADDRESS,
      DAI_ADDRESS,
      USDP_ADDRESS,
    ],
    stableTokenAddresses: [USDC_ADDRESS, USDT_ADDRESS, DAI_ADDRESS, USDP_ADDRESS],
    minimumNativeLiquidity: 2500, // TODO: Figure out why this is 2500 while the normal value is 3?
    minimum_usd_threshold_new_pairs: '3000',
    factory: {
      address: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
      initCodeHash: '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
      startBlock: 14735904,
    },
  },
  furo: {
    stream: { address: '0x4ab2fc6e258a0ca7175d05ff10c5cf798a672cae', startBlock: 22535727 },
    vesting: { address: '0x0689640d190b10765f09310fcfe9c670ede4e25b', startBlock: 22535744 },
  },
  auctionMaker: { address: '0x0000000000000000000000000000000000000000', startBlock: 0 },
  staking: { address: '0x0000000000000000000000000000000000000000', startBlock: 0 },
  blocks: {
    address: '0x0000000000000000000000000000000000000000',
    startBlock: 0,
  },
}
