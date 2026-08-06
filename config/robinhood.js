const NATIVE_ADDRESS = "0x0bd7d308f8e1639fab988df18a8011f41eacad73";
const USDG_ADDRESS = "0x5fc5360d0400a0fd4f2af552add042d716f1d168";

module.exports = {
  network: "robinhood-mainnet",
  blocks: {
    address: "0xe52abd50ad151ecdf56427effd715e703696a6b1",
    startBlock: 0,
  },
  v2: {
    nativeAddress: NATIVE_ADDRESS,
    whitelistAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
      USDG_ADDRESS,
    ],
    stable0: USDG_ADDRESS,
    stable1: "0x0000000000000000000000000000000000000000",
    stable2: "0x0000000000000000000000000000000000000000",
    minimumNativeLiquidity: 0.5,
    factory: {
      address: "0xe52abd50ad151ecdf56427effd715e703696a6b1",
      initCodeHash:
        "0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303",
      startBlock: 6269958,
    },
  },
  v3: {
    factory: {
      address: "0xe51960f1b45f1c9fb6d166e6a884f866fc70433b",
      startBlock: 6292626,
    },
    positionManager: {
      address: "0x51d0e5188afe12d502e29d982d20c190e7816107",
      startBlock: 6305802,
    },
    native: { address: NATIVE_ADDRESS },
    whitelistedTokenAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
      USDG_ADDRESS,
    ],
    stableTokenAddresses: [USDG_ADDRESS],
    nativePricePool: "0xc5a01c57b2851202dcf8507a0f2bd08a8025e2c8", // WETH/USDG - 0.3% (deterministic address)
    minimumEthLocked: 0.5,
  },
};
