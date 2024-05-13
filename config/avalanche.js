const NATIVE_ADDRESS = '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7'
const WETH_ADDRESS = '0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab'
const USDC_E_ADDRESS = '0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664'
const USDC_ADDRESS = '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e'
const USDTE_ADDRESS = '0xc7198437980c041c805a1edcba50c1ce5db95118'
const USDT_ADDRESS = '0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7'
const DAI_ADDRESS = '0xd586e7f844cea2f87f50152665bcbc2c279d8d70'
const WBTC_ADDRESS = '0x50b7545627a5162f82a992c33b87adc75187b218'
const MIM_ADDRESS = '0x130966628846bfd36ff31a822705796e8cb8c18d'
const SUSHI_ADDRESS = '0x37b608519f91f70f2eeb0e5ed9af4061722e4f76'
const TIME_ADDRESS = '0xb54f16fb19478766a268f172c9480f8da1a7c9c3'
const SPELL_ADDRESS = '0xce1bffbd5374dac86a2893119683f4911a2f7814'
const WMEMO_ADDRESS = '0x0da67235dd5787d67955420c84ca1cecd4e5bb3b'
const JOE_ADDRESS = '0x6e84a6216ea6dacc71ee8e6b0a5b7322eebc0fdd'
const COQ_ADDRESS = '0x420fca0121dc28039145009570975747295f2329'

