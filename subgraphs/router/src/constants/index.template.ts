import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts'


export const BIG_DECIMAL_1E18 = BigDecimal.fromString('1e18')
export const ADDRESS_ZERO = Address.fromString('0x0000000000000000000000000000000000000000')

export const ROUTER_ADDRESS = Address.fromString('{{ router.address }}')

export const BIG_INT_ZERO = BigInt.fromI32(0)
export const BIG_DECIMAL_ZERO = BigDecimal.fromString('0')
export const BIG_DECIMAL_ONE = BigDecimal.fromString('1')
export const BIG_INT_ONE = BigInt.fromI32(1)
