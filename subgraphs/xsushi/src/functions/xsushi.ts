import { XSushi } from '../../generated/schema'
import { BIG_DECIMAL_ONE, BIG_DECIMAL_ZERO, BIG_INT_ZERO, XSUSHI } from '../constants'

export function getOrCreateXSushi(): XSushi {
  let xSushi = XSushi.load(XSUSHI)

  if (xSushi === null) {
    xSushi = new XSushi(XSUSHI)

    xSushi.userCount = BIG_INT_ZERO
    xSushi.transactionCount = BIG_INT_ZERO
    xSushi.sushiSupply = BIG_INT_ZERO
    xSushi.xSushiSupply = BIG_INT_ZERO
    xSushi.sushiStaked = BIG_INT_ZERO
    xSushi.sushiHarvested = BIG_INT_ZERO
    xSushi.totalFeeAmount = BIG_INT_ZERO
    xSushi.xSushiBurned = BIG_INT_ZERO
    xSushi.xSushiMinted = BIG_INT_ZERO

    xSushi.sushiXsushiRatio = BIG_DECIMAL_ONE
    xSushi.xSushiSushiRatio = BIG_DECIMAL_ONE

    xSushi.apr1m = BIG_DECIMAL_ZERO
    xSushi.apr3m = BIG_DECIMAL_ZERO
    xSushi.apr6m = BIG_DECIMAL_ZERO
    xSushi.apr12m = BIG_DECIMAL_ZERO
    xSushi.aprUpdatedAtTimestamp = BIG_INT_ZERO


    xSushi.save()
    return xSushi
  }

  return xSushi as XSushi
}
