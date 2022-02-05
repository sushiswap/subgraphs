module.exports = {
  network: 'mainnet',
  native: { address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2' },
  sushi: { address: '0x6b3595068778dd592e39a122f4f5a5cf09c90fe2' },
  weth: { address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2' },
  wbtc: { address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599' },

  whitelistedTokenAddresses: [
    // WETH
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    // USDC
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    // USDT
    '0xdac17f958d2ee523a2206206994597c13d831ec7',
    // DAI
    '0x6b175474e89094c44da98b954eedeac495271d0f',
    // SUSHI
    '0x6b3595068778dd592e39a122f4f5a5cf09c90fe2',
  ],
  stableTokenAddresses: [
    // USDC
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    // USDT
    '0xdac17f958d2ee523a2206206994597c13d831ec7',
    // DAI
    '0x6b175474e89094c44da98b954eedeac495271d0f',
  ],
  // List of STABLE/NATIVE pools to use to price NATIVE in USD
  stablePoolAddresses: [
    // DAI/WETH
    '0xc3d03e4f041fd4cd388c549ee2a29a9e5075882f',
    // USDT/WETH
    '0x06da0fd433c1a5d7a4faa01111c044910a184553',
    // USDC/WETH
    '0x397ff1542f962076d0bfe58ea045ffa2d347aca0',
  ],
  legacy: {
    factory: {
      address: '0xc0aee478e3658e2610c5f7a4a2e1777ce9e4f2ac',
      initCodeHash: '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
      startBlock: 10794229,
    },
  },
}
