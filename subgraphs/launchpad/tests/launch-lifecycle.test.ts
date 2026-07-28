import { afterEach, assert, beforeEach, clearStore, test } from "matchstick-as";
import { Launchpad } from "../generated/schema";
import {
  handleDefaultSushiFeeBpsUpdated,
  handlePositionCreated,
  handleTokenLaunched,
} from "../src/mapping";
import {
  CHAIN_ID,
  CREATOR,
  FACTORY,
  INITIAL_FDV_USD,
  LAUNCH_POOL_FEE,
  LAUNCH_POOL_TICK_SPACING,
  LAUNCH_TOKEN_DECIMALS,
  LAUNCH_TOKEN_DESIRED,
  LAUNCH_TOKEN_TOTAL_SUPPLY,
  LAUNCH_TOKEN_USED,
  OTHER_POOL,
  POOL,
  POSITION_MANAGER,
  QUOTE_TOKEN,
  TOKEN,
  TOKEN_TWO,
  createDefaultSushiFeeBpsUpdated,
  createPositionCreated,
  createPositionCreatedWithInvalidTicks,
  createTokenLaunched,
  mockDeploymentContext,
} from "./mocks";

const LAUNCHPAD_ID = CHAIN_ID.toString() + ":" + FACTORY.toHexString();
const LAUNCH_ID = CHAIN_ID.toString() + ":" + TOKEN.toHexString();

beforeEach(() => {
  mockDeploymentContext();
});

afterEach(() => {
  clearStore();
});

test("publishes Launch only after the required position completes it", () => {
  const tokenEvent = createTokenLaunched(10);
  handleTokenLaunched(tokenEvent);

  assert.entityCount("Launchpad", 1);
  assert.entityCount("PendingLaunch", 1);
  assert.entityCount("Launch", 0);
  assert.fieldEquals(
    "PendingLaunch",
    LAUNCH_ID,
    "pool",
    POOL.toHexString().toLowerCase()
  );
  assert.fieldEquals("PendingLaunch", LAUNCH_ID, "startTick", "-12400");
  assert.fieldEquals(
    "Launchpad",
    LAUNCHPAD_ID,
    "launchTokenDecimals",
    LAUNCH_TOKEN_DECIMALS.toString()
  );
  assert.fieldEquals(
    "Launchpad",
    LAUNCHPAD_ID,
    "launchTokenTotalSupply",
    LAUNCH_TOKEN_TOTAL_SUPPLY.toString()
  );
  assert.fieldEquals(
    "Launchpad",
    LAUNCHPAD_ID,
    "launchPoolFee",
    LAUNCH_POOL_FEE.toString()
  );
  assert.fieldEquals(
    "Launchpad",
    LAUNCHPAD_ID,
    "launchPoolTickSpacing",
    LAUNCH_POOL_TICK_SPACING.toString()
  );

  handlePositionCreated(createPositionCreated(101, 11));

  assert.entityCount("PendingLaunch", 0);
  assert.entityCount("Launch", 1);
  assert.fieldEquals("Launch", LAUNCH_ID, "launchpad", LAUNCHPAD_ID);
  assert.fieldEquals(
    "Launch",
    LAUNCH_ID,
    "token",
    TOKEN.toHexString().toLowerCase()
  );
  assert.fieldEquals(
    "Launch",
    LAUNCH_ID,
    "initialCreator",
    CREATOR.toHexString().toLowerCase()
  );
  assert.fieldEquals(
    "Launch",
    LAUNCH_ID,
    "creator",
    CREATOR.toHexString().toLowerCase()
  );
  assert.fieldEquals(
    "Launch",
    LAUNCH_ID,
    "quoteToken",
    QUOTE_TOKEN.toHexString().toLowerCase()
  );
  assert.fieldEquals(
    "Launch",
    LAUNCH_ID,
    "pool",
    POOL.toHexString().toLowerCase()
  );
  assert.fieldEquals("Launch", LAUNCH_ID, "launchTokenIsToken0", "true");
  assert.fieldEquals("Launch", LAUNCH_ID, "name", "Sushi Test");
  assert.fieldEquals("Launch", LAUNCH_ID, "symbol", "SUSHIT");
  assert.fieldEquals(
    "Launch",
    LAUNCH_ID,
    "decimals",
    LAUNCH_TOKEN_DECIMALS.toString()
  );
  assert.fieldEquals(
    "Launch",
    LAUNCH_ID,
    "totalSupply",
    LAUNCH_TOKEN_TOTAL_SUPPLY.toString()
  );
  assert.fieldEquals(
    "Launchpad",
    LAUNCHPAD_ID,
    "initialFdvUsd",
    INITIAL_FDV_USD.toString()
  );
  assert.fieldEquals(
    "Launch",
    LAUNCH_ID,
    "initialFdvUsd",
    INITIAL_FDV_USD.toString()
  );
  assert.fieldEquals("Launch", LAUNCH_ID, "startTick", "-12400");
  assert.fieldEquals(
    "Launch",
    LAUNCH_ID,
    "poolFee",
    LAUNCH_POOL_FEE.toString()
  );
  assert.fieldEquals(
    "Launch",
    LAUNCH_ID,
    "poolTickSpacing",
    LAUNCH_POOL_TICK_SPACING.toString()
  );
  assert.fieldEquals(
    "Launch",
    LAUNCH_ID,
    "positionManager",
    POSITION_MANAGER.toHexString().toLowerCase()
  );
  assert.fieldEquals("Launch", LAUNCH_ID, "positionId", "101");
  assert.fieldEquals("Launch", LAUNCH_ID, "tickLower", "-12400");
  assert.fieldEquals("Launch", LAUNCH_ID, "tickUpper", "887200");
  assert.fieldEquals(
    "Launch",
    LAUNCH_ID,
    "tokenDesired",
    LAUNCH_TOKEN_DESIRED.toString()
  );
  assert.fieldEquals(
    "Launch",
    LAUNCH_ID,
    "tokenUsed",
    LAUNCH_TOKEN_USED.toString()
  );
  assert.fieldEquals("Launch", LAUNCH_ID, "liquidity", "500");
  assert.fieldEquals("Launch", LAUNCH_ID, "sushiFeeBps", "7000");
  assert.fieldEquals("Launch", LAUNCH_ID, "reserveBps", "300");
  assert.fieldEquals("Launch", LAUNCH_ID, "reserveWithdrawn", "false");
  assert.fieldEquals("Launch", LAUNCH_ID, "creationLogIndex", "10");
  assert.fieldEquals("Launch", LAUNCH_ID, "positionCreationLogIndex", "11");
  assert.fieldEquals(
    "Launch",
    LAUNCH_ID,
    "creationTransactionHash",
    tokenEvent.transaction.hash.toHexString().toLowerCase()
  );
});

