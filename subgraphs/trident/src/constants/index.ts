import { Address, BigDecimal, ByteArray, Bytes, crypto } from '@graphprotocol/graph-ts'

export function getCreate2Address(from: Bytes, salt: Bytes, initCodeHash: Bytes): Bytes {
  return Bytes.fromHexString(
    Bytes.fromByteArray(
      crypto.keccak256(
        Bytes.fromHexString(
          '0xff' + from.toHexString().slice(2) + salt.toHexString().slice(2) + initCodeHash.toHexString().slice(2)
        )
      )
    )
      .toHexString()
      .slice(26)
  ) as Bytes
}

export const ADDRESS_ZERO = Address.fromString('0x0000000000000000000000000000000000000000')

export const MASTER_DEPLOYER_ADDRESS = Address.fromString('0x1b02da8cb0d097eb8d57a175b88c7d8b47997506')

export const CONSTANT_PRODUCT_POOL_FACTORY_ADDRESS = Address.fromString('0x0769fd68dfb93167989c6f7254cd0d766fb2841f')

export const HYBRID_POOL_FACTORY_ADDRESS = Address.fromString('0x0000000000000000000000000000000000000000')

export const INDEX_POOL_FACTORY_ADDRESS = Address.fromString('0x0000000000000000000000000000000000000000')

export const CONCENTRATED_LIQUIDITY_POOL_FACTORY_ADDRESS = Address.fromString(
  '0x0000000000000000000000000000000000000000'
)

export const NATIVE_ADDRESS = '0x4200000000000000000000000000000000000006'

export const WHITELISTED_TOKEN_ADDRESSES: string[] = '0x4200000000000000000000000000000000000006,0x68f180fcce6836688e9084f035309e29bf0a2095,0x7f5c764cbc14f9669b88837ca1490cca17c31607,0x94b008aa00579c1307b0ef2c499ad98a8ce58e58,0xda10009cbd5d07dd0cecc66161fc93d7c9000da1'.split(',')

export const STABLE_TOKEN_ADDRESSES: string[] = '0x7f5c764cbc14f9669b88837ca1490cca17c31607,0x94b008aa00579c1307b0ef2c499ad98a8ce58e58,0xda10009cbd5d07dd0cecc66161fc93d7c9000da1'.split(',')

// const STABLE_POOL_PERMUTATIONS = combinate({
//   token0: STABLE_TOKEN_ADDRESSES,
//   token1: STABLE_TOKEN_ADDRESSES,
//   oracle: [true, false],
//   fee: [1, 5, 10, 30, 100],
// })

// export const STABLE_POOL_ADDRESSES: string[] = STABLE_TOKEN_ADDRESSES.map<string>((address: string) => {
//   const tokens: string[] = [address, NATIVE_ADDRESS].sort()
//   return getCreate2Address(
//     Bytes.fromByteArray(Bytes.fromHexString('0x0769fd68dfb93167989c6f7254cd0d766fb2841f')),
//     Bytes.fromByteArray(crypto.keccak256(ByteArray.fromHexString('0x' + tokens[0].slice(2) + tokens[1].slice(2)))),
//     Bytes.fromByteArray(Bytes.fromHexString('0x953e4e8b8d75b1566b035158eb8f23be70b74bb4ff3eb020de19a926e0ebbd56'))
//   ).toHex()
// })

export const STABLE_POOL_ADDRESSES: string[] = '0xf74c68E33281e911415EEb9A032c4EF5197BB3F0,0xf1f284621a698d900cec56f5a9c2a14fd8119609'.split(',')

// Minimum liqudiity threshold in native currency
export const MINIMUM_NATIVE_LIQUIDITY = BigDecimal.fromString('0.01')

export * from './id'
export * from './time'
