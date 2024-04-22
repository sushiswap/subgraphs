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

export function generatePoolAddress(token0: string, token1: string, factoryAddress: string): string {
  const tokens = [token0, token1].sort()
  const address = getCreate2Address(
    Bytes.fromByteArray(Bytes.fromHexString(factoryAddress)),
    Bytes.fromByteArray(crypto.keccak256(ByteArray.fromHexString('0x' + tokens[0].slice(2) + tokens[1].slice(2)))),
    Bytes.fromByteArray(Bytes.fromHexString('{{ v2.factory.initCodeHash }}'))
  ).toHex()
  return Address.fromString(address).toHex().toLowerCase()
}

export const NATIVE_ADDRESS = '{{ v2.nativeAddress }}'
export const WHITELIST: string[] = '{{ v2.whitelistAddresses }}'.toLowerCase().split(',')

export const STABLE0_NATIVE_PAIR = generatePoolAddress('{{ v2.stable0 }}'.toLowerCase(), NATIVE_ADDRESS, '{{ v2.factory.address }}')
export const STABLE1_NATIVE_PAIR = generatePoolAddress('{{ v2.stable1 }}'.toLowerCase(), NATIVE_ADDRESS, '{{ v2.factory.address }}')
export const STABLE2_NATIVE_PAIR = generatePoolAddress('{{ v2.stable2 }}'.toLowerCase(), NATIVE_ADDRESS, '{{ v2.factory.address }}')

export const NETWORK = '{{ network }}'

export const MINIMUM_LIQUIDITY_THRESHOLD_ETH = BigDecimal.fromString('{{ v2.minimumNativeLiquidity }}')

export const FACTORY_ADDRESS = Address.fromString('{{ v2.factory.address }}').toHex().toLowerCase()