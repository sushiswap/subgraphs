import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts'


export const SUSHI_TOKEN_ADDRESS = Address.fromString('{{ sushi.address }}')
export const COMPLEX_REWARDER = Address.fromString('{{ minichef.rewarder.complex.address }}')
export const COMPLEX_REWARDER_TOKEN = Address.fromString('{{ minichef.rewarder.complex.rewardToken.address }}')
export const ZERO_ADDRESS = Address.fromString('0x0000000000000000000000000000000000000000')


export const ACC_SUSHI_PRECISION = BigInt.fromString('1000000000000')

export const BIG_INT_ZERO = BigInt.fromI32(0)
export const BIG_DECIMAL_ZERO = BigDecimal.fromString('0')
export const BIG_DECIMAL_ONE = BigDecimal.fromString('1')
export const BIG_INT_ONE = BigInt.fromI32(1)