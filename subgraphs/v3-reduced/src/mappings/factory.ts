/* eslint-disable prefer-const */
import { BigInt, log } from "@graphprotocol/graph-ts";
import { PoolCreated } from "../../generated/Factory/Factory";
import { Bundle, Factory, Pool, Token } from "../../generated/schema";
import { Pool as PoolTemplate } from "../../generated/templates";
import {
  FACTORY_ADDRESS,
  WHITELISTED_TOKEN_ADDRESSES,
  ZERO_BD,
  ZERO_BI,
} from "../constants";
import {
  fetchTokenDecimals,
  fetchTokenName,
  fetchTokenSymbol,
  fetchTokenTotalSupply,
} from "../utils/token";

export function handlePoolCreated(event: PoolCreated): void {
  let factory = Factory.load(FACTORY_ADDRESS.toHex());
  if (factory === null) {
    factory = new Factory(FACTORY_ADDRESS.toHex());
    factory.txCount = ZERO_BI;
    factory.totalVolumeUSD = ZERO_BD;
    factory.untrackedVolumeUSD = ZERO_BD;
    factory.totalFeesUSD = ZERO_BD;
    factory.totalValueLockedETH = ZERO_BD;
    factory.totalValueLockedUSD = ZERO_BD;

    let bundle = new Bundle("1");
    bundle.ethPriceUSD = ZERO_BD;
    bundle.save();
  }

  let pool = new Pool(event.params.pool.toHexString());
  let token0 = Token.load(event.params.token0.toHexString());
  let token1 = Token.load(event.params.token1.toHexString());

  if (token0 === null) {
    let symbol = fetchTokenSymbol(event.params.token0);
    let name = fetchTokenName(event.params.token0);
    let totalSupply = fetchTokenTotalSupply(event.params.token0);
    let decimals = fetchTokenDecimals(event.params.token0);
    if (decimals === null) {
      log.warning("Unable to load decimals for token {}", [
        event.params.token0.toHexString(),
      ]);
      return;
    }
    token0 = new Token(event.params.token0.toHexString());
    token0.symbol = symbol;
    token0.name = name;
    token0.decimals = decimals;
    token0.totalSupply = totalSupply;
    token0.derivedETH = ZERO_BD;
    token0.whitelistPools = [];
  }

  if (token1 === null) {
    let symbol = fetchTokenSymbol(event.params.token1);
    let name = fetchTokenName(event.params.token1);
    let totalSupply = fetchTokenTotalSupply(event.params.token1);
    let decimals = fetchTokenDecimals(event.params.token1);
    if (decimals === null) {
      log.warning("Unable to load decimals for token {}", [
        event.params.token1.toHexString(),
      ]);
      return;
    }
    token1 = new Token(event.params.token1.toHexString());
    token1.symbol = symbol;
    token1.name = name;
    token1.decimals = decimals;
    token1.totalSupply = totalSupply;
    token1.derivedETH = ZERO_BD;
    token1.whitelistPools = [];
  }

  if (WHITELISTED_TOKEN_ADDRESSES.includes(token0.id)) {
    let pools = token1.whitelistPools;
    pools.push(pool.id);
    token1.whitelistPools = pools;
  }
  if (WHITELISTED_TOKEN_ADDRESSES.includes(token1.id)) {
    let pools = token0.whitelistPools;
    pools.push(pool.id);
    token0.whitelistPools = pools;
  }

  pool.token0 = token0.id;
  pool.token1 = token1.id;
  pool.feeTier = BigInt.fromI32(event.params.fee);
  pool.createdAtTimestamp = event.block.timestamp;
  pool.txCount = ZERO_BI;
  pool.liquidity = ZERO_BI;
  pool.sqrtPrice = ZERO_BI;
  pool.token0Price = ZERO_BD;
  pool.token1Price = ZERO_BD;
  pool.totalValueLockedToken0 = ZERO_BD;
  pool.totalValueLockedToken1 = ZERO_BD;
  pool.totalValueLockedUSD = ZERO_BD;
  pool.totalValueLockedETH = ZERO_BD;
  pool.volumeUSD = ZERO_BD;
  pool.isProtocolFeeEnabled = false;

  pool.save();
  PoolTemplate.create(event.params.pool);
  token0.save();
  token1.save();
  factory.save();
}
