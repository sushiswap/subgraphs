/* eslint-disable prefer-const */
import { Pair, Token, Bundle } from '../../generated/schema'
import { BigDecimal, Address } from '@graphprotocol/graph-ts/index'
import { ZERO_BD, factoryContract, ADDRESS_ZERO, ONE_BD } from './helpers'
import { NATIVE_ADDRESS, USDC_NATIVE_PAIR, DAI_NATIVE_PAIR, USDT_NATIVE_PAIR, WHITELIST, MINIMUM_LIQUIDITY_THRESHOLD_ETH } from './../constants'



export function getEthPriceInUSD(): BigDecimal {
  // fetch eth prices for each stablecoin
  let daiPair = Pair.load(DAI_NATIVE_PAIR)
  let usdcPair = Pair.load(USDC_NATIVE_PAIR)
  let usdtPair = Pair.load(USDT_NATIVE_PAIR)

  // all 3 have been created
  if (daiPair !== null && usdcPair !== null && usdtPair !== null) {
    let daiReserve = daiPair.token0 == NATIVE_ADDRESS ? daiPair.reserve0 : daiPair.reserve1;
    let daiPrice = daiPair.token0 == NATIVE_ADDRESS ? daiPair.token1Price : daiPair.token0Price;
    
    let usdcReserve = usdcPair.token0 == NATIVE_ADDRESS ? usdcPair.reserve0 : usdcPair.reserve1;
    let usdcPrice = usdcPair.token0 == NATIVE_ADDRESS ? usdcPair.token1Price : usdcPair.token0Price;
    
    let usdtReserve = usdtPair.token0 == NATIVE_ADDRESS ? usdtPair.reserve0 : usdtPair.reserve1;
    let usdtPrice = usdtPair.token0 == NATIVE_ADDRESS ? usdtPair.token1Price : usdtPair.token0Price;
    
    let totalLiquidityETH = daiReserve.plus(usdcReserve).plus(usdtReserve);
    let daiWeight = daiReserve.div(totalLiquidityETH);
    let usdcWeight = usdcReserve.div(totalLiquidityETH);
    let usdtWeight = usdtReserve.div(totalLiquidityETH);
    return daiPrice
      .times(daiWeight)
      .plus(usdcPrice.times(usdcWeight))
      .plus(usdtPrice.times(usdtWeight));
  } else if (usdtPair !== null && usdcPair !== null) {
    
    let usdcReserve = usdcPair.token0 == NATIVE_ADDRESS ? usdcPair.reserve0 : usdcPair.reserve1;
    let usdcPrice = usdcPair.token0 == NATIVE_ADDRESS ? usdcPair.token1Price : usdcPair.token0Price;
    
    let usdtReserve = usdtPair.token0 == NATIVE_ADDRESS ? usdtPair.reserve0 : usdtPair.reserve1;
    let usdtPrice = usdtPair.token0 == NATIVE_ADDRESS ? usdtPair.token1Price : usdtPair.token0Price;
    
    let totalLiquidityETH = usdcReserve.plus(usdtReserve);
    let usdcWeight = usdcReserve.div(totalLiquidityETH);
    let usdtWeight = usdtReserve.div(totalLiquidityETH);
    return usdcPrice.times(usdcWeight).plus(usdtPrice.times(usdtWeight));
    // USDC is the only pair so far
  } else if (usdcPair !== null) {
    return usdcPair.token0 == NATIVE_ADDRESS ? usdcPair.token1Price : usdcPair.token0Price;
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
