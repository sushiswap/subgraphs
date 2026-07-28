import { Address, store } from "@graphprotocol/graph-ts";
import {
  DefaultSushiFeeBpsUpdated as DefaultSushiFeeBpsUpdatedEvent,
  LaunchFeesWithdrawn as LaunchFeesWithdrawnEvent,
  LaunchFeeUpdated as LaunchFeeUpdatedEvent,
  ProtocolRecipientUpdated as ProtocolRecipientUpdatedEvent,
  ProtocolReserveBpsUpdated as ProtocolReserveBpsUpdatedEvent,
  QuoteTokenPriceFeedUpdated as QuoteTokenPriceFeedUpdatedEvent,
} from "../../generated/SushiLaunchpad/SushiLaunchpad";
import {
  LaunchFeeWithdrawal,
  QuoteTokenPriceFeed,
} from "../../generated/schema";
import {
  canonicalHex,
  deploymentContext,
  eventId,
  getOrCreateLaunchpad,
  quoteTokenPriceFeedId,
} from "./shared";

export function handleDefaultSushiFeeBpsUpdated(
  event: DefaultSushiFeeBpsUpdatedEvent
): void {
  const context = deploymentContext();
  const launchpad = getOrCreateLaunchpad(context, event.address);

  launchpad.defaultSushiFeeBps = event.params.newBps;
  launchpad.save();
}

export function handleProtocolReserveBpsUpdated(
  event: ProtocolReserveBpsUpdatedEvent
): void {
  const context = deploymentContext();
  const launchpad = getOrCreateLaunchpad(context, event.address);

  launchpad.protocolReserveBps = event.params.newBps;
  launchpad.save();
}

export function handleProtocolRecipientUpdated(
  event: ProtocolRecipientUpdatedEvent
): void {
  const context = deploymentContext();
  const launchpad = getOrCreateLaunchpad(context, event.address);
  launchpad.protocolRecipient = canonicalHex(event.params.newRecipient);
  launchpad.save();
}

export function handleLaunchFeeUpdated(event: LaunchFeeUpdatedEvent): void {
  const context = deploymentContext();
  const launchpad = getOrCreateLaunchpad(context, event.address);
  launchpad.launchFee = event.params.newFee;
  launchpad.save();
}

export function handleLaunchFeesWithdrawn(
  event: LaunchFeesWithdrawnEvent
): void {
  const context = deploymentContext();
  const launchpad = getOrCreateLaunchpad(context, event.address);
  const id = eventId(context.chainId, event);
  assert(
    LaunchFeeWithdrawal.load(id) == null,
    "Duplicate launch fee withdrawal " + id
  );

  const withdrawal = new LaunchFeeWithdrawal(id);
  withdrawal.chainId = context.chainId;
  withdrawal.launchpad = launchpad.id;
  withdrawal.recipient = canonicalHex(event.params.recipient);
  withdrawal.amount = event.params.amount;
  withdrawal.transactionHash = canonicalHex(event.transaction.hash);
  withdrawal.logIndex = event.logIndex;
  withdrawal.blockNumber = event.block.number;
  withdrawal.blockHash = canonicalHex(event.block.hash);
  withdrawal.timestamp = event.block.timestamp;
  withdrawal.save();
}

export function handleQuoteTokenPriceFeedUpdated(
  event: QuoteTokenPriceFeedUpdatedEvent
): void {
  const context = deploymentContext();
  const launchpad = getOrCreateLaunchpad(context, event.address);
  const id = quoteTokenPriceFeedId(launchpad, event.params.quoteToken);
  let configuration = QuoteTokenPriceFeed.load(id);
  if (configuration == null) {
    assert(
      event.params.previousPriceFeed.equals(Address.zero()),
      "New quote token price feed has a nonzero predecessor " + id
    );
    if (event.params.newPriceFeed.equals(Address.zero())) {
      return;
    }
    configuration = new QuoteTokenPriceFeed(id);
    configuration.chainId = context.chainId;
    configuration.launchpad = launchpad.id;
    configuration.quoteToken = canonicalHex(event.params.quoteToken);
  } else {
    assert(
      configuration.priceFeed == canonicalHex(event.params.previousPriceFeed),
      "Quote token price feed update does not reconcile " + id
    );
    if (event.params.newPriceFeed.equals(Address.zero())) {
      store.remove("QuoteTokenPriceFeed", id);
      return;
    }
  }
  configuration.priceFeed = canonicalHex(event.params.newPriceFeed);
  configuration.updatedTransactionHash = canonicalHex(event.transaction.hash);
  configuration.updatedLogIndex = event.logIndex;
  configuration.updatedBlockNumber = event.block.number;
  configuration.updatedBlockHash = canonicalHex(event.block.hash);
  configuration.updatedAt = event.block.timestamp;
  configuration.save();
}
