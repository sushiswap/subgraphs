import { BigDecimal, BigInt } from '@graphprotocol/graph-ts'
import { XSushi } from '../../generated/schema'
import { XSUSHI } from '../constants'

export function getOrCreateXSushi(): XSushi {
  let xSushi = XSushi.load(XSUSHI)

  if (xSushi === null) {
    xSushi = new XSushi(XSUSHI)
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
    xSushi.save()
    return xSushi
  }

  return xSushi as XSushi
}
