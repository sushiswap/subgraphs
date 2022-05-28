module.exports = {
  network: 'goerli',
  legacy: {
    factory: {
      address: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
      startBlock: 4345820,
    },
  },
  furo: {
    stream: { address: '0x3C4bc596C4946d812D0eA77940038576f228faC7', startBlock: 6929553 },
    vesting: { address: '0x344b7c97f1142d6743d9e5C38E81eCe46eAb68BA', startBlock: 6947498 },
  },
  auctionMaker: { address: '0x0000000000000000000000000000000000000000', startBlock: 0 },
  staking: { address: '0x0000000000000000000000000000000000000000', startBlock: 0 },
  blocks: {
    address: '0x0000000000000000000000000000000000000000',
    startBlock: 0,
  },
  furo: {
    stream: { address: '0x4f74b61f78179da88c9507955d0d97cf3b486ca5', startBlock: 6954808 },
    vesting: { address: '0x593453768ba2163eae6d0fa1f3d292c02672a2ba', startBlock: 6954838 },
  },
}
