module.exports = {
  network: 'avalanche',
  native: { address: '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7' },
  whitelistedTokenAddresses: [
    // WETH
    '0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab',
    // USDC
    '0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664',
    // USDT
    '0xc7198437980c041c805a1edcba50c1ce5db95118',
    // DAI
    '0xd586e7f844cea2f87f50152665bcbc2c279d8d70',
    // WBTC
    '0x50b7545627a5162f82a992c33b87adc75187b218',
    // MIM
    '0x130966628846bfd36ff31a822705796e8cb8c18d',
    // SUSHI
    '0x37b608519f91f70f2eeb0e5ed9af4061722e4f76',
    // TIME
    '0xb54f16fb19478766a268f172c9480f8da1a7c9c3',
    // SPELL
    '0xce1bffbd5374dac86a2893119683f4911a2f7814',
  ],
  stableTokenAddresses: [
    // USDC
    '0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664',
    // USDT
    '0xc7198437980c041c805a1edcba50c1ce5db95118',
    // DAI
    '0xd586e7f844cea2f87f50152665bcbc2c279d8d70',
  ],
  minimumNativeLiquidity: 3,
  bentobox: {
    address: '0x0711b6026068f736bae6b213031fce978d48e026',
    startBlock: 3672722,
  },
  miso: {
    accessControls: { address: '0x0769fd68dfb93167989c6f7254cd0d766fb2841f', startBlock: 13510155 },
    market: { address: '0x7603a35af5cf10b113f167d424eb75bb7062c8ce', startBlock: 13510645 },
  },
  legacy: {
    minimum_usd_threshold_new_pairs: "3000",
    factory: {
      address: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
      initCodeHash: '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
      startBlock: 506190,
    },
  },
  furo: {
    stream: { address: '0x4ab2fc6e258a0ca7175d05ff10c5cf798a672cae', startBlock: 15714979 },
    vesting: { address: '0x0689640d190b10765f09310fcfe9c670ede4e25b', startBlock: 15715037 },
  },
  auctionMaker: { address: '0x0000000000000000000000000000000000000000', startBlock: 0 },
  staking: { address: '0x0000000000000000000000000000000000000000', startBlock: 0 },
  blocks: {
    address: '0x0000000000000000000000000000000000000000',
    startBlock: 0,
  },
}
