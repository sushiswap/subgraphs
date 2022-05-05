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

export const MASTER_DEPLOYER_ADDRESS = Address.fromString('{{ masterDeployer.address }}')

export const CONSTANT_PRODUCT_POOL_FACTORY_ADDRESS = Address.fromString('{{ constantProductPoolFactory.address }}')

export const HYBRID_POOL_FACTORY_ADDRESS = Address.fromString('{{ hybridPoolFactory.address }}')

export const INDEX_POOL_FACTORY_ADDRESS = Address.fromString('{{ indexPoolFactory.address }}')

export const CONCENTRATED_LIQUIDITY_POOL_FACTORY_ADDRESS = Address.fromString(
  '{{ concentratedLiquidityPoolFactory.address }}'
)

export const NATIVE_ADDRESS = '{{ native.address }}'

export const WHITELISTED_TOKEN_ADDRESSES: string[] = '{{ whitelistedTokenAddresses }}'.split(',')

export const STABLE_TOKEN_ADDRESSES: string[] = '{{ stableTokenAddresses }}'.split(',')

// const STABLE_POOL_PERMUTATIONS = combinate({
//   token0: STABLE_TOKEN_ADDRESSES,
//   token1: STABLE_TOKEN_ADDRESSES,
//   oracle: [true, false],
//   fee: [1, 5, 10, 30, 100],
// })

// export const STABLE_POOL_ADDRESSES: string[] = STABLE_TOKEN_ADDRESSES.map<string>((address: string) => {
//   const tokens: string[] = [address, NATIVE_ADDRESS].sort()
//   return getCreate2Address(
//     Bytes.fromByteArray(Bytes.fromHexString('{{ constantProductPoolFactory.address }}')),
//     Bytes.fromByteArray(crypto.keccak256(ByteArray.fromHexString('0x' + tokens[0].slice(2) + tokens[1].slice(2)))),
//     Bytes.fromByteArray(Bytes.fromHexString('{{ constantProductPoolFactory.initCodeHash }}'))
//   ).toHex()
// })

export const STABLE_POOL_ADDRESSES: string[] = '{{ stablePoolAddresses }}'.split(',')

// Minimum liqudiity threshold in native currency
export const MINIMUM_NATIVE_LIQUIDITY = BigDecimal.fromString('{{ minimumNativeLiquidity }}')

export * from './id'
export * from './time'
