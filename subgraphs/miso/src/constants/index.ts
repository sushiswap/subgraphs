import { Address, BigInt } from '@graphprotocol/graph-ts'

export const ADDRESS_ZERO = Address.fromString('0x0000000000000000000000000000000000000000')

export const ACCESS_CONTROLS_ADDRESS = Address.fromString('0xc35dadb65012ec5796536bd9864ed8773abc74c4')

export const CROWDSALE_AUCTION_TEMPLATE_ID = BigInt.fromI32(1)
export const DUTCH_AUCTION_TEMPLATE_ID = BigInt.fromI32(2)
export const BATCH_AUCTION_TEMPLATE_ID = BigInt.fromI32(3)
export const HYPERBOLIC_AUCTION_TEMPLATE_ID = BigInt.fromI32(4)



export namespace AuctionType {
    export const CROWDSALE = "CROWDSALE"
    export const DUTCH = "DUTCH"
    export const BATCH = "BATCH"
    export const HYBERBOLIC = "HYBERBOLIC"
  }

export * from './roles'