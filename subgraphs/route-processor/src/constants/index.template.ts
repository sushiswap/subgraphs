import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts'

export const RouteProcessor_ADDRESS = Address.fromString('{{ routeprocessor.address }}')
export const ZERO_ADDRESS = Address.fromString('0x0000000000000000000000000000000000000000')

export const BIG_INT_ZERO = BigInt.fromI32(0)
export const BIG_DECIMAL_ZERO = BigDecimal.fromString('0')
export const BIG_DECIMAL_ONE = BigDecimal.fromString('1')
export const BIG_INT_ONE = BigInt.fromI32(1)