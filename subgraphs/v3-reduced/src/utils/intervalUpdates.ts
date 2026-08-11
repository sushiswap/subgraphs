/* eslint-disable prefer-const */
import { ethereum } from "@graphprotocol/graph-ts";
import {
  Factory,
  Pool,
  PoolDayData,
  PoolHourData,
  UniswapDayData,
} from "../../generated/schema";
import { FACTORY_ADDRESS, ONE_BI, ZERO_BD, ZERO_BI } from "../constants";

// Interval helpers deliberately do not save. Handlers finish all mutations and
// persist each bucket once, avoiding the previous double-write on every swap.
export function updateUniswapDayData(event: ethereum.Event): UniswapDayData {
  let factory = Factory.load(FACTORY_ADDRESS.toHex()) as Factory;
  let timestamp = event.block.timestamp.toI32();
  let dayID = timestamp / 86400;
  let dayData = UniswapDayData.load(dayID.toString());

  if (dayData === null) {
    dayData = new UniswapDayData(dayID.toString());
    dayData.date = dayID * 86400;
    dayData.volumeUSD = ZERO_BD;
    dayData.volumeUSDUntracked = ZERO_BD;
    dayData.feesUSD = ZERO_BD;
  }

  dayData.tvlUSD = factory.totalValueLockedUSD;
  dayData.txCount = factory.txCount;
  return dayData as UniswapDayData;
}

export function updatePoolDayData(event: ethereum.Event): PoolDayData {
  let timestamp = event.block.timestamp.toI32();
  let dayID = timestamp / 86400;
  let id = event.address.toHexString().concat("-").concat(dayID.toString());
  let pool = Pool.load(event.address.toHexString()) as Pool;
  let dayData = PoolDayData.load(id);

  if (dayData === null) {
    dayData = new PoolDayData(id);
    dayData.date = dayID * 86400;
    dayData.pool = pool.id;
    dayData.volumeUSD = ZERO_BD;
    dayData.feesUSD = ZERO_BD;
    dayData.txCount = ZERO_BI;
  }

  dayData.tvlUSD = pool.totalValueLockedUSD;
  dayData.txCount = dayData.txCount.plus(ONE_BI);
  return dayData as PoolDayData;
}

export function updatePoolHourData(event: ethereum.Event): PoolHourData {
  let timestamp = event.block.timestamp.toI32();
  let hourID = timestamp / 3600;
  let id = event.address.toHexString().concat("-").concat(hourID.toString());
  let pool = Pool.load(event.address.toHexString()) as Pool;
  let hourData = PoolHourData.load(id);

  if (hourData === null) {
    hourData = new PoolHourData(id);
    hourData.periodStartUnix = hourID * 3600;
    hourData.pool = pool.id;
    hourData.volumeUSD = ZERO_BD;
    hourData.feesUSD = ZERO_BD;
    hourData.txCount = ZERO_BI;
  }

  hourData.tvlUSD = pool.totalValueLockedUSD;
  hourData.txCount = hourData.txCount.plus(ONE_BI);
  return hourData as PoolHourData;
}
