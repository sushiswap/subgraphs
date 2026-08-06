import { Address, BigInt } from "@graphprotocol/graph-ts";
import { afterEach, assert, beforeEach, clearStore, test } from "matchstick-as";
import {
  handleDefaultSushiFeeBpsUpdated,
  handleLaunchFeesWithdrawn,
  handleLaunchFeeUpdated,
  handleProtocolRecipientUpdated,
  handleProtocolReserveBpsUpdated,
  handleQuoteTokenPriceFeedUpdated,
} from "../src/mapping";
import {
  CHAIN_ID,
  FACTORY,
  PRICE_FEED,
  PRICE_FEED_TWO,
  PROTOCOL_RECIPIENT,
  PROTOCOL_RECIPIENT_TWO,
  QUOTE_TOKEN,
  createDefaultSushiFeeBpsUpdated,
  createLaunchFeesWithdrawn,
  createLaunchFeeUpdated,
  createProtocolRecipientUpdated,
  createProtocolReserveBpsUpdated,
  createQuoteTokenPriceFeedUpdated,
  mockDeploymentContext,
} from "./mocks";

const LAUNCHPAD_ID = CHAIN_ID.toString() + ":" + FACTORY.toHexString();

beforeEach(() => {
  mockDeploymentContext();
});

afterEach(() => {
  clearStore();
});

test("tracks current factory configuration and quote-token feeds", () => {
  handleDefaultSushiFeeBpsUpdated(
    createDefaultSushiFeeBpsUpdated(7_000, 6_000, 10)
  );
  handleProtocolReserveBpsUpdated(
    createProtocolReserveBpsUpdated(300, 500, 11)
  );
  handleProtocolRecipientUpdated(
    createProtocolRecipientUpdated(
      PROTOCOL_RECIPIENT,
      PROTOCOL_RECIPIENT_TWO,
      12
    )
  );
  handleLaunchFeeUpdated(
    createLaunchFeeUpdated(
      BigInt.fromString("500000000000000"),
      BigInt.fromString("1000000000000000"),
      13
    )
  );
  handleQuoteTokenPriceFeedUpdated(
    createQuoteTokenPriceFeedUpdated(Address.zero(), PRICE_FEED, 14)
  );
  handleQuoteTokenPriceFeedUpdated(
    createQuoteTokenPriceFeedUpdated(PRICE_FEED, PRICE_FEED_TWO, 15)
  );
  const priceFeedId = LAUNCHPAD_ID + ":" + QUOTE_TOKEN.toHexString();
  assert.fieldEquals(
    "QuoteTokenPriceFeed",
    priceFeedId,
    "priceFeed",
    PRICE_FEED_TWO.toHexString().toLowerCase()
  );
  handleQuoteTokenPriceFeedUpdated(
    createQuoteTokenPriceFeedUpdated(PRICE_FEED_TWO, Address.zero(), 16)
  );
  assert.entityCount("QuoteTokenPriceFeed", 0);
  const withdrawal = createLaunchFeesWithdrawn(
    PROTOCOL_RECIPIENT_TWO,
    BigInt.fromI32(123),
    17
  );
  handleLaunchFeesWithdrawn(withdrawal);

  assert.fieldEquals("Launchpad", LAUNCHPAD_ID, "defaultSushiFeeBps", "6000");
  assert.fieldEquals("Launchpad", LAUNCHPAD_ID, "protocolReserveBps", "500");
  assert.fieldEquals(
    "Launchpad",
    LAUNCHPAD_ID,
    "protocolRecipient",
    PROTOCOL_RECIPIENT_TWO.toHexString().toLowerCase()
  );
  assert.fieldEquals(
    "Launchpad",
    LAUNCHPAD_ID,
    "launchFee",
    "1000000000000000"
  );
  assert.entityCount("LaunchFeeWithdrawal", 1);
});
