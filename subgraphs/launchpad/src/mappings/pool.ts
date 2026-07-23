import { BigInt } from "@graphprotocol/graph-ts";
import { PositionCreated as PositionCreatedEvent } from "../../generated/SushiLaunchpad/SushiLaunchpad";
import { SushiV3Pool } from "../../generated/SushiLaunchpad/SushiV3Pool";
import { LaunchPosition, Pool, Token } from "../../generated/schema";
import {
  addressId,
  deploymentContext,
  getOrCreateLaunchpad,
  positionId,
} from "./helpers";

export function handlePositionCreated(event: PositionCreatedEvent): void {
  const context = deploymentContext();
  const launchpad = getOrCreateLaunchpad(context, event.address);
  const idForToken = addressId(context.chainId, event.params.token);
  assert(
    Token.load(idForToken) == null,
    "Position emitted after token launch " + idForToken
  );

  const idForPool = addressId(context.chainId, event.params.pool);
  let pool = Pool.load(idForPool);
  if (pool == null) {
    const contract = SushiV3Pool.bind(event.params.pool);
    const token0 = contract.token0();
    const token1 = contract.token1();
    const tokenIs0 = token0.equals(event.params.token);
    const tokenIs1 = token1.equals(event.params.token);
    assert(
      tokenIs0 != tokenIs1,
      "Launch position token must be exactly one side of pool " + idForPool
    );
    pool = new Pool(idForPool);
    pool.chainId = context.chainId;
    pool.launchpad = launchpad.id;
    pool.address = event.params.pool;
    pool.token0 = token0;
    pool.token1 = token1;
    pool.fee = contract.fee();
    pool.tickSpacing = contract.tickSpacing();
    pool.positionManager = launchpad.positionManager;
    pool.positionCount = 0;
    pool.creationTransactionHash = event.transaction.hash;
    pool.creationBlockNumber = event.block.number;
    pool.creationBlockHash = event.block.hash;
    pool.createdAt = event.block.timestamp;
  } else {
    const tokenIs0 = pool.token0.equals(event.params.token);
    const tokenIs1 = pool.token1.equals(event.params.token);
    assert(
      pool.launchpad == launchpad.id &&
        pool.address.equals(event.params.pool) &&
        pool.positionManager.equals(launchpad.positionManager) &&
        tokenIs0 != tokenIs1,
      "Inconsistent ordered position events for pool " + idForPool
    );
  }

  const idForPosition = positionId(
    context.chainId,
    launchpad.positionManager,
    event.params.positionId
  );
  assert(
    LaunchPosition.load(idForPosition) == null,
    "Duplicate launch position " + idForPosition
  );

  const zero = BigInt.zero();
  const tokenIs0 = pool.token0.equals(event.params.token);
  const position = new LaunchPosition(idForPosition);
  position.chainId = context.chainId;
  position.pool = pool.id;
  position.positionManager = launchpad.positionManager;
  position.positionId = event.params.positionId;
  position.index = pool.positionCount;
  position.tickLower = event.params.tickLower;
  position.tickUpper = event.params.tickUpper;
  position.amount0Desired = tokenIs0 ? event.params.tokenDesired : zero;
  position.amount1Desired = tokenIs0 ? zero : event.params.tokenDesired;
  position.amount0 = tokenIs0 ? event.params.tokenUsed : zero;
  position.amount1 = tokenIs0 ? zero : event.params.tokenUsed;
  position.liquidity = event.params.liquidity;
  position.creationTransactionHash = event.transaction.hash;
  position.creationLogIndex = event.logIndex;
  position.creationBlockNumber = event.block.number;
  position.creationBlockHash = event.block.hash;
  position.createdAt = event.block.timestamp;
  position.save();

  pool.positionCount += 1;
  pool.save();
  launchpad.positionCount += 1;
  launchpad.save();
}
