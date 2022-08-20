import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts'
export * from './time'

export const BIG_INT_ZERO = BigInt.fromI32(0)
export const BIG_INT_ONE = BigInt.fromI32(1)
export const BIG_DECIMAL_ZERO = BigDecimal.fromString('0')
export const BIG_DECIMAL_ONE = BigDecimal.fromString('1')

export const ADDRESS_ZERO = Address.fromString('0x0000000000000000000000000000000000000000')

export namespace Product {
    export const BENTOBOX = "BENTOBOX";

    export const SUSHISWAP = "SUSHISWAP";
    export const TRIDENT = "TRIDENT";
    export const SUSHI_X_SWAP = "SUSHI_X_SWAP";

    export const MASTER_CHEF_V1 = "MASTER_CHEFV1";
    export const MASTER_CHEF_V2 = "MASTER_CHEFV2";
    export const MINI_CHEF = "MINI_CHEF";

    export const SUSHI = "SUSHI";
    export const XSUSHI = "XSUSHI";

    export const FURO = "FURO";
    export const LIMIT_ORDERS = "LIMIT_ORDERS";
    export const KASHI = "KASHI";
    export const MISO = "MISO";
}


export const KASHI_MEDIUM_RISK_MASTER_CONTRACT_ADDRESSES = '{{ kashi.medium }}'.split(',')