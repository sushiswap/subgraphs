module.exports = {
  network: 'goerli',
  legacy: {
    factory: {
      address: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
      startBlock: 4345820,
    },
  },
  furo: {
    stream: { address: '0xDDc2C7dd0578b06F708aAf7Fd10765F7e1b98156', startBlock: 6805124 },
    vesting: { address: '0x08A10f7D99a8a0b53EfBFC61DE1aADEF26473061', startBlock: 6805116 },
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
