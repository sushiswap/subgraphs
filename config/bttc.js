const NATIVE_ADDRESS = '0x0000000000000000000000000000000000001010'
const TRON_ADDRESS = '0xedf53026aea60f8f75fca25f8830b7e2d6200662'
const BNB_ADDRESS = '0x185a4091027e2db459a2433f85f894dc3013aeb5'

const USDT_B_ADDRESS = '0x9b5f27f6ea9bbd753ce3793a07cba3c74644330d'
const USDT_T_ADDRESS = '0xdb28719f7f938507dbfe4f0eae55668903d34a15'
const USDT_E_ADDRESS = '0xe887512ab8bc60bcc9224e1c3b5be68e26048b8b'

const USDC_B_ADDRESS = '0xca424b845497f7204d9301bd13ff87c0e2e86fcf'
const USDC_T_ADDRESS = '0x935faa2fcec6ab81265b301a30467bbc804b43d3'
const USDC_E_ADDRESS = '0xae17940943ba9440540940db0f1877f101d39e8b'

const USDD_T_ADDRESS = '0x17f235fd5974318e4e2a5e37919a209f7c37a6d1'

const WETH_ADDRESS = '0x1249c65afb11d179ffb3ce7d4eedd1d9b98ad006'

module.exports = {
  network: 'bttc',
  auctionMaker: { address: '0x0000000000000000000000000000000000000000', startBlock: 0 },
  bentobox: {
    address: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
    base: '',
    startBlock: 13009215,
  },
  blocks: {
    address: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
    startBlock: 13009215,
  },
  trident: {
    bentobox: {
      address: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
      startBlock: 13009215,
    },
    masterDeployer: { address: '0x1b02da8cb0d097eb8d57a175b88c7d8b47997506', startBlock: 13009519 },
    concentratedLiquidityPoolFactory: { address: '0x0000000000000000000000000000000000000000' },
    constantProductPoolFactory: {
      address: '0x0769fd68dfb93167989c6f7254cd0d766fb2841f',
      initCodeHash: '0x3172d82413be467c1130709f7479a07def9b99caf8e0059f248c131081e4ea09',
      startBlock: 13009522
    },
    stablePoolFactory: { address: '0x0be808376ecb75a5cf9bb6d237d16cd37893d904' },
    hybridPoolFactory: { address: '0x0000000000000000000000000000000000000000' },
    indexPoolFactory: { address: '0x0000000000000000000000000000000000000000' },
    native: { address: NATIVE_ADDRESS },
    whitelistedTokenAddresses: [
      // WNATIVE - This is actually quite important, though uneeded here anymore since
      // it's now apart of the whitelisted token check in createPair, because the
      // base should always be whitelisted or pricing never begins.
      NATIVE_ADDRESS,
      WETH_ADDRESS,
      TRON_ADDRESS,
      BNB_ADDRESS,
      USDT_B_ADDRESS,
      USDT_T_ADDRESS,
      USDT_E_ADDRESS,
      USDC_B_ADDRESS,
      USDC_T_ADDRESS,
      USDC_E_ADDRESS,
      USDD_T_ADDRESS,
    ],
    stableTokenAddresses: [
      USDT_T_ADDRESS,
      USDC_B_ADDRESS,
      USDC_T_ADDRESS,
      USDC_E_ADDRESS,
      USDD_T_ADDRESS,
    ],
    minimumNativeLiquidity: '1000000000',
  },
  furo: {
    stream: { address: '0x0000000000000000000000000000000000000000', startBlock: 0 },
    vesting: { address: '0x0000000000000000000000000000000000000000', startBlock: 0 },
  },
  staking: { address: '0x0000000000000000000000000000000000000000', startBlock: 0 },
  xswap: {
    address: '0x0000000000000000000000000000000000000000',
    startBlock: 0,
  },
}
