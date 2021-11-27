module.exports = {
  network: 'kovan',
  native: { address: '0xd0A1E359811322d97991E03f863a0C30C2cF029C' },
  sushi: { address: '0x0769fd68dFb93167989C6f7254cd0D766Fb2841F' },
  weth: { address: '0xd0A1E359811322d97991E03f863a0C30C2cF029C' },
  bentobox: { address: '0xc381a85ed7C7448Da073b7d6C9d4cBf1Cbf576f0', startBlock: 27205233 },
  masterDeployer: { address: '0xBe8bdb5A8341808e4665207C77B76aDC30598EAE', startBlock: 27660363 },
  concentratedLiquidityPoolFactory: { address: '0x0000000000000000000000000000000000000000' },
  constantProductPoolFactory: { address: '0x390591f8F68d86068ABD965a43fAB61d5d3A0f12' },
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
    // USDC/WETH
    // '0x1f5e6df7499b6159dd74854d94fd97c409f8d04b',
    // DAI/WETH
    '0x7e199cb3b5a92ad4b4b386543e09b433de99ee33',
  ],
}
