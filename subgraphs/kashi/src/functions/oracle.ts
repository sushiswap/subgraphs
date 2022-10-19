import { BigInt, Bytes, ethereum, log } from '@graphprotocol/graph-ts'

import { Token } from '../../generated/schema'
import { ADDRESS_ZERO, chainlinkPriceFeedLookupTable } from '../constants'

// TODO: should add props for specific kashi pair types (collateralization rates, etc.)

export function validateChainlinkOracleData(
  asset: Token,
  collateral: Token,
  decodedOracleData: ethereum.Tuple
): boolean {
  const oracleMultiply = decodedOracleData[0].toAddress()
  const oracleDivide = decodedOracleData[1].toAddress()
  const oracleDecimals = decodedOracleData[2].toBigInt()

  let decimals = BigInt.fromU32(54)
  let from: Bytes | null = null
  let to: Bytes | null = null

  if (oracleMultiply.notEqual(ADDRESS_ZERO)) {
    if (!chainlinkPriceFeedLookupTable.isSet(oracleMultiply.toHex())) {
      log.warning('One of the Chainlink oracles used is not configured in this UI. {}', [oracleMultiply.toHex()])
      return false
    } else {
      const multiplyFeed = chainlinkPriceFeedLookupTable.mustGet(oracleMultiply.toHex())
      decimals = decimals.minus(BigInt.fromU32(18).minus(multiplyFeed.decimals))
      from = multiplyFeed.from
      to = multiplyFeed.to
    }
  }
  if (oracleDivide.notEqual(ADDRESS_ZERO)) {
    if (!chainlinkPriceFeedLookupTable.isSet(oracleDivide.toHex())) {
      log.warning('One of the Chainlink oracles used is not configured in this UI. {}', [oracleDivide.toHex()])
      return false
    } else {
      const divideFeed = chainlinkPriceFeedLookupTable.mustGet(oracleDivide.toHex())
      decimals = decimals.minus(divideFeed.decimals)
      if (to === null) {
        from = divideFeed.to
        to = divideFeed.from
      } else if (to.equals(divideFeed.to)) {
        to = divideFeed.from
      } else {
        log.warning(
          "The Chainlink oracles used don't match up with eachother. If 2 oracles are used, they should have a common token, such as WBTC/ETH and LINK/ETH, where ETH is the common link.",
          []
        )
        return false
      }
    }
  }
  if (from && from.toHex() == asset.id && to && to.toHex() == collateral.id) {
    const needed = collateral.decimals.plus(BigInt.fromU32(18)).minus(asset.decimals)
    const divider = BigInt.fromU32(10).pow(decimals.minus(needed).toU32() as u8)
    if (divider.notEqual(oracleDecimals)) {
      log.warning(
        'The divider parameter {} is misconfigured for this oracle {}, which leads to rates that are order(s) of magnitude.',
        [divider.toString(), oracleDecimals.toString()]
      )
      return false
    } else {
      return true
    }
  } else {
    log.warning("The Chainlink oracles configured don't match the pair tokens.", [])
    return false
  }
}
