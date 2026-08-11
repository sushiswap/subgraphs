/* eslint-disable prefer-const */
import { BigDecimal, BigInt, ethereum } from "@graphprotocol/graph-ts";
import {
  Bundle,
  Burn,
  Collect,
  Factory,
  Mint,
  Pool,
  Swap,
  Token,
} from "../../generated/schema";
import {
  Burn as BurnEvent,
  Collect as CollectEvent,
  CollectProtocol as CollectProtocolEvent,
  Initialize,
  Mint as MintEvent,
  SetFeeProtocol as ProtocolFeeEvent,
  Swap as SwapEvent,
} from "../../generated/templates/Pool/Pool";
import { FACTORY_ADDRESS, ONE_BI, ZERO_BD } from "../constants";
import { convertTokenToDecimal, loadTransaction, safeDiv } from "../utils";
import {
  updatePoolDayData,
  updatePoolHourData,
  updateUniswapDayData,
} from "../utils/intervalUpdates";
import {
  findEthPerToken,
  getEthPriceInUSD,
  getTrackedAmountUSD,
  sqrtPriceX96ToTokenPrices,
} from "../utils/pricing";

function saveBuckets(event: ethereum.Event): void {
  updateUniswapDayData(event).save();
  updatePoolDayData(event).save();
  updatePoolHourData(event).save();
}

export function handleInitialize(event: Initialize): void {
  let pool = Pool.load(event.address.toHexString()) as Pool;
  pool.sqrtPrice = event.params.sqrtPriceX96;
  pool.tick = BigInt.fromI32(event.params.tick);
  pool.save();

  let token0 = Token.load(pool.token0) as Token;
  let token1 = Token.load(pool.token1) as Token;
  let bundle = Bundle.load("1") as Bundle;
  bundle.ethPriceUSD = getEthPriceInUSD();
  bundle.save();

  token0.derivedETH = findEthPerToken(token0);
  token1.derivedETH = findEthPerToken(token1);
  token0.save();
  token1.save();
  updatePoolDayData(event).save();
  updatePoolHourData(event).save();
}

export function handleMint(event: MintEvent): void {
  let bundle = Bundle.load("1") as Bundle;
  let pool = Pool.load(event.address.toHexString()) as Pool;
  let factory = Factory.load(FACTORY_ADDRESS.toHex()) as Factory;
  let token0 = Token.load(pool.token0) as Token;
  let token1 = Token.load(pool.token1) as Token;
  let amount0 = convertTokenToDecimal(event.params.amount0, token0.decimals);
  let amount1 = convertTokenToDecimal(event.params.amount1, token1.decimals);
  let amountUSD = amount0
    .times(token0.derivedETH.times(bundle.ethPriceUSD))
    .plus(amount1.times(token1.derivedETH.times(bundle.ethPriceUSD)));

  factory.totalValueLockedETH = factory.totalValueLockedETH.minus(
    pool.totalValueLockedETH
  );
  factory.txCount = factory.txCount.plus(ONE_BI);
  pool.txCount = pool.txCount.plus(ONE_BI);

  if (
    pool.tick !== null &&
    BigInt.fromI32(event.params.tickLower).le(pool.tick as BigInt) &&
    BigInt.fromI32(event.params.tickUpper).gt(pool.tick as BigInt)
  ) {
    pool.liquidity = pool.liquidity.plus(event.params.amount);
  }

  pool.totalValueLockedToken0 = pool.totalValueLockedToken0.plus(amount0);
  pool.totalValueLockedToken1 = pool.totalValueLockedToken1.plus(amount1);
  pool.totalValueLockedETH = pool.totalValueLockedToken0
    .times(token0.derivedETH)
    .plus(pool.totalValueLockedToken1.times(token1.derivedETH));
  pool.totalValueLockedUSD = pool.totalValueLockedETH.times(bundle.ethPriceUSD);
  factory.totalValueLockedETH = factory.totalValueLockedETH.plus(
    pool.totalValueLockedETH
  );
  factory.totalValueLockedUSD = factory.totalValueLockedETH.times(
    bundle.ethPriceUSD
  );

  let transaction = loadTransaction(event);
  let mint = new Mint(transaction.id + "-" + event.logIndex.toString());
  mint.transaction = transaction.id;
  mint.timestamp = transaction.timestamp;
  mint.pool = pool.id;
  mint.owner = event.params.owner;
  mint.sender = event.params.sender;
  mint.origin = event.transaction.from;
  mint.amount = event.params.amount;
  mint.amount0 = amount0;
  mint.amount1 = amount1;
  mint.amountUSD = amountUSD;
  mint.logIndex = event.logIndex;

  factory.save();
  pool.save();
  mint.save();
  saveBuckets(event);
}

