import { BigInt, store } from "@graphprotocol/graph-ts";
import {
  PositionCreated as PositionCreatedEvent,
  TokenLaunched as TokenLaunchedEvent,
} from "../../generated/SushiLaunchpad/SushiLaunchpad";
import { Launch, PendingLaunch } from "../../generated/schema";
import {
  getOrInitializeLaunchInvariants,
  requireLaunchInvariants,
} from "./launch-invariants";
import {
  addressId,
  canonicalHex,
  deploymentContext,
  getOrCreateLaunchpad,
} from "./shared";

export function handleTokenLaunched(event: TokenLaunchedEvent): void {
  const context = deploymentContext();
  const launchpad = getOrCreateLaunchpad(context, event.address);
  const id = addressId(context.chainId, event.params.token);
  assert(
    Launch.load(id) == null && PendingLaunch.load(id) == null,
    "Duplicate token launch " + id
  );
  assert(
    !event.params.token.equals(event.params.quoteToken),
    "Launch token and quote token must differ " + id
  );

  getOrInitializeLaunchInvariants(
    launchpad,
    event.params.token,
    event.params.pool
  );

  const token = canonicalHex(event.params.token);
  const quoteToken = canonicalHex(event.params.quoteToken);
  const pending = new PendingLaunch(id);
  pending.chainId = context.chainId;
  pending.launchpad = launchpad.id;
  pending.token = token;
  pending.creator = canonicalHex(event.params.creator);
  pending.quoteToken = quoteToken;
  pending.pool = canonicalHex(event.params.pool);
  // V3 token ordering is ascending by address. Fixed-width canonical hex
  // strings preserve the same ordering without token0/token1 RPC calls.
  pending.launchTokenIsToken0 = token < quoteToken;
  pending.name = event.params.name;
  pending.symbol = event.params.symbol;
  pending.startTick = event.params.startTick;
  pending.sushiFeeBps = event.params.initialSushiFeeBps;
  pending.reserveBps = event.params.reserveBps;
  pending.reserveAmount = event.params.reserveAmount;
  pending.reserveUnlockAt = event.params.reserveUnlockAt;
  pending.creationTransactionHash = canonicalHex(event.transaction.hash);
  pending.creationLogIndex = event.logIndex;
  pending.creationBlockNumber = event.block.number;
  pending.creationBlockHash = canonicalHex(event.block.hash);
  pending.createdAt = event.block.timestamp;
  pending.save();
}

export function handlePositionCreated(event: PositionCreatedEvent): void {
  const context = deploymentContext();
  const launchpad = getOrCreateLaunchpad(context, event.address);
  const id = addressId(context.chainId, event.params.token);
  const pending = PendingLaunch.load(id);
  assert(pending != null, "Position references no pending launch " + id);
  const launchData = changetype<PendingLaunch>(pending);
  const invariants = requireLaunchInvariants(launchpad);
  assert(
    launchData.launchpad == launchpad.id &&
      launchData.pool == canonicalHex(event.params.pool) &&
      launchData.creationTransactionHash ==
        canonicalHex(event.transaction.hash) &&
      event.logIndex.gt(launchData.creationLogIndex) &&
      Launch.load(id) == null,
    "Position does not complete pending launch " + id
  );
  assert(
    invariants.totalSupply.ge(launchData.reserveAmount),
    "Launch reserve exceeds token supply " + id
  );
  const expectedTokenDesired = invariants.totalSupply.minus(
    launchData.reserveAmount
  );
  const launchBoundaryMatches = launchData.launchTokenIsToken0
    ? event.params.tickLower == launchData.startTick
    : event.params.tickUpper == -launchData.startTick;
  assert(
    launchData.startTick % invariants.poolTickSpacing == 0 &&
      event.params.tickLower % invariants.poolTickSpacing == 0 &&
      event.params.tickUpper % invariants.poolTickSpacing == 0 &&
      event.params.tickLower < event.params.tickUpper &&
      launchBoundaryMatches &&
      event.params.tokenDesired.equals(expectedTokenDesired) &&
      event.params.tokenUsed.le(event.params.tokenDesired) &&
      event.params.liquidity.gt(BigInt.zero()),
    "Position configuration does not reconcile for " + id
  );

  const launch = new Launch(id);
  launch.chainId = context.chainId;
  launch.launchpad = launchpad.id;
  launch.token = launchData.token;
  launch.initialCreator = launchData.creator;
  launch.creator = launchData.creator;
  launch.quoteToken = launchData.quoteToken;
  launch.pool = launchData.pool;
  launch.launchTokenIsToken0 = launchData.launchTokenIsToken0;
  launch.name = launchData.name;
  launch.symbol = launchData.symbol;
  launch.decimals = invariants.decimals;
  launch.totalSupply = invariants.totalSupply;
  launch.initialFdvUsd = launchpad.initialFdvUsd;
  launch.startTick = launchData.startTick;
  launch.poolFee = invariants.poolFee;
  launch.poolTickSpacing = invariants.poolTickSpacing;
  launch.positionManager = launchpad.positionManager;
  launch.positionId = event.params.positionId;
  launch.tickLower = event.params.tickLower;
  launch.tickUpper = event.params.tickUpper;
  launch.tokenDesired = event.params.tokenDesired;
  launch.tokenUsed = event.params.tokenUsed;
  launch.liquidity = event.params.liquidity;
  launch.sushiFeeBps = launchData.sushiFeeBps;
  launch.reserveBps = launchData.reserveBps;
  launch.reserveAmount = launchData.reserveAmount;
  launch.reserveUnlockAt = launchData.reserveUnlockAt;
  launch.reserveWithdrawn = false;
  launch.creationTransactionHash = launchData.creationTransactionHash;
  launch.creationLogIndex = launchData.creationLogIndex;
  launch.positionCreationLogIndex = event.logIndex;
  launch.creationBlockNumber = launchData.creationBlockNumber;
  launch.creationBlockHash = launchData.creationBlockHash;
  launch.createdAt = launchData.createdAt;
  launch.save();

  store.remove("PendingLaunch", id);
}
