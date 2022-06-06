module.exports = {
  network: 'mainnet',
  native: { address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2' },
  sushi: { address: '0x6b3595068778dd592e39a122f4f5a5cf09c90fe2' },
  weth: { address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2' },
  wbtc: { address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599' },
  // whitelistedTokenAddresses: [
  //   // WETH
  //   '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  //   // USDC
  //   '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  //   // USDT
  //   '0xdac17f958d2ee523a2206206994597c13d831ec7',
  //   // DAI
  //   '0x6b175474e89094c44da98b954eedeac495271d0f',
  //   // SUSHI
  //   '0x6b3595068778dd592e39a122f4f5a5cf09c90fe2',
  // ],
  stableTokenAddresses: [
    // USDC
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    // USDT
    '0xdac17f958d2ee523a2206206994597c13d831ec7',
    // DAI
    '0x6b175474e89094c44da98b954eedeac495271d0f',
    // MIM
    '0x99d8a9c45b2eca8864373a26d1459e3dff1e17f3',
    // FRAX
    '0x853d955acef822db058eb8505911ed77f175b99e',
    // UST
    '0xa47c8bf37f92abed4a126bda807a7b7498661acd',
  ],
  // List of STABLE/NATIVE pools to use to price NATIVE in USD
  // stablePoolAddresses: [
  //   // DAI/WETH
  //   '0xc3d03e4f041fd4cd388c549ee2a29a9e5075882f',
  //   // USDT/WETH
  //   '0x06da0fd433c1a5d7a4faa01111c044910a184553',
  //   // USDC/WETH
  //   '0x397ff1542f962076d0bfe58ea045ffa2d347aca0',
  // ],
  bentobox: {
    address: '0xf5bce5077908a1b7370b9ae04adc565ebd643966',
    startBlock: 12094175,
  },
  kashi: {
    medium: '0x2cba6ab6574646badc84f0544d05059e57a5dc42',
  },
  blocks: {
    address: '0x6e38A457C722C6011B2dfa06d49240e797844d66',
    startBlock: 49880,
  },
  miso: {
    accessControls: { address: '0xc35dadb65012ec5796536bd9864ed8773abc74c4', startBlock: 14598164 },
    market: { address: '0x281bd3a3f96ae7c96049493a7ba9449df2c5b0fe', startBlock: 14598240 },
  },
  legacy: {
    factory: {
      address: '0xc0aee478e3658e2610c5f7a4a2e1777ce9e4f2ac',
      initCodeHash: '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
      startBlock: 10794229,
    },
  },
  sushi: {
    address: '0x6b3595068778dd592e39a122f4f5a5cf09c90fe2',
    startBlock: 10750000,
  },
  xSushi: {
    address: '0x8798249c2e607446efb7ad49ec89dd1865ff4272',
    startBlock: 10801571,
  },
  minimumNativeLiquidity: '1',
  furo: {
    stream: { address: '0x4ab2fc6e258a0ca7175d05ff10c5cf798a672cae', startBlock: 14857212 },
    vesting: { address: '0x0689640d190b10765f09310fcfe9c670ede4e25b', startBlock: 14857245 },
  },
  auctionMaker: { address: '0x0000000000000000000000000000000000000000', startBlock: 0 },
  staking: { address: '0x0000000000000000000000000000000000000000', startBlock: 0 },
  blocks: {
    address: '0x0000000000000000000000000000000000000000',
    startBlock: 0,
  },
}
