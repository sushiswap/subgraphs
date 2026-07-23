import { BigInt } from "@graphprotocol/graph-ts";
import { afterEach, assert, beforeEach, clearStore, test } from "matchstick-as";
import {
  handleDefaultSushiFeeBpsUpdated,
  handleFeesDistributed,
  handleLaunchFeesWithdrawn,
  handleLaunchFeeUpdated,
  handlePositionCreated,
  handleProtocolRecipientUpdated,
  handleProtocolReserveBpsUpdated,
  handleProtocolReserveWithdrawn,
  handleSushiFeeBpsUpdated,
  handleTokenLaunched,
} from "../src/mappings/launchpad";
import {
  CALLER,
  CHAIN_ID,
  CREATOR,
  CREATOR_TWO,
  FACTORY,
  OTHER_POOL,
  POOL,
  POOL_THREE,
  POSITION_MANAGER,
  PROTOCOL_RECIPIENT,
  PROTOCOL_RECIPIENT_TWO,
  QUOTE_TOKEN,
  QUOTE_TOKEN_TWO,
  TOKEN,
  TOKEN_THREE,
  TOKEN_TWO,
  createDefaultSushiFeeBpsUpdated,
  createFeesDistributed,
  createLaunchFeesWithdrawn,
  createLaunchFeeUpdated,
  createPositionCreated,
  createProtocolReserveBpsUpdated,
  createProtocolRecipientUpdated,
  createProtocolReserveWithdrawn,
  createSushiFeeBpsUpdated,
  createTokenLaunched,
  mockDeploymentContext,
  mockV3Pool,
} from "./mocks";

const LAUNCHPAD_ID = CHAIN_ID.toString() + ":" + FACTORY.toHexString();
const TOKEN_ID = CHAIN_ID.toString() + ":" + TOKEN.toHexString();
const POOL_ID = CHAIN_ID.toString() + ":" + POOL.toHexString();
const CREATOR_ID = LAUNCHPAD_ID + ":" + CREATOR.toHexString();
const POSITION_PREFIX =
  CHAIN_ID.toString() + ":" + POSITION_MANAGER.toHexString() + ":";

beforeEach(() => {
  mockDeploymentContext();
});

afterEach(() => {
  clearStore();
});

