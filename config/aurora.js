const NATIVE_ADDRESS = '0xc42c30ac6cc15fac9bd938618bcaa1a1fae8501d'
const WETH_ADDRESS = '0xc9bdeed33cd01541e1eed10f90519d2c06fe3feb'
const USDC_ADDRESS = '0xB12BFcA5A55806AaF64E99521918A4bf0fC40802'
const USDTE_ADDRESS = '0x4988a896b1227218e4A686fdE5EabdcAbd91571f'
const DAI_ADDRESS = '0xe3520349F477A5F6EB06107066048508498A291b'
const WBTC_ADDRESS = '0xF4eB217Ba2454613b15dBdea6e5f22276410e89e'

module.exports = {
  network: 'aurora',

  bentobox: {
    address: '0x0000000000000000000000000000000000000000',
    startBlock: 0,
  },
  kashi: {
    mediumRiskMasterContractAddresses: ['0x0000000000000000000000000000000000000000'],
  },
  legacy: {
    native: { address: NATIVE_ADDRESS },
    whitelistedTokenAddresses: [
      // IMPORTANT! The native address must be included for pricing to start
      NATIVE_ADDRESS,
      WETH_ADDRESS,
      USDC_ADDRESS,
      USDTE_ADDRESS,
      DAI_ADDRESS,
      WBTC_ADDRESS,
    ],
    stableTokenAddresses: [USDC_ADDRESS, USDTE_ADDRESS, DAI_ADDRESS],
    minimumNativeLiquidity: 3,
    minimum_usd_threshold_new_pairs: '3000',
    factory: {
      address: '0x0000000000000000000000000000000000000000',
      initCodeHash: '0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303',
      startBlock: 0,
    },
  }
}
