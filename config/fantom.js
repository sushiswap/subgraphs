const NATIVE_ADDRESS = '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83'
const WETH_ADDRESS = '0x74b23882a30290451a17c44f4f05243b6b58c76d'
const FUSD_ADDRESS = '0xad84341756bf337f5a0164515b1f6f993d194e1f'
const DAI_ADDRESS = '0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e'
const USDC_ADDRESS = '0x04068da6c83afcfa0e13ba15a6696662335d5b75'
const SUSHI_ADDRESS = '0xae75a438b2e0cb8bb01ec1e1e376de11d44477cc'

module.exports = {
  network: 'fantom',
  sushi: { address: SUSHI_ADDRESS },
  minichef: {
    address: '0xf731202a3cf7efa9368c2d7bd613926f7a144db5',
    startBlock: 28771200,
    rewarder: {
      complex: {
        address: '0xeaf76e3bd36680d98d254b378ed706cb0dfbfc1b',
        rewardToken: { address: NATIVE_ADDRESS }
      }
    },
  },
  bentobox: {
    address: '0xf5bce5077908a1b7370b9ae04adc565ebd643966',
    startBlock: 2918231,
  },
  miso: {
    accessControls: { address: '0x0769fd68dfb93167989c6f7254cd0d766fb2841f', startBlock: 36236619 },
    market: { address: '0x7603a35af5cf10b113f167d424eb75bb7062c8ce', startBlock: 36236954 },
  },
  legacy: {
    native: { address: NATIVE_ADDRESS },
    whitelistedTokenAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
      WETH_ADDRESS,
      FUSD_ADDRESS,
      DAI_ADDRESS,
      USDC_ADDRESS,
    ],
    stableTokenAddresses: [FUSD_ADDRESS, DAI_ADDRESS, USDC_ADDRESS],
    minimumNativeLiquidity: 15000,
    factory: {
      address: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
      initCodeHash: '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
      startBlock: 2457879,
    },
  },
  trident: {
    masterDeployer: { address: '0x1dfe5ce9e3630f6d542187cbfb267c9aa1b31e11', startBlock: 55257600 },
    concentratedLiquidityPoolFactory: { address: '0x0000000000000000000000000000000000000000' },
    constantProductPoolFactory: {
      address: '0x2c8c987c4777ab740d20cb581f5d381be95a4a4a',
      initCodeHash: '0x3172d82413be467c1130709f7479a07def9b99caf8e0059f248c131081e4ea09',
    },
    stablePoolFactory: { address: '0x97a32b4f8486735075f2cbecff64208fbf2e610a' },
    hybridPoolFactory: { address: '0x0000000000000000000000000000000000000000' },
    indexPoolFactory: { address: '0x0000000000000000000000000000000000000000' },
    native: { address: NATIVE_ADDRESS },
    whitelistedTokenAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
      WETH_ADDRESS,
      FUSD_ADDRESS,
      DAI_ADDRESS,
      USDC_ADDRESS,
    ],
    stableTokenAddresses: [FUSD_ADDRESS, DAI_ADDRESS, USDC_ADDRESS],
    tokensToPriceOffNative: [
      // These tokens will be priced off the NATIVE token.
      USDC_ADDRESS,
    ],
    minimumNativeLiquidity: '2000',
  },
  v3: {
    factory: {
      address: '0x7770978eed668a3ba661d51a773d3a992fc9ddcb',
      startBlock: 58860670,
    },
    positionManager: {
      address: '0x10c19390e1ac2fd6d0c3643a2320b0aba38e5baa',
      startBlock: 58896145,
    },
    native: { address: NATIVE_ADDRESS },
    whitelistedTokenAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
      WETH_ADDRESS,
      FUSD_ADDRESS,
      DAI_ADDRESS,
      USDC_ADDRESS,
    ],
    stableTokenAddresses: [FUSD_ADDRESS, DAI_ADDRESS, USDC_ADDRESS],
    nativePricePool: '', // TODO: ADD POOL ADDRESS, lowercase it.
    minimumEthLocked: 2000
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
  xswap: {
    address: '0xd045d27c1f7e7f770a807b0a85d8e3f852e0f2be',
    startBlock: 43250231,
  },
  stargate: {
    usdcPool: { address: '0x12edeA9cd262006cC3C4E77c90d2CD2DD4b1eb97', startBlock: 33647195 },
    usdtPool: { address: '0x0000000000000000000000000000000000000000', startBlock: 0 },
  }
}
