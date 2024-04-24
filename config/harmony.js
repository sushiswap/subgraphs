const NATIVE_ADDRESS = '0xcf664087a5bb0237a0bad6742852ec6c8d69a27a'
const WETH_ADDRESS = '0x6983d1e6def3690c4d616b13597a09e6193ea013'
const WBTC_ADDRESS = '0x3095c7557bcb296ccc6e363de01b760ba031f2d9'
const USDC_ADDRESS = '0x985458e523db3d53125813ed68c274899e9dfab4'
const USDT_ADDRESS = '0x3c2b8be99c50593081eaa2a724f0b8285f5aba8f'
const BUSD_ADDRESS = '0xe176ebe47d621b984a73036b9da5d834411ef734'
const DAI_ADDRESS = '0xef977d2f931c1978db5f6747666fa1eacb0d0339'
const FRAX_ADDRESS = '0xfa7191d292d5633f702b0bd7e3e3bccc0e633200'
const USDC_2_ADDRESS = '0xbc594cabd205bd993e7ffa6f3e9cea75c1110da5'
const USDT_2_ADDRESS = '0x9a89d0e1b051640c6704dde4df881f73adfef39a'
const DAI_2_ADDRESS = '0x1d374ed0700a0ad3cd4945d66a5b1e08e5db20a8'
module.exports = {
  network: 'harmony',
  miso: {
    accessControls: { address: '0x863956314860f86f8B45da47c93637af09addB01', startBlock: 22978623 },
    market: { address: '0x00bF5E70805038245BE24fA95164Ca9Dc3791fA4', startBlock: 22981443 },
  },
  furo: {
    stream: { address: '0x4ab2fc6e258a0ca7175d05ff10c5cf798a672cae', startBlock: 27490820 },
    vesting: { address: '0x0689640d190b10765f09310fcfe9c670ede4e25b', startBlock: 27490879 },
  },
  auctionMaker: { address: '0x0000000000000000000000000000000000000000', startBlock: 0 },
  staking: { address: '0x0000000000000000000000000000000000000000', startBlock: 0 },
  blocks: {
    address: '0x0000000000000000000000000000000000000000',
    startBlock: 0,
  },

  legacy: {
    // IMPORTANT! Native should be included here
    native: { address: NATIVE_ADDRESS },
    whitelistedTokenAddresses: [
      NATIVE_ADDRESS,
      WETH_ADDRESS,
      WBTC_ADDRESS,
      USDC_ADDRESS,
      USDT_ADDRESS,
      BUSD_ADDRESS,
      DAI_ADDRESS,
      FRAX_ADDRESS
    ],
    stableTokenAddresses: [USDC_ADDRESS, USDT_ADDRESS, BUSD_ADDRESS, DAI_ADDRESS, FRAX_ADDRESS],
    minimumNativeLiquidity: 50000,
    factory: {
      address: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
      initCodeHash: '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
      startBlock: 11256061,
    },
  },
  v2: {
    nativeAddress: NATIVE_ADDRESS,
    whitelistAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
      WETH_ADDRESS,
      WBTC_ADDRESS,
      USDC_ADDRESS,
      USDT_ADDRESS,
      BUSD_ADDRESS,
      DAI_ADDRESS,
      FRAX_ADDRESS,
      USDC_2_ADDRESS,
      USDT_2_ADDRESS,
      DAI_2_ADDRESS,
    ],
    // INITITAL STABLE TOKENS
    stable0: USDC_ADDRESS,
    stable1: USDT_ADDRESS,
    stable2: DAI_ADDRESS,
    // TODO: GRAFT AT 27500000, update config
    // stable0: USDC_2_ADDRESS,
    // stable1: USDT_2_ADDRESS,
    // stable2: DAI_2_ADDRESS,
    minimumNativeLiquidity: 30000,
    factory: {
      address: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
      initCodeHash: '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
      startBlock: 11256061, 
    }
  },  
  blocks: {
    graft: {
      base: 'QmazoaxzhVAZybLFy56Pc24mtj5yN1oaDWfXmG5a4vySgm',
      startBlock: 56638762,
    },
    address: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
    startBlock: 11256061,
  },
  bentobox: {
    address: '0xa28cff72b04f83a7e3f912e6ad34d5537708a2c2',
    startBlock: 18507285,
  },
  xswap: {
    address: '0x0000000000000000000000000000000000000000',
    startBlock: 0,
  }
}
