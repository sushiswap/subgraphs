module.exports = {
  network: 'moonriver',
  native: { address: '0xf50225a84382c74cbdea10b0c176f71fc3de0c4d' },
  whitelistedTokenAddresses: [
    // NATIVE
    '0xf50225a84382c74cbdea10b0c176f71fc3de0c4d',
    // WETH
    '0x639a647fbe20b6c8ac19e48e2de44ea792c62c5c',
    // USDC
    '0xe3f5a90f9cb311505cd691a46596599aa1a0ad7d',
    // USDT
    '0xb44a9b6905af7c801311e8f4e76932ee959c663c',
    // DAI
    '0x80a16016cc4a2e6a2caca8a4a498b1699ff0f844',
    // WMOVR
    '0xf50225a84382c74cbdea10b0c176f71fc3de0c4d',
    // WBTC
    '0xe6a991ffa8cfe62b0bf6bf72959a3d4f11b2e0f5',
    // FRAX
    '0x1a93b23281cc1cde4c4741353f3064709a16197d',
    // MIM
    '0x0cae51e1032e8461f4806e26332c030e34de3adb',
  ],
  stableTokenAddresses: [
    // USDC
    '0xe3f5a90f9cb311505cd691a46596599aa1a0ad7d',
    // USDT
    '0xb44a9b6905af7c801311e8f4e76932ee959c663c',
    // DAI
    '0x80a16016cc4a2e6a2caca8a4a498b1699ff0f844',
    // FRAX
    '0x1a93b23281cc1cde4c4741353f3064709a16197d',

  ],
  minimumNativeLiquidity: 5,
  bentobox: {
    address: '0x145d82bca93cca2ae057d1c6f26245d1b9522e6f',
    startBlock: 1610292,
  },
  miso: {
    accessControls: { address: '0x0769fd68dfb93167989c6f7254cd0d766fb2841f', startBlock: 1610232 },
    market: { address: '0x120140d0c1ebc938befc84840575ecdc5fe55afe', startBlock: 1610328 },
  },
  legacy: {
    minimum_usd_threshold_new_pairs: "3000",
    factory: {
      address: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
      initCodeHash: '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
      startBlock: 428426,
    },
  },
  blocks: {
    address: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
    startBlock: 428426,
  },
  furo: {
    stream: { address: '0x4ab2fc6e258a0ca7175d05ff10c5cf798a672cae', startBlock: 1976212 },
    vesting: { address: '0x0689640d190b10765f09310fcfe9c670ede4e25b', startBlock: 1976221 },
  },
  auctionMaker: { address: '0x0000000000000000000000000000000000000000', startBlock: 0 },
  staking: { address: '0x0000000000000000000000000000000000000000', startBlock: 0 },
}