test("derives canonical pool ordering without token0/token1 RPC calls", () => {
  const secondLaunchId = CHAIN_ID.toString() + ":" + TOKEN_TWO.toHexString();
  handleTokenLaunched(createTokenLaunched(10));
  handlePositionCreated(createPositionCreated(101, 11));

  // TOKEN_TWO and OTHER_POOL deliberately have no getter mocks. The second
  // launch must reuse the factory-version cache initialized above.
  handleTokenLaunched(
    createTokenLaunched(20, TOKEN_TWO, OTHER_POOL, CREATOR, QUOTE_TOKEN)
  );
  handlePositionCreated(createPositionCreated(102, 21, OTHER_POOL, TOKEN_TWO));

  assert.fieldEquals(
    "Launch",
    secondLaunchId,
    "pool",
    OTHER_POOL.toHexString().toLowerCase()
  );
  assert.fieldEquals("Launch", secondLaunchId, "launchTokenIsToken0", "false");
  assert.fieldEquals(
    "Launch",
    secondLaunchId,
    "decimals",
    LAUNCH_TOKEN_DECIMALS.toString()
  );
  assert.fieldEquals(
    "Launch",
    secondLaunchId,
    "totalSupply",
    LAUNCH_TOKEN_TOTAL_SUPPLY.toString()
  );
  assert.fieldEquals(
    "Launch",
    secondLaunchId,
    "poolFee",
    LAUNCH_POOL_FEE.toString()
  );
  assert.fieldEquals(
    "Launch",
    secondLaunchId,
    "poolTickSpacing",
    LAUNCH_POOL_TICK_SPACING.toString()
  );
});

test(
  "fails deterministically when PositionCreated has no pending launch",
  () => {
    handlePositionCreated(createPositionCreated(101, 10));
  },
  true
);

test(
  "fails deterministically when PositionCreated names another pool",
  () => {
    handleTokenLaunched(createTokenLaunched(10));
    handlePositionCreated(createPositionCreated(101, 11, OTHER_POOL));
  },
  true
);

test(
  "fails deterministically when the completed position has invalid ticks",
  () => {
    handleTokenLaunched(createTokenLaunched(10));
    handlePositionCreated(createPositionCreatedWithInvalidTicks(101, 11));
  },
  true
);

test(
  "fails deterministically when the Launchpad cache is partially initialized",
  () => {
    handleDefaultSushiFeeBpsUpdated(
      createDefaultSushiFeeBpsUpdated(7_000, 6_000, 9)
    );
    const launchpad = changetype<Launchpad>(Launchpad.load(LAUNCHPAD_ID));
    launchpad.launchTokenDecimals = LAUNCH_TOKEN_DECIMALS;
    launchpad.save();

    handleTokenLaunched(createTokenLaunched(10));
  },
  true
);
