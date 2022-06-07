module.exports = {
  network: 'xdai',
  bentobox: {
    address: '0xf5bce5077908a1b7370b9ae04adc565ebd643966',
    startBlock: 15157559,
  },
  legacy: {
    factory: {
      address: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
      startBlock: 14735904,
    },
  },
  furo: {
    stream: { address: '0x4ab2fc6e258a0ca7175d05ff10c5cf798a672cae', startBlock: 22535727 },
    vesting: { address: '0x0689640d190b10765f09310fcfe9c670ede4e25b', startBlock: 22535744 },
  },
  auctionMaker: { address: '0x0000000000000000000000000000000000000000', startBlock: 0 },
  staking: { address: '0x0000000000000000000000000000000000000000', startBlock: 0 },
  blocks: {
    address: '0x0000000000000000000000000000000000000000',
    startBlock: 0,
  },
}
