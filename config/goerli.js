module.exports = {
  network: 'goerli',
  legacy: {
    factory: {
      address: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
      startBlock: 4345820,
    },
  },
  furo: {
    stream: { address: '0x9C87d6A9d88347e90c1Bfdee334B41aBf5c4A079', startBlock: 6910665 },
    vesting: { address: '0x4F8DbAD53016439B31F78AdC8E6c49e3CAbbA0f0', startBlock: 6910687 },
  },
  auctionMaker: { address: '0x0000000000000000000000000000000000000000', startBlock: 0 },
  staking: { address: '0x0000000000000000000000000000000000000000', startBlock: 0 },
  blocks: {
    address: '0x0000000000000000000000000000000000000000',
    startBlock: 0,
  },
}