test("builds Launchpad, Token, Pool, and canonical initial positions", () => {
  handlePositionCreated(createPositionCreated(101, 10));
  handlePositionCreated(createPositionCreated(102, 11));

  assert.entityCount("Token", 0);
  assert.entityCount("Pool", 1);
  assert.fieldEquals("Pool", POOL_ID, "positionCount", "2");
  assert.fieldEquals("Launchpad", LAUNCHPAD_ID, "positionCount", "2");

  handleTokenLaunched(createTokenLaunched(2, 12));

  assert.entityCount("Launchpad", 1);
  assert.entityCount("Creator", 1);
  assert.entityCount("Token", 1);
  assert.entityCount("Pool", 1);
  assert.entityCount("LaunchPosition", 2);

  assert.fieldEquals("Launchpad", LAUNCHPAD_ID, "chainId", CHAIN_ID.toString());
  assert.fieldEquals(
    "Launchpad",
    LAUNCHPAD_ID,
    "address",
    FACTORY.toHexString()
  );
  assert.fieldEquals(
    "Launchpad",
    LAUNCHPAD_ID,
    "positionManager",
    POSITION_MANAGER.toHexString()
  );
  assert.fieldEquals(
    "Launchpad",
    LAUNCHPAD_ID,
    "protocolRecipient",
    PROTOCOL_RECIPIENT.toHexString()
  );
  assert.fieldEquals("Launchpad", LAUNCHPAD_ID, "launchFee", "500000000000000");
  assert.fieldEquals("Launchpad", LAUNCHPAD_ID, "defaultSushiFeeBps", "7000");
  assert.fieldEquals("Launchpad", LAUNCHPAD_ID, "protocolReserveBps", "300");
  assert.fieldEquals("Launchpad", LAUNCHPAD_ID, "tokenCount", "1");
  assert.fieldEquals("Launchpad", LAUNCHPAD_ID, "creatorCount", "1");

  assert.fieldEquals("Creator", CREATOR_ID, "address", CREATOR.toHexString());
  assert.fieldEquals("Creator", CREATOR_ID, "tokenCount", "1");

  assert.fieldEquals("Token", TOKEN_ID, "address", TOKEN.toHexString());
  assert.fieldEquals("Token", TOKEN_ID, "launchpad", LAUNCHPAD_ID);
  assert.fieldEquals("Token", TOKEN_ID, "creator", CREATOR_ID);
  assert.fieldEquals("Token", TOKEN_ID, "pool", POOL_ID);
  assert.fieldEquals(
    "Token",
    TOKEN_ID,
    "quoteToken",
    QUOTE_TOKEN.toHexString()
  );
  assert.fieldEquals("Token", TOKEN_ID, "name", "Sushi Test");
  assert.fieldEquals("Token", TOKEN_ID, "symbol", "SUSHIT");
  assert.fieldEquals("Token", TOKEN_ID, "decimals", "18");
  assert.fieldEquals("Token", TOKEN_ID, "sushiFeeBps", "7000");
  assert.fieldEquals("Token", TOKEN_ID, "reserveBps", "300");
  assert.fieldEquals("Token", TOKEN_ID, "reserveAmount", "30000000000000000");
  assert.fieldEquals("Token", TOKEN_ID, "reserveUnlockAt", "31536001");
  assert.fieldEquals("Token", TOKEN_ID, "reserveWithdrawn", "false");

  assert.fieldEquals("Pool", POOL_ID, "token0", TOKEN.toHexString());
  assert.fieldEquals("Pool", POOL_ID, "token1", QUOTE_TOKEN.toHexString());
  assert.fieldEquals("Pool", POOL_ID, "fee", "10000");
  assert.fieldEquals("Pool", POOL_ID, "tickSpacing", "200");

  const firstPositionId = POSITION_PREFIX + "101";
  assert.fieldEquals("LaunchPosition", firstPositionId, "pool", POOL_ID);
  assert.fieldEquals("LaunchPosition", firstPositionId, "index", "0");
  assert.fieldEquals("LaunchPosition", firstPositionId, "tickLower", "-400");
  assert.fieldEquals("LaunchPosition", firstPositionId, "tickUpper", "-200");
  assert.fieldEquals(
    "LaunchPosition",
    firstPositionId,
    "amount0Desired",
    "1000"
  );
  assert.fieldEquals("LaunchPosition", firstPositionId, "amount1Desired", "0");
  assert.fieldEquals("LaunchPosition", firstPositionId, "amount0", "999");
  assert.fieldEquals("LaunchPosition", firstPositionId, "amount1", "0");
});

