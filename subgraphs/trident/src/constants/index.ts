import { Address, BigDecimal, ByteArray, Bytes, crypto } from '@graphprotocol/graph-ts'

class CombinateReturn {
  tokens: string[]
  fee: number
  oracle: boolean
}

function combinate(stables: string[], native: string, oracles: boolean[], fees: number[]): CombinateReturn[] {
  const combinations: CombinateReturn[] = []

  for (let stable = 0; stable < stables.length; stable++) {
    for (let oracle = 0; oracle < oracles.length; oracle++) {
      for (let fee = 0; fee < fees.length; fee++) {
        combinations.push({ tokens: [stables[stable], native].sort(), oracle: oracles[oracle], fee: fees[fee] })
      }
    }
  }

  return combinations
}

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

export const MASTER_DEPLOYER_ADDRESS = Address.fromString('0xcaabdd9cf4b61813d4a52f980d6bc1b713fe66f5')

export const CONSTANT_PRODUCT_POOL_FACTORY_ADDRESS = Address.fromString('0x93395129bd3fcf49d95730d3c2737c17990ff328')

export const HYBRID_POOL_FACTORY_ADDRESS = Address.fromString('0x0000000000000000000000000000000000000000')

export const INDEX_POOL_FACTORY_ADDRESS = Address.fromString('0x0000000000000000000000000000000000000000')

export const CONCENTRATED_LIQUIDITY_POOL_FACTORY_ADDRESS = Address.fromString(
  '0x0000000000000000000000000000000000000000'
)

export const NATIVE_ADDRESS = '0x4200000000000000000000000000000000000006'

export const WHITELISTED_TOKEN_ADDRESSES: string[] = '0x4200000000000000000000000000000000000006,0x68f180fcce6836688e9084f035309e29bf0a2095,0x7f5c764cbc14f9669b88837ca1490cca17c31607,0x94b008aa00579c1307b0ef2c499ad98a8ce58e58,0xda10009cbd5d07dd0cecc66161fc93d7c9000da1'.split(',')

export const STABLE_TOKEN_ADDRESSES: string[] = '0x7f5c764cbc14f9669b88837ca1490cca17c31607,0x94b008aa00579c1307b0ef2c499ad98a8ce58e58,0xda10009cbd5d07dd0cecc66161fc93d7c9000da1'.split(',')

export const STABLE_POOL_ADDRESSES: string[] = '0x1e31a2c6e6614273d740358affb46bef180efb7b'.split(',')

const STABLE_POOL_PERMUTATIONS = combinate(STABLE_TOKEN_ADDRESSES, NATIVE_ADDRESS, [true, false], [1, 5, 10, 30, 100])

// export const STABLE_POOL_ADDRESSES: string[] = STABLE_POOL_PERMUTATIONS.map<string>((perm: CombinateReturn) => {
//   return getCreate2Address(
//     Bytes.fromByteArray(Bytes.fromHexString('0x93395129bd3fcf49d95730d3c2737c17990ff328')),
//     Bytes.fromByteArray(
//       crypto.keccak256(
//         ByteArray.fromHexString(
//           '0x' +
//             perm.tokens[0].slice(2).padStart(32, '0') +
//             perm.tokens[1].slice(2).padStart(32, '0') +
//             perm.fee.toString(16).padStart(32, '0') +
//             (+perm.oracle).toString(16).padStart(32, '0')
//         )
//       )
//     ),
//     Bytes.fromByteArray(Bytes.fromHexString('0x3172d82413be467c1130709f7479a07def9b99caf8e0059f248c131081e4ea09'))
//   ).toHex()
// })

// Minimum liqudiity threshold in native currency
export const MINIMUM_NATIVE_LIQUIDITY = BigDecimal.fromString('0.01')

export * from './id'
export * from './time'
