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

export const MASTER_DEPLOYER_ADDRESS = Address.fromString('0x351447fc9bd20a917783e159e61e86edda0b0187')

export const CONSTANT_PRODUCT_POOL_FACTORY_ADDRESS = Address.fromString('0x05689fcfee31fce4a67fbc7cab13e74f80a4e288')

export const HYBRID_POOL_FACTORY_ADDRESS = Address.fromString('0x0000000000000000000000000000000000000000')

export const INDEX_POOL_FACTORY_ADDRESS = Address.fromString('0x0000000000000000000000000000000000000000')

export const CONCENTRATED_LIQUIDITY_POOL_FACTORY_ADDRESS = Address.fromString(
  '0x0000000000000000000000000000000000000000'
)

export const NATIVE_ADDRESS = '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270'

export const WHITELISTED_TOKEN_ADDRESSES: string[] = '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270,0x7ceb23fd6bc0add59e62ac25578270cff1b9f619,0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6,0x2791bca1f2de4661ed88a30c99a7a9449aa84174,0xc2132d05d31c914a87c6611c10748aeb04b58e8f,0x8f3cf7ad23cd3cadbd9735aff958023239c6a063'.split(',')

export const STABLE_TOKEN_ADDRESSES: string[] = '0x2791bca1f2de4661ed88a30c99a7a9449aa84174,0xc2132d05d31c914a87c6611c10748aeb04b58e8f,0x8f3cf7ad23cd3cadbd9735aff958023239c6a063'.split(',')

// const STABLE_POOL_PERMUTATIONS = combinate({
//   token0: STABLE_TOKEN_ADDRESSES,
//   token1: STABLE_TOKEN_ADDRESSES,
//   oracle: [true, false],
//   fee: [1, 5, 10, 30, 100],
// })

// export const STABLE_POOL_ADDRESSES: string[] = STABLE_TOKEN_ADDRESSES.map<string>((address: string) => {
//   const tokens: string[] = [address, NATIVE_ADDRESS].sort()
//   return getCreate2Address(
//     Bytes.fromByteArray(Bytes.fromHexString('0x05689fcfee31fce4a67fbc7cab13e74f80a4e288')),
//     Bytes.fromByteArray(crypto.keccak256(ByteArray.fromHexString('0x' + tokens[0].slice(2) + tokens[1].slice(2)))),
//     Bytes.fromByteArray(Bytes.fromHexString(''))
//   ).toHex()
// })

export const STABLE_POOL_ADDRESSES: string[] = '0xd5ed08fdedd447a3172449e6d4e2e5265157e6a3,0x699e820323dd5e51b243003ef74ac812b7f280ed,0x25d8dfef6f432eb0f7db0b9f61fef352f08b1979,0x1bd908569c1157417abae2ed3de3cb04c734b984'.split(',')

// Minimum liqudiity threshold in native currency
export const MINIMUM_NATIVE_LIQUIDITY = BigDecimal.fromString('1000')

export * from './id'
export * from './time'