// Burn does not adjust TVL; the subsequent Collect accounts for withdrawn tokens.
export function handleBurn(event: BurnEvent): void {
  let bundle = Bundle.load("1") as Bundle;
  let pool = Pool.load(event.address.toHexString()) as Pool;
  let factory = Factory.load(FACTORY_ADDRESS.toHex()) as Factory;
  let token0 = Token.load(pool.token0) as Token;
  let token1 = Token.load(pool.token1) as Token;
  let amount0 = convertTokenToDecimal(event.params.amount0, token0.decimals);
  let amount1 = convertTokenToDecimal(event.params.amount1, token1.decimals);
  let amountUSD = amount0
    .times(token0.derivedETH.times(bundle.ethPriceUSD))
    .plus(amount1.times(token1.derivedETH.times(bundle.ethPriceUSD)));

  factory.txCount = factory.txCount.plus(ONE_BI);
  pool.txCount = pool.txCount.plus(ONE_BI);
  if (
    pool.tick !== null &&
    BigInt.fromI32(event.params.tickLower).le(pool.tick as BigInt) &&
    BigInt.fromI32(event.params.tickUpper).gt(pool.tick as BigInt)
  ) {
    pool.liquidity = pool.liquidity.minus(event.params.amount);
  }

  let transaction = loadTransaction(event);
  let burn = new Burn(transaction.id + "-" + event.logIndex.toString());
  burn.transaction = transaction.id;
  burn.timestamp = transaction.timestamp;
  burn.pool = pool.id;
  burn.owner = event.params.owner;
  burn.origin = event.transaction.from;
  burn.amount = event.params.amount;
  burn.amount0 = amount0;
  burn.amount1 = amount1;
  burn.amountUSD = amountUSD;
  burn.logIndex = event.logIndex;

  factory.save();
  pool.save();
  burn.save();
  saveBuckets(event);
}

