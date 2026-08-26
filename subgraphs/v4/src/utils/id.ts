import { Address, BigInt, Bytes } from '@graphprotocol/graph-ts'

export function positionId(tokenId: BigInt): string {
  return tokenId.toString()
}

export function eventId(transactionHash: Bytes, logIndex: BigInt): string {
  return `${transactionHash.toHexString()}-${logIndex.toString()}`
}

export function poolKeyId(token0: Address, token1: Address, fee: BigInt, parameters: Bytes, hooks: Address): string {
  return `${token0.toHexString()}-${token1.toHexString()}-${fee.toString()}-${parameters.toHexString()}-${hooks.toHexString()}`
}
