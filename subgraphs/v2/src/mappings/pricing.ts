/* eslint-disable prefer-const */
import { Pair, Token, Bundle } from '../../generated/schema'
import { BigDecimal, Address } from '@graphprotocol/graph-ts/index'
import { ZERO_BD, factoryContract, ADDRESS_ZERO, ONE_BD } from './helpers'
import { NATIVE_ADDRESS, STABLE0_NATIVE_PAIR, STABLE1_NATIVE_PAIR, STABLE2_NATIVE_PAIR, WHITELIST, MINIMUM_LIQUIDITY_THRESHOLD_ETH } from './../constants'



export function getEthPriceInUSD(): BigDecimal {
  // fetch eth prices for each stablecoin
  let stable0Pair = Pair.load(STABLE0_NATIVE_PAIR)
  let stable1Pair = Pair.load(STABLE1_NATIVE_PAIR)
  let stable2Pair = Pair.load(STABLE2_NATIVE_PAIR)

  // all 3 have been created
  if (stable2Pair !== null && stable0Pair !== null && stable1Pair !== null) {

    let stable0Reserve = stable0Pair.token0 == NATIVE_ADDRESS ? stable0Pair.reserve0 : stable0Pair.reserve1;
    let stable0Price = stable0Pair.token0 == NATIVE_ADDRESS ? stable0Pair.token1Price : stable0Pair.token0Price;
    let stable1Reserve = stable1Pair.token0 == NATIVE_ADDRESS ? stable1Pair.reserve0 : stable1Pair.reserve1;
    let stable1Price = stable1Pair.token0 == NATIVE_ADDRESS ? stable1Pair.token1Price : stable1Pair.token0Price;
    let stable2Reserve = stable2Pair.token0 == NATIVE_ADDRESS ? stable2Pair.reserve0 : stable2Pair.reserve1;
    let stable2Price = stable2Pair.token0 == NATIVE_ADDRESS ? stable2Pair.token1Price : stable2Pair.token0Price;

    let totalLiquidityETH = stable2Reserve.plus(stable0Reserve).plus(stable1Reserve);
    let stable0Weight = stable0Reserve.div(totalLiquidityETH);
    let stable1Weight = stable1Reserve.div(totalLiquidityETH);
    let stable2Weight = stable2Reserve.div(totalLiquidityETH);
    return stable2Price
      .times(stable2Weight)
      .plus(stable0Price.times(stable0Weight))
      .plus(stable1Price.times(stable1Weight));
  } else if (stable1Pair !== null && stable0Pair !== null) {

    let stable0Reserve = stable0Pair.token0 == NATIVE_ADDRESS ? stable0Pair.reserve0 : stable0Pair.reserve1;
    let stable0Price = stable0Pair.token0 == NATIVE_ADDRESS ? stable0Pair.token1Price : stable0Pair.token0Price;

    let stable1Reserve = stable1Pair.token0 == NATIVE_ADDRESS ? stable1Pair.reserve0 : stable1Pair.reserve1;
    let stable1Price = stable1Pair.token0 == NATIVE_ADDRESS ? stable1Pair.token1Price : stable1Pair.token0Price;

    let totalLiquidityETH = stable0Reserve.plus(stable1Reserve);
    let stable0Weight = stable0Reserve.div(totalLiquidityETH);
    let stable1Weight = stable1Reserve.div(totalLiquidityETH);
    return stable0Price.times(stable0Weight).plus(stable1Price.times(stable1Weight));

  } else if (stable0Pair !== null) {
    return stable0Pair.token0 == NATIVE_ADDRESS ? stable0Pair.token1Price : stable0Pair.token0Price;
  } else {
    return ZERO_BD
  }
}

/**
 * Search through graph to find derived Eth per token.
 * @todo update to be derived ETH (add stablecoin estimates)
 **/
export function findEthPerToken(token: Token): BigDecimal {
  if (token.id == NATIVE_ADDRESS) {
    return ONE_BD
  }
  // loop through whitelist and check if paired with any
  for (let i = 0; i < WHITELIST.length; ++i) {
    let pairAddress = factoryContract.getPair(Address.fromString(token.id), Address.fromString(WHITELIST[i]))
    if (pairAddress.toHexString() != ADDRESS_ZERO) {
      let pair = Pair.load(pairAddress.toHexString())
      if (pair === null) {
        continue
      }
      if (pair.token0 == token.id && pair.reserveETH.gt(MINIMUM_LIQUIDITY_THRESHOLD_ETH)) {
        let token1 = Token.load(pair.token1)
        if (token1 === null) {
          continue
        }
        return pair.token1Price.times(token1.derivedETH as BigDecimal) // return token1 per our token * Eth per token 1
      }
      if (pair.token1 == token.id && pair.reserveETH.gt(MINIMUM_LIQUIDITY_THRESHOLD_ETH)) {
        let token0 = Token.load(pair.token0)
        if (token0 === null) {
          continue
        }
        return pair.token0Price.times(token0.derivedETH as BigDecimal) // return token0 per our token * ETH per token 0
      }
    }
  }
  return ZERO_BD // nothing was found return 0
}

/**
 * Accepts tokens and amounts, return tracked amount based on token whitelist
 * If one token on whitelist, return amount in that token converted to USD.
 * If both are, return average of two amounts
 * If neither is, return 0
 */
export function getTrackedVolumeUSD(
  tokenAmount0: BigDecimal,
  token0: Token,
  tokenAmount1: BigDecimal,
  token1: Token
): BigDecimal {
  let bundle = Bundle.load('1')!
  let price0 = token0.derivedETH.times(bundle.ethPrice);
  let price1 = token1.derivedETH.times(bundle.ethPrice);

  // both are whitelist tokens, take average of both amounts
  if (WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
    return tokenAmount0.times(price0).plus(tokenAmount1.times(price1)).div(BigDecimal.fromString("2"));
  }

  // take full value of the whitelisted token amount
  if (WHITELIST.includes(token0.id) && !WHITELIST.includes(token1.id)) {
    return tokenAmount0.times(price0);
  }

  // take full value of the whitelisted token amount
  if (!WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
    return tokenAmount1.times(price1);
  }

  // neither token is on white list, tracked volume is 0
  return ZERO_BD;
}

/**
 * Accepts tokens and amounts, return tracked amount based on token whitelist
 * If one token on whitelist, return amount in that token converted to USD * 2.
 * If both are, return sum of two amounts
 * If neither is, return 0
 */
export function getTrackedLiquidityUSD(
  tokenAmount0: BigDecimal,
  token0: Token,
  tokenAmount1: BigDecimal,
  token1: Token
): BigDecimal {
  let bundle = Bundle.load('1')!
  let price0 = token0.derivedETH.times(bundle.ethPrice)
  let price1 = token1.derivedETH.times(bundle.ethPrice)

  // both are whitelist tokens, take average of both amounts
  if (WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
    return tokenAmount0.times(price0).plus(tokenAmount1.times(price1))
  }

  // take double value of the whitelisted token amount
  if (WHITELIST.includes(token0.id) && !WHITELIST.includes(token1.id)) {
    return tokenAmount0.times(price0).times(BigDecimal.fromString('2'))
  }

  // take double value of the whitelisted token amount
  if (!WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
    return tokenAmount1.times(price1).times(BigDecimal.fromString('2'))
  }

  // neither token is on white list, tracked volume is 0
  return ZERO_BD
}