export function handleSwap(event: SwapEvent): void {
  let bundle = Bundle.load("1") as Bundle;
  let factory = Factory.load(FACTORY_ADDRESS.toHex()) as Factory;
  let pool = Pool.load(event.address.toHexString()) as Pool;
  let token0 = Token.load(pool.token0) as Token;
  let token1 = Token.load(pool.token1) as Token;
  let amount0 = convertTokenToDecimal(event.params.amount0, token0.decimals);
  let amount1 = convertTokenToDecimal(event.params.amount1, token1.decimals);
  let amount0Abs = amount0.lt(ZERO_BD)
    ? amount0.times(BigDecimal.fromString("-1"))
    : amount0;
  let amount1Abs = amount1.lt(ZERO_BD)
    ? amount1.times(BigDecimal.fromString("-1"))
    : amount1;
  let amount0USD = amount0Abs
    .times(token0.derivedETH)
    .times(bundle.ethPriceUSD);
  let amount1USD = amount1Abs
    .times(token1.derivedETH)
    .times(bundle.ethPriceUSD);
  let amountTotalUSDTracked = safeDiv(
    getTrackedAmountUSD(amount0Abs, token0, amount1Abs, token1),
    BigDecimal.fromString("2")
  );
  let amountTotalUSDUntracked = safeDiv(
    amount0USD.plus(amount1USD),
    BigDecimal.fromString("2")
  );
  let feesUSD = amountTotalUSDTracked
    .times(pool.feeTier.toBigDecimal())
    .div(BigDecimal.fromString("1000000"));

  factory.txCount = factory.txCount.plus(ONE_BI);
  factory.totalVolumeUSD = factory.totalVolumeUSD.plus(amountTotalUSDTracked);
  factory.untrackedVolumeUSD = factory.untrackedVolumeUSD.plus(
    amountTotalUSDUntracked
  );
  factory.totalFeesUSD = factory.totalFeesUSD.plus(feesUSD);
  factory.totalValueLockedETH = factory.totalValueLockedETH.minus(
    pool.totalValueLockedETH
  );

  pool.volumeUSD = pool.volumeUSD.plus(amountTotalUSDTracked);
  pool.txCount = pool.txCount.plus(ONE_BI);
  pool.liquidity = event.params.liquidity;
  pool.tick = BigInt.fromI32(event.params.tick as i32);
  pool.sqrtPrice = event.params.sqrtPriceX96;
  pool.totalValueLockedToken0 = pool.totalValueLockedToken0.plus(amount0);
  pool.totalValueLockedToken1 = pool.totalValueLockedToken1.plus(amount1);

  let prices = sqrtPriceX96ToTokenPrices(pool.sqrtPrice, token0, token1);
  pool.token0Price = prices[0];
  pool.token1Price = prices[1];
  // Pricing traverses persisted whitelist pools, so the new pool price must be visible first.
  pool.save();

  bundle.ethPriceUSD = getEthPriceInUSD();
  bundle.save();
  token0.derivedETH = findEthPerToken(token0);
  token1.derivedETH = findEthPerToken(token1);
  pool.totalValueLockedETH = pool.totalValueLockedToken0
    .times(token0.derivedETH)
    .plus(pool.totalValueLockedToken1.times(token1.derivedETH));
  pool.totalValueLockedUSD = pool.totalValueLockedETH.times(bundle.ethPriceUSD);
  factory.totalValueLockedETH = factory.totalValueLockedETH.plus(
    pool.totalValueLockedETH
  );
  factory.totalValueLockedUSD = factory.totalValueLockedETH.times(
    bundle.ethPriceUSD
  );

  let transaction = loadTransaction(event);
  let swap = new Swap(transaction.id + "-" + event.logIndex.toString());
  swap.transaction = transaction.id;
  swap.timestamp = transaction.timestamp;
  swap.pool = pool.id;
  swap.sender = event.params.sender;
  swap.origin = event.transaction.from;
  swap.recipient = event.params.recipient;
  swap.amount0 = amount0;
  swap.amount1 = amount1;
  swap.amountUSD = amountTotalUSDTracked;
  swap.sqrtPriceX96 = event.params.sqrtPriceX96;
  swap.logIndex = event.logIndex;

  factory.save();
  pool.save();
  token0.save();
  token1.save();
  swap.save();

  let protocolDay = updateUniswapDayData(event);
  protocolDay.volumeUSD = protocolDay.volumeUSD.plus(amountTotalUSDTracked);
  protocolDay.volumeUSDUntracked = protocolDay.volumeUSDUntracked.plus(
    amountTotalUSDUntracked
  );
  protocolDay.feesUSD = protocolDay.feesUSD.plus(feesUSD);

  let poolDay = updatePoolDayData(event);
  poolDay.volumeUSD = poolDay.volumeUSD.plus(amountTotalUSDTracked);
  poolDay.feesUSD = poolDay.feesUSD.plus(feesUSD);

  let poolHour = updatePoolHourData(event);
  poolHour.volumeUSD = poolHour.volumeUSD.plus(amountTotalUSDTracked);
  poolHour.feesUSD = poolHour.feesUSD.plus(feesUSD);

  protocolDay.save();
  poolDay.save();
  poolHour.save();
}

