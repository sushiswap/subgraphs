import { afterEach, assert, beforeEach, clearStore, test } from "matchstick-as";
import {
  handleCreatorTransferred,
  handlePositionCreated,
  handleSushiFeeBpsUpdated,
  handleTokenLaunched,
} from "../src/mapping";
import {
  CHAIN_ID,
  CREATOR,
  CREATOR_TWO,
  TOKEN,
  createCreatorTransferred,
  createPositionCreated,
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

test("tracks mutable launch state and creator transfer history", () => {
  handleTokenLaunched(createTokenLaunched(10));
  handlePositionCreated(createPositionCreated(101, 11));
  handleSushiFeeBpsUpdated(createSushiFeeBpsUpdated(7_000, 6_500, 13));
  const transferEvent = createCreatorTransferred(14);
  handleCreatorTransferred(transferEvent);

  assert.fieldEquals(
    "Launch",
    LAUNCH_ID,
    "creator",
    CREATOR_TWO.toHexString().toLowerCase()
  );
  assert.fieldEquals("Launch", LAUNCH_ID, "sushiFeeBps", "6500");
  assert.entityCount("CreatorTransfer", 1);

  const transferId =
    CHAIN_ID.toString() +
    ":" +
    transferEvent.transaction.hash.toHexString() +
    ":14";
  assert.fieldEquals("CreatorTransfer", transferId, "launch", LAUNCH_ID);
  assert.fieldEquals(
    "CreatorTransfer",
    transferId,
    "previousCreator",
    CREATOR.toHexString().toLowerCase()
  );
  assert.fieldEquals(
    "CreatorTransfer",
    transferId,
    "newCreator",
    CREATOR_TWO.toHexString().toLowerCase()
  );
});
