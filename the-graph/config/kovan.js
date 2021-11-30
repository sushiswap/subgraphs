module.exports = {
  network: 'kovan',
  native: { address: '0xd0a1e359811322d97991e03f863a0c30c2cf029c' },
  sushi: { address: '0x0769fd68dfb93167989c6f7254cd0d766fb2841f' },
  weth: { address: '0xd0a1e359811322d97991e03f863a0c30c2cf029c' },
  bentobox: { address: '0xc381a85ed7C7448Da073b7d6C9d4cBf1Cbf576f0', startBlock: 27205233 },
  masterDeployer: { address: '0xdCFaae69E67E4bA73d5A890Fcae097eB3C615e96', startBlock: 28497203 },
  concentratedLiquidityPoolFactory: { address: '0x0000000000000000000000000000000000000000' },
  constantProductPoolFactory: { address: '0xde87A91358FE9C2506290cA21E81438Cd9543d58' },
  hybridPoolFactory: { address: '0x0000000000000000000000000000000000000000' },
  indexPoolFactory: { address: '0x0000000000000000000000000000000000000000' },
  whitelistedTokenAddresses: [
    // WETH
    '0xd0a1e359811322d97991e03f863a0c30c2cf029c',
    // USDC
    '0xb7a4f3e9097c08da09517b5ab877f7a917224ede',
    // USDT
    '0x07de306ff27a2b630b1141956844eb1552b956b5',
    // DAI
    '0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa',
  ],
  stableTokenAddresses: [
    // USDC
    '0xb7a4f3e9097c08da09517b5ab877f7a917224ede',
    // USDT
    '0x07de306ff27a2b630b1141956844eb1552b956b5',
    // DAI
    '0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa',
  ],
  // List of STABLE/NATIVE pools to use to price NATIVE in USD
  stablePoolAddresses: [
    // DAI/WETH
    '0xc8a7e855f8623faed410a5d4122202fe18783255',

    // USDC/WETH
    '0xc1f60ef13dd52904465746e87a9becacfe76621a',
  ],
}