export function handlePoolCollect(event: CollectEvent): void {
  let bundle = Bundle.load("1") as Bundle;
  let pool = Pool.load(event.address.toHexString());
  if (pool === null) return;
  let factory = Factory.load(FACTORY_ADDRESS.toHex()) as Factory;
  let token0 = Token.load(pool.token0);
  let token1 = Token.load(pool.token1);
  if (token0 === null || token1 === null) return;

  let amount0 = convertTokenToDecimal(event.params.amount0, token0.decimals);
  let amount1 = convertTokenToDecimal(event.params.amount1, token1.decimals);
  let amountUSD = getTrackedAmountUSD(amount0, token0, amount1, token1);
  factory.totalValueLockedETH = factory.totalValueLockedETH.minus(
    pool.totalValueLockedETH
  );
  factory.txCount = factory.txCount.plus(ONE_BI);
  pool.txCount = pool.txCount.plus(ONE_BI);
  pool.totalValueLockedToken0 = pool.totalValueLockedToken0.minus(amount0);
  pool.totalValueLockedToken1 = pool.totalValueLockedToken1.minus(amount1);
  pool.totalValueLockedETH = pool.totalValueLockedToken0
    .times(token0.derivedETH)
    .plus(pool.totalValueLockedToken1.times(token1.derivedETH));
  pool.totalValueLockedUSD = pool.totalValueLockedETH.times(bundle.ethPriceUSD);
  factory.totalValueLockedETH = factory.totalValueLockedETH.plus(
    pool.totalValueLockedETH
  );
  factory.totalValueLockedUSD = factory.totalValueLockedETH.times(
    bundle.ethPriceUSD
  );

  let transaction = loadTransaction(event);
  let collect = new Collect(transaction.id + "-" + event.logIndex.toString());
  collect.transaction = transaction.id;
  collect.timestamp = event.block.timestamp;
  collect.pool = pool.id;
  collect.owner = event.params.owner;
  collect.amount0 = amount0;
  collect.amount1 = amount1;
  collect.amountUSD = amountUSD;
  collect.logIndex = event.logIndex;

  factory.save();
  pool.save();
  collect.save();
  saveBuckets(event);
}

export function handleProtocolCollect(event: CollectProtocolEvent): void {
  let bundle = Bundle.load("1") as Bundle;
  let pool = Pool.load(event.address.toHexString());
  if (pool === null) return;
  let factory = Factory.load(FACTORY_ADDRESS.toHex()) as Factory;
  let token0 = Token.load(pool.token0);
  let token1 = Token.load(pool.token1);
  if (token0 === null || token1 === null) return;

  let amount0 = convertTokenToDecimal(event.params.amount0, token0.decimals);
  let amount1 = convertTokenToDecimal(event.params.amount1, token1.decimals);
  let amountUSD = getTrackedAmountUSD(amount0, token0, amount1, token1);
  factory.totalValueLockedETH = factory.totalValueLockedETH.minus(
    pool.totalValueLockedETH
  );
  factory.txCount = factory.txCount.plus(ONE_BI);
  pool.txCount = pool.txCount.plus(ONE_BI);
  pool.totalValueLockedToken0 = pool.totalValueLockedToken0.minus(amount0);
  pool.totalValueLockedToken1 = pool.totalValueLockedToken1.minus(amount1);
  pool.totalValueLockedETH = pool.totalValueLockedToken0
    .times(token0.derivedETH)
    .plus(pool.totalValueLockedToken1.times(token1.derivedETH));
  pool.totalValueLockedUSD = pool.totalValueLockedETH.times(bundle.ethPriceUSD);
  factory.totalValueLockedETH = factory.totalValueLockedETH.plus(
    pool.totalValueLockedETH
  );
  factory.totalValueLockedUSD = factory.totalValueLockedETH.times(
    bundle.ethPriceUSD
  );

  let transaction = loadTransaction(event);
  let collect = new Collect(transaction.id + "-" + event.logIndex.toString());
  collect.transaction = transaction.id;
  collect.timestamp = event.block.timestamp;
  collect.pool = pool.id;
  collect.owner = event.params.recipient;
  collect.amount0 = amount0;
  collect.amount1 = amount1;
  collect.amountUSD = amountUSD;
  collect.logIndex = event.logIndex;

  factory.save();
  pool.save();
  collect.save();
  saveBuckets(event);
}

export function handleSetProtocolFee(event: ProtocolFeeEvent): void {
  let pool = Pool.load(event.address.toHexString());
  if (pool === null) return;
  pool.isProtocolFeeEnabled =
    event.params.feeProtocol0New > 0 || event.params.feeProtocol1New > 0;
  pool.save();
}
