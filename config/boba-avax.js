const NATIVE_ADDRESS = '0x26c319b7b2cf823365414d082698c8ac90cbba63' // BOBA
const USDC_ADDRESS = '0x12bb1a120dcf8cb7152edac9f04d176dd7f41f7e'
const USDC_E_ADDRESS = '0x126969743a6d300bab08f303f104f0f7dbafbe20'
const BUSD_ADDRESS = '0x87e062de99ed71af9b22dda63e1b6d43333798f8'
const BUSD_E_ADDRESS = '0xb8b0034cfd89925944c07ac6ccb2834d1774cfb6'
const USDT_ADDRESS = '0xfaa13d82756f1e0e4dec9416b83121db3fc35199'
const USDT_E_ADDRESS = '0x4ed96c1dc969d7e2310d9582a68c39556c005912'
const DAI_E_ADDRESS = '0x69b7d24f0e03ff21949081c95da7288fea5c844d'

module.exports = {
  network: 'boba-avax',
  native: { address: NATIVE_ADDRESS },
  legacy: {
    native: { address: NATIVE_ADDRESS },
    whitelistedTokenAddresses: [
      // IMPORTANT! Native should be included here
      NATIVE_ADDRESS,
      USDC_ADDRESS,
      USDC_E_ADDRESS,
      BUSD_ADDRESS,
      BUSD_E_ADDRESS,
      USDT_ADDRESS,
      USDT_E_ADDRESS,
      DAI_E_ADDRESS,
    ],
    stableTokenAddresses: [
      USDC_ADDRESS,
      USDC_E_ADDRESS,
      BUSD_ADDRESS,
      BUSD_E_ADDRESS,
      USDT_ADDRESS,
      USDT_E_ADDRESS,
      DAI_E_ADDRESS,
    ],
    minimumNativeLiquidity: 3000,
    factory: {
      address: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
      initCodeHash: '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
      startBlock: 3568,
    },
  },
  blocks: {
    address: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
    startBlock: 0,
  }
}
