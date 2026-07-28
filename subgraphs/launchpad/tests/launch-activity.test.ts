import { afterEach, assert, beforeEach, clearStore, test } from "matchstick-as";
import {
  handleCreatorTransferred,
  handleFeesDistributed,
  handleInitialBuyExecuted,
  handlePositionCreated,
  handleProtocolReserveWithdrawn,
  handleSushiFeeBpsUpdated,
  handleTokenLaunched,
} from "../src/mapping";
import {
  CALLER,
  CHAIN_ID,
  CREATOR_TWO,
  POOL,
  TOKEN,
  createCreatorTransferred,
  createFeesDistributed,
  createInitialBuyExecuted,
  createPositionCreated,
  createProtocolReserveWithdrawn,
  createSushiFeeBpsUpdated,
  createTokenLaunched,
  mockDeploymentContext,
} from "./mocks";

const LAUNCH_ID = CHAIN_ID.toString() + ":" + TOKEN.toHexString();

beforeEach(() => {
  mockDeploymentContext();
});

afterEach(() => {
  clearStore();
});

test("records immutable per-launch activity", () => {
  handleTokenLaunched(createTokenLaunched(10));
  handlePositionCreated(createPositionCreated(101, 11));
  handleInitialBuyExecuted(createInitialBuyExecuted(12));
  handleSushiFeeBpsUpdated(createSushiFeeBpsUpdated(7_000, 6_500, 13));
  handleCreatorTransferred(createCreatorTransferred(14));

  const distributionEvent = createFeesDistributed(15, TOKEN, POOL, CREATOR_TWO);
  handleFeesDistributed(distributionEvent);
  const reserveEvent = createProtocolReserveWithdrawn(16);
  handleProtocolReserveWithdrawn(reserveEvent);

  assert.fieldEquals("Launch", LAUNCH_ID, "reserveWithdrawn", "true");
  assert.entityCount("InitialBuy", 1);
  assert.entityCount("FeeDistribution", 1);
  assert.entityCount("ReserveWithdrawal", 1);

  const distributionId =
    CHAIN_ID.toString() +
    ":" +
    distributionEvent.transaction.hash.toHexString() +
    ":15";
  assert.fieldEquals("FeeDistribution", distributionId, "launch", LAUNCH_ID);
  assert.fieldEquals(
    "FeeDistribution",
    distributionId,
    "pool",
    POOL.toHexString().toLowerCase()
  );
  assert.fieldEquals(
    "FeeDistribution",
    distributionId,
    "caller",
    CALLER.toHexString().toLowerCase()
  );
  assert.fieldEquals(
    "FeeDistribution",
    distributionId,
    "amount0Collected",
    "200"
  );
  assert.fieldEquals(
    "FeeDistribution",
    distributionId,
    "amount1Collected",
    "100"
  );
});
