import { Address, BigDecimal, ByteArray, Bytes, crypto, ethereum } from '@graphprotocol/graph-ts'

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

export const FACTORY_ADDRESS = Address.fromString('0xc35DADB65012eC5796536bD9864eD8773aBc74C4')

export const NATIVE_ADDRESS = '0xacc15dc74880c9944775448304b263d191c6077f'

export const WHITELISTED_TOKEN_ADDRESSES: string[] = '0xAcc15dC74880C9944775448304B263D191c6077F,0x30D2a9F5FDf90ACe8c17952cbb4eE48a55D916A7,0x8f552a71EFE5eeFc207Bf75485b356A0b3f01eC9,0x8e70cD5B4Ff3f62659049e74b6649c6603A0E594,0xc234A67a4F840E61adE794be47de455361b52413,0x1DC78Acda13a8BC4408B207c9E48CDBc096D95e0,0x085416975fe14C2A731a97eC38B9bF8135231F62,0x322E86852e492a7Ee17f28a78c663da38FB33bfb'.split(',')

export const STABLE_TOKEN_ADDRESSES: string[] = '0x8f552a71efe5eefc207bf75485b356a0b3f01ec9,0x8e70cd5b4ff3f62659049e74b6649c6603a0e594,0xc234a67a4f840e61ade794be47de455361b52413,0x085416975fe14c2a731a97ec38b9bf8135231f62,0x322e86852e492a7ee17f28a78c663da38fb33bfb'.split(',')

export const STABLE_POOL_ADDRESSES: string[] = STABLE_TOKEN_ADDRESSES.map<string>((address: string) => {
  const tokens: string[] = [address, NATIVE_ADDRESS].sort()
  return getCreate2Address(
    Bytes.fromByteArray(Bytes.fromHexString('0xc35DADB65012eC5796536bD9864eD8773aBc74C4')),
    Bytes.fromByteArray(crypto.keccak256(ByteArray.fromHexString('0x' + tokens[0].slice(2) + tokens[1].slice(2)))),
    Bytes.fromByteArray(Bytes.fromHexString('0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303'))
  ).toHex()
})

// Minimum liqudiity threshold in native currency
export const MINIMUM_NATIVE_LIQUIDITY = BigDecimal.fromString('0.1')

// export const STABLE_POOL_ADDRESSES: string[] = ''.split(',')

export * from './time'