module.exports = {
  network: 'avalanche',
  sushi: { address: SUSHI_ADDRESS },
  minichef: {
    address: '0xe11252176cedd4a493aec9767192c06a04a6b04f',
    startBlock: 24827313,
    rewarder: {
      complex: {
        address: '0x4a90e4ea17c29ddc88efb8b13129b7070b618586',
        rewardToken: { address: NATIVE_ADDRESS }
      },
    }
  },
  bentobox: {
    address: '0x0711b6026068f736bae6b213031fce978d48e026',
    startBlock: 3672722,
  },
  miso: {
    accessControls: { address: '0x0769fd68dfb93167989c6f7254cd0d766fb2841f', startBlock: 13510155 },
    market: { address: '0x7603a35af5cf10b113f167d424eb75bb7062c8ce', startBlock: 13510645 },
  },
  legacy: {
    native: { address: NATIVE_ADDRESS },
    whitelistedTokenAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
      WETH_ADDRESS,
      USDC_ADDRESS,
      USDT_ADDRESS,
      USDTE_ADDRESS,
      DAI_ADDRESS,
      WBTC_ADDRESS,
      MIM_ADDRESS,
      SUSHI_ADDRESS,
      TIME_ADDRESS,
      SPELL_ADDRESS,
      WMEMO_ADDRESS,
      USDC_E_ADDRESS,
    ],
    stableTokenAddresses: [USDC_ADDRESS, USDT_ADDRESS, USDTE_ADDRESS, DAI_ADDRESS, MIM_ADDRESS],
    minimumNativeLiquidity: 5,
    factory: {
      address: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
      initCodeHash: '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
      startBlock: 506190,
    },
  },
  trident: {
    masterDeployer: { address: '0x97a32b4f8486735075f2cbecff64208fbf2e610a', startBlock: 22495996 },
    concentratedLiquidityPoolFactory: { address: '0x0000000000000000000000000000000000000000' },
    constantProductPoolFactory: {
      address: '0xb84a043bc4fca97b7a74ed7daab1bf12a8df929f',
      initCodeHash: '0x3172d82413be467c1130709f7479a07def9b99caf8e0059f248c131081e4ea09',
    },
    stablePoolFactory: { address: '0x7770978eed668a3ba661d51a773d3a992fc9ddcb' },
    hybridPoolFactory: { address: '0x0000000000000000000000000000000000000000' },
    indexPoolFactory: { address: '0x0000000000000000000000000000000000000000' },
    native: { address: NATIVE_ADDRESS },
    whitelistedTokenAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
      WETH_ADDRESS,
      USDC_ADDRESS,
      USDT_ADDRESS,
      USDTE_ADDRESS,
      DAI_ADDRESS,
      WBTC_ADDRESS,
      MIM_ADDRESS,
      SUSHI_ADDRESS,
      TIME_ADDRESS,
      SPELL_ADDRESS,
      WMEMO_ADDRESS,
      USDC_E_ADDRESS,
    ],
    stableTokenAddresses: [USDC_ADDRESS, USDT_ADDRESS, USDTE_ADDRESS, DAI_ADDRESS, MIM_ADDRESS],
    tokensToPriceOffNative: [
      // These tokens will be priced off the NATIVE token.
      USDC_ADDRESS,
    ],
    minimumNativeLiquidity: '50',
  },
  v2: {
    nativeAddress: NATIVE_ADDRESS,
    whitelistAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
      WETH_ADDRESS,
      USDC_ADDRESS,
      USDT_ADDRESS,
      USDTE_ADDRESS,
      DAI_ADDRESS,
      WBTC_ADDRESS,
      MIM_ADDRESS,
      SUSHI_ADDRESS,
      TIME_ADDRESS,
      SPELL_ADDRESS,
      WMEMO_ADDRESS,
      USDC_E_ADDRESS,
      JOE_ADDRESS,
      COQ_ADDRESS
    ],
    stable0: USDC_ADDRESS,
    stable1: USDT_ADDRESS,
    stable2: DAI_ADDRESS,
    minimumNativeLiquidity: 5,
    factory: {
      address: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
      initCodeHash: '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
      startBlock: 506190,
    }
  },
  v3: {
    factory: {
      address: '0x3e603c14af37ebdad31709c4f848fc6ad5bec715',
      startBlock: 28186391,
    },
    positionManager: {
      address: '0xf87bc5535602077d340806d71f805ea9907a843d',
      startBlock: 28207919,
    },
    native: { address: NATIVE_ADDRESS },
    whitelistedTokenAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
      WETH_ADDRESS,
      USDC_ADDRESS,
      USDT_ADDRESS,
      USDTE_ADDRESS,
      DAI_ADDRESS,
      WBTC_ADDRESS,
      MIM_ADDRESS,
      SUSHI_ADDRESS,
      TIME_ADDRESS,
      SPELL_ADDRESS,
      WMEMO_ADDRESS,
      USDC_E_ADDRESS,
      JOE_ADDRESS,
      COQ_ADDRESS
    ],
    stableTokenAddresses: [USDC_ADDRESS, USDT_ADDRESS, USDTE_ADDRESS, DAI_ADDRESS, MIM_ADDRESS],
    nativePricePool: '0x4a5c0e100f830a1f6b76a42e6bb4be2a7fe0d61b',
    minimumEthLocked: 50
  },
  furo: {
    stream: { address: '0x4ab2fc6e258a0ca7175d05ff10c5cf798a672cae', startBlock: 15714979 },
    vesting: { address: '0x0689640d190b10765f09310fcfe9c670ede4e25b', startBlock: 15715037 },
  },
  auctionMaker: { address: '0x0000000000000000000000000000000000000000', startBlock: 0 },
  staking: { address: '0x0000000000000000000000000000000000000000', startBlock: 0 },
  blocks: {
    address: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
    startBlock: 0,
  },
  xswap: {
    address: '0x2c8c987c4777ab740d20cb581f5d381be95a4a4a',
    startBlock: 17624306,
  },
  stargate: {
    usdcPool: { address: '0x1205f31718499dbf1fca446663b532ef87481fe1', startBlock: 12219159 },
    usdtPool: { address: '0x29e38769f23701a2e4a8ef0492e19da4604be62c', startBlock: 12219171 },
  },
  routeprocessor: {
    address: '0xcdbcd51a5e8728e0af4895ce5771b7d17ff71959',
    startBlock: 42124167,
  }
}
