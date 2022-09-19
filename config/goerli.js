const NATIVE_ADDRESS = '0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6'
const USDC_ADDRESS = '0x2f3a40a3db8a7e3d09b0adfefbce4f6f81927557'
const USDT_ADDRESS = '0x509ee0d083ddf8ac028f2a56731412edd63223b9'
const DAI_ADDRESS = '0x73967c6a0904aa032c103b4104747e88c566b1a2'
const MIM_ADDRESS = '0x5b25737e8c976111e3e9ff3d7d4c095c34d36d16'
module.exports = {
  network: 'goerli',
  legacy: {
    native: { address: NATIVE_ADDRESS },
    whitelistedTokenAddresses: [
      // IMPORTANT! The native address must be included for pricing to start
      NATIVE_ADDRESS,
      USDC_ADDRESS,
      USDT_ADDRESS,
      DAI_ADDRESS,
      MIM_ADDRESS,
    ],
    stableTokenAddresses: [USDC_ADDRESS, USDT_ADDRESS, DAI_ADDRESS, MIM_ADDRESS],
    minimumNativeLiquidity: 0.001,
    minimum_usd_threshold_new_pairs: '0.3',
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
  xswap: {
    address: '0x0000000000000000000000000000000000000000',
    startBlock: 0,
  }
}
