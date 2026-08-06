import { Address, BigInt, Value } from "@graphprotocol/graph-ts";
import { LaunchPool as LaunchPoolContract } from "../../generated/SushiLaunchpad/LaunchPool";
import { LaunchToken as LaunchTokenContract } from "../../generated/SushiLaunchpad/LaunchToken";
import { Launchpad } from "../../generated/schema";

export class LaunchInvariants {
  decimals: i32;
  totalSupply: BigInt;
  poolFee: i32;
  poolTickSpacing: i32;

  constructor(
    decimals: i32,
    totalSupply: BigInt,
    poolFee: i32,
    poolTickSpacing: i32
  ) {
    this.decimals = decimals;
    this.totalSupply = totalSupply;
    this.poolFee = poolFee;
    this.poolTickSpacing = poolTickSpacing;
  }
}

export function getOrInitializeLaunchInvariants(
  launchpad: Launchpad,
  tokenAddress: Address,
  poolAddress: Address
): LaunchInvariants {
  const cachedDecimals = launchpad.get("launchTokenDecimals");
  const cachedTotalSupply = launchpad.get("launchTokenTotalSupply");
  const cachedPoolFee = launchpad.get("launchPoolFee");
  const cachedTickSpacing = launchpad.get("launchPoolTickSpacing");
  const cacheIsUnset =
    cachedDecimals == null &&
    cachedTotalSupply == null &&
    cachedPoolFee == null &&
    cachedTickSpacing == null;
  const cacheIsSet =
    cachedDecimals != null &&
    cachedTotalSupply != null &&
    cachedPoolFee != null &&
    cachedTickSpacing != null;
  assert(
    cacheIsUnset || cacheIsSet,
    "Launchpad invariant cache is partially initialized " + launchpad.id
  );

  if (cacheIsUnset) {
    const tokenContract = LaunchTokenContract.bind(tokenAddress);
    const poolContract = LaunchPoolContract.bind(poolAddress);
    const poolTickSpacing = poolContract.tickSpacing();
    assert(
      poolTickSpacing > 0,
      "Launchpad invariant cache has invalid tick spacing " + launchpad.id
    );
    launchpad.launchTokenDecimals = tokenContract.decimals();
    launchpad.launchTokenTotalSupply = tokenContract.totalSupply();
    launchpad.launchPoolFee = poolContract.fee();
    launchpad.launchPoolTickSpacing = poolTickSpacing;
    launchpad.save();
  }

  return requireLaunchInvariants(launchpad);
}

export function requireLaunchInvariants(
  launchpad: Launchpad
): LaunchInvariants {
  const cachedDecimals = launchpad.get("launchTokenDecimals");
  const cachedTotalSupply = launchpad.get("launchTokenTotalSupply");
  const cachedPoolFee = launchpad.get("launchPoolFee");
  const cachedTickSpacing = launchpad.get("launchPoolTickSpacing");
  assert(
    cachedDecimals != null &&
      cachedTotalSupply != null &&
      cachedPoolFee != null &&
      cachedTickSpacing != null,
    "Launchpad invariant cache is unavailable " + launchpad.id
  );

  const invariants = new LaunchInvariants(
    changetype<Value>(cachedDecimals).toI32(),
    changetype<Value>(cachedTotalSupply).toBigInt(),
    changetype<Value>(cachedPoolFee).toI32(),
    changetype<Value>(cachedTickSpacing).toI32()
  );
  assert(
    invariants.poolTickSpacing > 0,
    "Launchpad invariant cache has invalid tick spacing " + launchpad.id
  );
  return invariants;
}
