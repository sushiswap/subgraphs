<<<<<<< HEAD
=======
import { BigDecimal, BigInt } from '@graphprotocol/graph-ts'
>>>>>>> master
import { XSushi } from '../../generated/schema'
import { BIG_DECIMAL_ONE, BIG_DECIMAL_ZERO, BIG_INT_ZERO, XSUSHI } from '../constants'

export function getOrCreateXSushi(): XSushi {
  let xSushi = XSushi.load(XSUSHI)

  if (xSushi === null) {
    xSushi = new XSushi(XSUSHI)
<<<<<<< HEAD
    xSushi.userCount = BIG_INT_ZERO
    xSushi.transactionCount = BIG_INT_ZERO
    xSushi.sushiSupply = BIG_DECIMAL_ZERO
    xSushi.xSushiSupply = BIG_DECIMAL_ZERO
    xSushi.sushiStaked = BIG_DECIMAL_ZERO
    xSushi.sushiHarvested = BIG_DECIMAL_ZERO
    xSushi.totalFeeAmount = BIG_DECIMAL_ZERO
    xSushi.xSushiBurned = BIG_DECIMAL_ZERO
    xSushi.xSushiMinted = BIG_DECIMAL_ZERO

    xSushi.sushiXsushiRatio = BIG_DECIMAL_ONE
    xSushi.xSushiSushiRatio = BIG_DECIMAL_ONE

    xSushi.apr1m = BIG_DECIMAL_ZERO
    xSushi.apr3m = BIG_DECIMAL_ZERO
    xSushi.apr6m = BIG_DECIMAL_ZERO
    xSushi.apr12m = BIG_DECIMAL_ZERO
    xSushi.aprUpdatedAtTimestamp = BIG_INT_ZERO

=======
    xSushi.userCount = BigInt.fromU32(0)
    xSushi.transactionCount = BigInt.fromU32(0)
    xSushi.sushiSupply = BigInt.fromU32(0)
    xSushi.xSushiSupply = BigInt.fromU32(0)
    xSushi.sushiStaked = BigInt.fromU32(0)
    xSushi.sushiHarvested = BigInt.fromU32(0)
    xSushi.xSushiBurned = BigInt.fromU32(0)
    xSushi.xSushiMinted = BigInt.fromU32(0)
    xSushi.sushiXsushiRatio = BigDecimal.fromString('1')
    xSushi.xSushiSushiRatio = BigDecimal.fromString('1')
>>>>>>> master
    xSushi.save()
    return xSushi
  }

  return xSushi as XSushi
}
