const NATIVE_ADDRESS = '0xc86c7c0efbd6a49b35e8714c5f59d99de09a225b'
const WBTC_ADDRESS = '0x818ec0a7fe18ff94269904fced6ae3dae6d6dc0b'
const USDC_ADDRESS = '0xfa9343c3897324496a05fc75abed6bac29f8a40f'
const USDT_ADDRESS = '0xb44a9b6905af7c801311e8f4e76932ee959c663c'
const DAI_ADDRESS = '0x765277eebeca2e31912c9946eae1021199b39c61'
const WETH_ADDRESS = '0xe3f5a90f9cb311505cd691a46596599aa1a0ad7d'

module.exports = {
  network: 'kava-evm',
  native: { address: NATIVE_ADDRESS },
  bentobox: {
    address: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
    base: 'QmXtBjEnPnD5pwxj4yYLQyWpaE38ioprpKJ3rXSZQh4xHS',
    startBlock: 161967,
  },
  masterDeployer: { address: '0x1b02da8cb0d097eb8d57a175b88c7d8b47997506', startBlock: 162097 },
  concentratedLiquidityPoolFactory: { address: '0x0000000000000000000000000000000000000000' },
  constantProductPoolFactory: {
    address: '0x0769fd68dfb93167989c6f7254cd0d766fb2841f',
    initCodeHash: '0x3172d82413be467c1130709f7479a07def9b99caf8e0059f248c131081e4ea09',
  },
  hybridPoolFactory: { address: '0x0000000000000000000000000000000000000000' },
  indexPoolFactory: { address: '0x0000000000000000000000000000000000000000' },
  whitelistedTokenAddresses: [
    // WNATIVE - This is actually quite important, though uneeded here anymore since
    // it's now apart of the whitelisted token check in createPair, because the
    // base should always be whitelisted or pricing never begins.
    NATIVE_ADDRESS,
    // WETH
    WETH_ADDRESS,
    // WBTC
    WBTC_ADDRESS,
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
  // List of STABLE/NATIVE pools to use to price NATIVE in USD
  stablePoolAddresses: [
    // USDC/WKAVA/30/FALSE
    '0x88395b86cf9787e131d2fb5462a22b44056bf574',
  ],
  minimumNativeLiquidity: '0.01',

  furo: {
    stream: { address: '0x0000000000000000000000000000000000000000', startBlock: 0 },
    vesting: { address: '0x0000000000000000000000000000000000000000', startBlock: 0 },
  },
  auctionMaker: { address: '0x0000000000000000000000000000000000000000', startBlock: 0 },
  staking: { address: '0x0000000000000000000000000000000000000000', startBlock: 0 },
  blocks: {
    address: '0x0000000000000000000000000000000000000000',
    startBlock: 0,
  },
  kashi: {
    liquidationMultiplier: 12,
  },
}
