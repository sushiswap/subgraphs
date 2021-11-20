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
  array: [
    // ...
    '0x0000000000000000000000000000000000000000',
    // ...
    '0x0000000000000000000000000000000000000000',
    // ...
    '0x0000000000000000000000000000000000000000',
  ],
  stableTokenAddresses: [
    // USDC
    '0xb7a4F3E9097C08dA09517b5aB877F7a917224ede',
    // USDT
    '0x07de306FF27a2B630B1141956844eB1552B956B5',
    // DAI
    '0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa',
  ],
  // List of STABLE/NATIVE pools to use to price NATIVE in USD
  stablePoolAddresses: [
    // USDC/WETH
    '0x1f5e6df7499b6159dd74854d94fd97c409f8d04b',
    // DAI/WETH
    '0x7e199cb3b5a92ad4b4b386543e09b433de99ee33',
  ],
}
