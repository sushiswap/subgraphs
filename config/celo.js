module.exports = {
  network: 'celo',
  bentobox: {
    address: '0x0711b6026068f736bae6b213031fce978d48e026',
    startBlock: 9451612,
  },
  native: {
    address: '0x471ece3750da237f93b8e339c536989b8978a438',
  },
  whitelistedTokenAddresses: [
    // WNATIVE - This is actually quite important, though uneeded here anymore since
    // it's now apart of the whitelisted token check in createPair, because the
    // base should always be whitelisted or pricing never begins.
    // CELO
    '0x471ece3750da237f93b8e339c536989b8978a438',
    // WETH
    '0x122013fd7df1c6f636a5bb8f03108e876548b455',
    // cEUR
    '0xd8763cba276a3738e6de85b4b3bf5fded6d6ca73',
    // cUSD
    '0x765de816845861e75a25fca122bb6898b8b1282a',
    // USDC
    '0xef4229c8c3250c675f21bcefa42f58efbff6002a',
    // USDT
    '0x88eec49252c8cbc039dcdb394c0c2ba2f1637ea0',
    // WBTC
    '0xbaab46e28388d2779e6e31fd00cf0e5ad95e327b',
    // DAI
    '0xe4fe50cdd716522a56204352f00aa110f731932d',
    // DAI2
    '0x90ca507a5d4458a4c6c6249d186b6dcb02a5bccd',
  ],
  stableTokenAddresses: [
    // DAI
    '0x90ca507a5d4458a4c6c6249d186b6dcb02a5bccd',
    // DAI2
    '0xe4fe50cdd716522a56204352f00aa110f731932d',
    // USDC
    '0x765de816845861e75a25fca122bb6898b8b1282a',
    // USDT
    '0x88eec49252c8cbc039dcdb394c0c2ba2f1637ea0',
  ],
  minimumNativeLiquidity: 1,
  legacy: {
    minimum_usd_threshold_new_pairs: '3000',
    factory: {
      address: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
      initCodeHash: '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
      startBlock: 7253488,
    },
  },
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
}
