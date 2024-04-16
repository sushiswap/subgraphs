const NATIVE_ADDRESS = '0x60e1773636cf5e4a227d9ac24f20feca034ee25a'
const USDC_ADDRESS = '0xeb466342c4d449bc9f53a865d5cb90586f405215'
const DAI_ADDRESS = '0x5c7e299cf531eb66f2a1df637d37abb78e6200c7'
const CEUSDC_ADDRESS = '0x2421db204968a367cc2c866cd057fa754cb84edf'
const AXLETH_ADDRESS = '0xb829b68f57cc546da7e5806a929e53be32a4625d'
const STFIL_ADDRESS = '0x3c3501e6c353dbaeddfa90376975ce7ace4ac7a8'
const RSPD_ADDRESS = '0x97aae66a1d2a41eac573397b7a5656a9cf3e5616'
module.exports = {
  network: 'mainnet',
  blocks: {
    address: '0x719e14fcb364bb05649bd525eb6c4a2d0d4ea2b7',
    startBlock: 2867000,
  },
  v2: {
    nativeAddress: NATIVE_ADDRESS,
    whitelistAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
      USDC_ADDRESS,
      DAI_ADDRESS,
      CEUSDC_ADDRESS,
      AXLETH_ADDRESS,
      STFIL_ADDRESS,
      RSPD_ADDRESS
    ],
    stable0: USDC_ADDRESS,
    stable1: CEUSDC_ADDRESS,
    stable2: DAI_ADDRESS,
    minimumNativeLiquidity: 250,
    factory: {
      address: '0x9b3336186a38e1b6c21955d112dbb0343ee061ee',
      initCodeHash: '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
      startBlock: 3328632,
    }
  },
  v3: {
    factory: { // 0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6
      address: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
      startBlock: 2867560,
    },
    positionManager: {
      address: '0xf4d73326c13a4fc5fd7a064217e12780e9bd62c3',
      startBlock: 2868037,
    },
    native: { address: NATIVE_ADDRESS },
    whitelistedTokenAddresses: [
      NATIVE_ADDRESS,
      USDC_ADDRESS,
      DAI_ADDRESS,
      CEUSDC_ADDRESS,
      AXLETH_ADDRESS,
      STFIL_ADDRESS,
      RSPD_ADDRESS
    ],
    stableTokenAddresses: [USDC_ADDRESS, DAI_ADDRESS],
    nativePricePool: '0x1d1375281265e4dd496d90455f7c82f4fbd85cc2',
    minimumEthLocked: 250
  },
  legacy: {
    native: { address: NATIVE_ADDRESS },
    whitelistedTokenAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
      USDC_ADDRESS,
      DAI_ADDRESS,
    ],
    stableTokenAddresses: [USDC_ADDRESS, DAI_ADDRESS],
    minimumNativeLiquidity: 250,
    factory: {
      address: '0x9b3336186a38e1b6c21955d112dbb0343ee061ee',
      initCodeHash: '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
      startBlock: 3328632,
    },
  },
}
