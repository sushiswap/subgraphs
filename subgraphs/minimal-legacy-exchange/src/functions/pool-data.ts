import { Address, BigDecimal } from '@graphprotocol/graph-ts'
import { BIG_DECIMAL_ZERO } from '../constants'
import { PoolKpi } from '../../generated/schema'

export function createPoolKpi(id: string): PoolKpi {
  let poolKpi = new PoolKpi(id)
  poolKpi.pool = id
  poolKpi.reserve0 = BIG_DECIMAL_ZERO
  poolKpi.reserve1 = BIG_DECIMAL_ZERO
  poolKpi.reserveETH = BIG_DECIMAL_ZERO
  poolKpi.token0Price = BIG_DECIMAL_ZERO
  poolKpi.token1Price = BIG_DECIMAL_ZERO
  poolKpi.totalSupply = BIG_DECIMAL_ZERO
  poolKpi.save()
  return poolKpi as PoolKpi
}

export function getPoolKpi(address: string): PoolKpi {
  return PoolKpi.load(address) as PoolKpi
}
