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

export function getCreate2Address(from: Bytes, salt: String, initCodeHash: Bytes): Bytes {
  return Bytes.fromHexString(
    Bytes.fromByteArray(
      crypto.keccak256(
        Bytes.fromHexString('0xff' + from.toHexString().slice(2) + salt.slice(2) + initCodeHash.toHexString().slice(2))
      )
    )
      .toHexString()
      .slice(26)
  ) as Bytes
}

export const ADDRESS_ZERO = Address.fromString('0x0000000000000000000000000000000000000000')

export const MASTER_DEPLOYER_ADDRESS = Address.fromString('{{ trident.masterDeployer.address }}')

export const CONSTANT_PRODUCT_POOL_FACTORY_ADDRESS = Address.fromString(
  '{{ trident.constantProductPoolFactory.address }}'
)

export const HYBRID_POOL_FACTORY_ADDRESS = Address.fromString(
  '{{ trident.hybridPoolFactory.address }}{{^trident.hybridPoolFactory.address}}0x0000000000000000000000000000000000000000{{/trident.hybridPoolFactory.address}}'
)

export const INDEX_POOL_FACTORY_ADDRESS = Address.fromString(
  '{{ trident.indexPoolFactory.address }}{{^trident.indexPoolFactory.address}}0x0000000000000000000000000000000000000000{{/trident.indexPoolFactory.address}}'
)

export const CONCENTRATED_LIQUIDITY_POOL_FACTORY_ADDRESS = Address.fromString(
  '{{ trident.concentratedLiquidityPoolFactory.address }}{{^trident.concentratedLiquidityPoolFactory.address}}0x0000000000000000000000000000000000000000{{/trident.concentratedLiquidityPoolFactory.address}}'
)

export const NATIVE_ADDRESS = '{{ trident.native.address }}'

export const WHITELISTED_TOKEN_ADDRESSES: string[] = '{{ trident.whitelistedTokenAddresses }}'.split(',')

export const STABLE_TOKEN_ADDRESSES: string[] = '{{ trident.stableTokenAddresses }}'.split(',')

const STABLE_POOL_PERMUTATIONS = combinate(STABLE_TOKEN_ADDRESSES, NATIVE_ADDRESS, [false, true], [1, 5, 10, 30, 100])

export const STABLE_POOL_ADDRESSES: string[] = STABLE_POOL_PERMUTATIONS.map<string>((perm: CombinateReturn) => {
  const factory = Bytes.fromByteArray(Bytes.fromHexString('{{ trident.constantProductPoolFactory.address }}'))
  const token0 = perm.tokens[0].slice(2).padStart(64, '0')
  const token1 = perm.tokens[1].slice(2).padStart(64, '0')
  const fee = (perm.fee as i32).toString(16).padStart(64, '0')
  const oracle = (+perm.oracle as i32).toString(16).padStart(64, '0')
  const keccak = crypto.keccak256(ByteArray.fromHexString('0x' + token0 + token1 + fee + oracle)).toHex()
  const initCodeHash = Bytes.fromByteArray(Bytes.fromHexString('{{ trident.constantProductPoolFactory.initCodeHash }}'))

  return getCreate2Address(factory, keccak, initCodeHash).toHex()
})

// ENABLE FOR POLYGON
// export const STABLE_POOL_ADDRESSES: string[] = '{{ trident.stablePoolAddresses }}'.split(',')

// Minimum liqudiity threshold in native currency
export const MINIMUM_NATIVE_LIQUIDITY = BigDecimal.fromString('{{ trident.minimumNativeLiquidity }}')

export * from './id'
export * from './time'
