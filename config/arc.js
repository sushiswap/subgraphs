const USDC_ADDRESS = "0x3600000000000000000000000000000000000000";
const EURC_ADDRESS = "0x89b50855aa3be2f677cd6303cec089b5f319d72a";
const CIRBTC_ADDRESS = "0x171a4217b86a807a64eb94757db6849fb4bdbaa0";

module.exports = {
  network: "arc-mainnet",
  retainBlocks: 2906400,
  v2: {
    nativeAddress: USDC_ADDRESS,
    whitelistAddresses: [USDC_ADDRESS, EURC_ADDRESS, CIRBTC_ADDRESS],
    stable0: USDC_ADDRESS,
    stable1: "0x0000000000000000000000000000000000000000",
    stable2: "0x0000000000000000000000000000000000000000",
    minimumNativeLiquidity: 1000,
    factory: {
      address: "0x0e867974275Cd31C25015C2753C9d75F9f355379",
      initCodeHash:
        "0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303",
      startBlock: 21005804,
    },
  },
  v3: {
    factory: {
      address: "0x7282249282902e1f99c2CB0A04230091bd30FE3A",
      startBlock: 21006899,
    },
    native: { address: USDC_ADDRESS },
    whitelistedTokenAddresses: [USDC_ADDRESS, EURC_ADDRESS, CIRBTC_ADDRESS],
    stableTokenAddresses: [USDC_ADDRESS],
    // Arc's native currency is USDC, so pricing does not need a reference pool.
    nativePricePool: "0x0000000000000000000000000000000000000000",
    minimumEthLocked: 1000,
  },
};