test("counts distinct creators and canonicalizes either token ordering", () => {
  handlePositionCreated(createPositionCreated(101, 10));
  handleTokenLaunched(createTokenLaunched(1, 11));

  mockV3Pool(OTHER_POOL, QUOTE_TOKEN, TOKEN_TWO);
  handlePositionCreated(createPositionCreated(102, 20, OTHER_POOL, TOKEN_TWO));
  handleTokenLaunched(
    createTokenLaunched(1, 21, TOKEN_TWO, OTHER_POOL, CREATOR)
  );

  mockV3Pool(POOL_THREE, TOKEN_THREE, QUOTE_TOKEN_TWO);
  handlePositionCreated(
    createPositionCreated(103, 30, POOL_THREE, TOKEN_THREE)
  );
  handleTokenLaunched(
    createTokenLaunched(
      1,
      31,
      TOKEN_THREE,
      POOL_THREE,
      CREATOR_TWO,
      QUOTE_TOKEN_TWO
    )
  );

  assert.fieldEquals("Launchpad", LAUNCHPAD_ID, "tokenCount", "3");
  assert.fieldEquals("Launchpad", LAUNCHPAD_ID, "creatorCount", "2");
  assert.fieldEquals("Launchpad", LAUNCHPAD_ID, "positionCount", "3");
  assert.fieldEquals("Creator", CREATOR_ID, "tokenCount", "2");

  const secondPoolId = CHAIN_ID.toString() + ":" + OTHER_POOL.toHexString();
  const secondTokenId = CHAIN_ID.toString() + ":" + TOKEN_TWO.toHexString();
  const thirdTokenId = CHAIN_ID.toString() + ":" + TOKEN_THREE.toHexString();
  assert.fieldEquals(
    "Token",
    secondTokenId,
    "quoteToken",
    QUOTE_TOKEN.toHexString()
  );
  assert.fieldEquals(
    "Token",
    thirdTokenId,
    "quoteToken",
    QUOTE_TOKEN_TWO.toHexString()
  );
  assert.fieldEquals("Pool", secondPoolId, "token0", QUOTE_TOKEN.toHexString());
  assert.fieldEquals("Pool", secondPoolId, "token1", TOKEN_TWO.toHexString());
  assert.fieldEquals(
    "LaunchPosition",
    POSITION_PREFIX + "102",
    "amount0Desired",
    "0"
  );
  assert.fieldEquals(
    "LaunchPosition",
    POSITION_PREFIX + "102",
    "amount1Desired",
    "1000"
  );
  assert.fieldEquals("LaunchPosition", POSITION_PREFIX + "102", "amount0", "0");
  assert.fieldEquals(
    "LaunchPosition",
    POSITION_PREFIX + "102",
    "amount1",
    "999"
  );

  handleSushiFeeBpsUpdated(
    createSushiFeeBpsUpdated(7_000, 6_500, 40, TOKEN_TWO)
  );
  const distribution = createFeesDistributed(
    41,
    TOKEN_TWO,
    OTHER_POOL,
    CREATOR
  );
  handleFeesDistributed(distribution);
  const distributionId =
    CHAIN_ID.toString() +
    ":" +
    distribution.transaction.hash.toHexString() +
    ":41";
  assert.fieldEquals(
    "FeeDistribution",
    distributionId,
    "amount0Collected",
    "100"
  );
  assert.fieldEquals(
    "FeeDistribution",
    distributionId,
    "amount1Collected",
    "200"
  );
});

test("tracks current Launchpad defaults", () => {
  handleDefaultSushiFeeBpsUpdated(
    createDefaultSushiFeeBpsUpdated(7_000, 6_000, 10)
  );
  handleProtocolReserveBpsUpdated(
    createProtocolReserveBpsUpdated(300, 500, 11)
  );

  assert.fieldEquals("Launchpad", LAUNCHPAD_ID, "defaultSushiFeeBps", "6000");
  assert.fieldEquals("Launchpad", LAUNCHPAD_ID, "protocolReserveBps", "500");
  assert.fieldEquals("Launchpad", LAUNCHPAD_ID, "tokenCount", "0");
});

test("keeps token launch snapshots scoped to Token", () => {
  handlePositionCreated(createPositionCreated(101, 10));
  handleTokenLaunched(
    createTokenLaunched(1, 11, TOKEN, POOL, CREATOR, QUOTE_TOKEN, 6_000, 500)
  );

  assert.fieldEquals("Launchpad", LAUNCHPAD_ID, "defaultSushiFeeBps", "7000");
  assert.fieldEquals("Launchpad", LAUNCHPAD_ID, "protocolReserveBps", "300");
  assert.fieldEquals("Token", TOKEN_ID, "sushiFeeBps", "6000");
  assert.fieldEquals("Token", TOKEN_ID, "reserveBps", "500");
});

test("tracks Launchpad recipient, launch fee, and fee withdrawals", () => {
  const initialFee = BigInt.fromString("500000000000000");
  const updatedFee = BigInt.fromString("1000000000000000");
  const withdrawn = BigInt.fromString("1500000000000000");

  handleProtocolRecipientUpdated(
    createProtocolRecipientUpdated(
      PROTOCOL_RECIPIENT,
      PROTOCOL_RECIPIENT_TWO,
      10
    )
  );
  handleLaunchFeeUpdated(createLaunchFeeUpdated(initialFee, updatedFee, 11));
  const withdrawal = createLaunchFeesWithdrawn(
    PROTOCOL_RECIPIENT_TWO,
    withdrawn,
    12
  );
  handleLaunchFeesWithdrawn(withdrawal);

  assert.fieldEquals(
    "Launchpad",
    LAUNCHPAD_ID,
    "protocolRecipient",
    PROTOCOL_RECIPIENT_TWO.toHexString()
  );
  assert.fieldEquals(
    "Launchpad",
    LAUNCHPAD_ID,
    "launchFee",
    updatedFee.toString()
  );
  const withdrawalId =
    CHAIN_ID.toString() +
    ":" +
    withdrawal.transaction.hash.toHexString() +
    ":12";
  assert.fieldEquals(
    "LaunchFeeWithdrawal",
    withdrawalId,
    "launchpad",
    LAUNCHPAD_ID
  );
  assert.fieldEquals(
    "LaunchFeeWithdrawal",
    withdrawalId,
    "recipient",
    PROTOCOL_RECIPIENT_TWO.toHexString()
  );
  assert.fieldEquals(
    "LaunchFeeWithdrawal",
    withdrawalId,
    "amount",
    withdrawn.toString()
  );
});

