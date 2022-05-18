module.exports = {
  network: 'goerli',
  legacy: {
    factory: {
      address: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
      startBlock: 4345820,
    },
  },
  furo: {
    stream: { address: '0x43d824309Cd23C064C0D9740f1dC37078b91ADdA', startBlock: 6906466 },
    vesting: { address: '0x23645e242ace2b84a7703cd5ece3c93b1e5cb5ed', startBlock: 6902133 },
  },
  auctionMaker: { address: '0x0000000000000000000000000000000000000000', startBlock: 0 },
  staking: { address: '0x0000000000000000000000000000000000000000', startBlock: 0 },
  blocks: {
    address: '0x0000000000000000000000000000000000000000',
    startBlock: 0,
  },
}