test("tracks fee distributions and reserve withdrawals on Token", () => {
  handlePositionCreated(createPositionCreated(101, 10));
  handleTokenLaunched(createTokenLaunched(1, 11));
  handleSushiFeeBpsUpdated(createSushiFeeBpsUpdated(7_000, 6_500, 12));

  const distribution = createFeesDistributed(13);
  handleFeesDistributed(distribution);
  handleProtocolReserveWithdrawn(createProtocolReserveWithdrawn(14));

  assert.fieldEquals("Token", TOKEN_ID, "sushiFeeBps", "6500");
  assert.fieldEquals("Token", TOKEN_ID, "totalAmount0Collected", "200");
  assert.fieldEquals("Token", TOKEN_ID, "totalAmount1Collected", "100");
  assert.fieldEquals("Token", TOKEN_ID, "totalAmount0ToSushi", "130");
  assert.fieldEquals("Token", TOKEN_ID, "totalAmount1ToSushi", "65");
  assert.fieldEquals("Token", TOKEN_ID, "totalAmount0ToCreator", "70");
  assert.fieldEquals("Token", TOKEN_ID, "totalAmount1ToCreator", "35");
  assert.fieldEquals("Token", TOKEN_ID, "reserveWithdrawn", "true");

  const distributionId =
    CHAIN_ID.toString() +
    ":" +
    distribution.transaction.hash.toHexString() +
    ":13";
  assert.fieldEquals("FeeDistribution", distributionId, "token", TOKEN_ID);
  assert.fieldEquals("FeeDistribution", distributionId, "pool", POOL_ID);
  assert.fieldEquals(
    "FeeDistribution",
    distributionId,
    "caller",
    CALLER.toHexString()
  );
  assert.fieldEquals(
    "FeeDistribution",
    distributionId,
    "sushiRecipient",
    PROTOCOL_RECIPIENT.toHexString()
  );
  assert.fieldEquals(
    "FeeDistribution",
    distributionId,
    "creatorRecipient",
    CREATOR.toHexString()
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

  const withdrawalId =
    CHAIN_ID.toString() +
    ":" +
    distribution.transaction.hash.toHexString() +
    ":14";
  assert.fieldEquals("Token", TOKEN_ID, "reserveWithdrawal", withdrawalId);
  assert.fieldEquals("ReserveWithdrawal", withdrawalId, "token", TOKEN_ID);
  assert.fieldEquals(
    "ReserveWithdrawal",
    withdrawalId,
    "recipient",
    PROTOCOL_RECIPIENT.toHexString()
  );
  assert.fieldEquals(
    "ReserveWithdrawal",
    withdrawalId,
    "amount",
    "30000000000000000"
  );
});

test(
  "fails deterministically when ordered position identities disagree",
  () => {
    handlePositionCreated(createPositionCreated(101, 10));
    handlePositionCreated(createPositionCreated(102, 11, POOL, TOKEN_TWO));
  },
  true
);

test(
  "fails deterministically when the launch count does not reconcile",
  () => {
    handlePositionCreated(createPositionCreated(101, 10));
    handleTokenLaunched(createTokenLaunched(2, 11));
  },
  true
);

test(
  "fails deterministically when the emitted quote token does not match the pool",
  () => {
    handlePositionCreated(createPositionCreated(101, 10));
    handleTokenLaunched(
      createTokenLaunched(1, 11, TOKEN, POOL, CREATOR, QUOTE_TOKEN_TWO)
    );
  },
  true
);
