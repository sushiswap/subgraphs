import {
  DefaultSushiFeeBpsUpdated as DefaultSushiFeeBpsUpdatedEvent,
  LaunchFeesWithdrawn as LaunchFeesWithdrawnEvent,
  LaunchFeeUpdated as LaunchFeeUpdatedEvent,
  ProtocolRecipientUpdated as ProtocolRecipientUpdatedEvent,
  ProtocolReserveBpsUpdated as ProtocolReserveBpsUpdatedEvent,
} from "../../generated/SushiLaunchpad/SushiLaunchpad";
import { LaunchFeeWithdrawal } from "../../generated/schema";
import { deploymentContext, eventId, getOrCreateLaunchpad } from "./helpers";

const BPS_DENOMINATOR = 10_000;
const MAX_PROTOCOL_RESERVE_BPS = 1_000;

export function handleDefaultSushiFeeBpsUpdated(
  event: DefaultSushiFeeBpsUpdatedEvent
): void {
  const context = deploymentContext();
  const launchpad = getOrCreateLaunchpad(context, event.address);
  assert(
    event.params.newBps <= BPS_DENOMINATOR,
    "Invalid default Sushi fee update for " + launchpad.id
  );

  launchpad.defaultSushiFeeBps = event.params.newBps;
  launchpad.save();
}

export function handleProtocolReserveBpsUpdated(
  event: ProtocolReserveBpsUpdatedEvent
): void {
  const context = deploymentContext();
  const launchpad = getOrCreateLaunchpad(context, event.address);
  assert(
    event.params.newBps <= MAX_PROTOCOL_RESERVE_BPS,
    "Invalid protocol reserve update for " + launchpad.id
  );

  launchpad.protocolReserveBps = event.params.newBps;
  launchpad.save();
}

export function handleProtocolRecipientUpdated(
  event: ProtocolRecipientUpdatedEvent
): void {
  const context = deploymentContext();
  const launchpad = getOrCreateLaunchpad(context, event.address);
  launchpad.protocolRecipient = event.params.newRecipient;
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
  withdrawal.recipient = event.params.recipient;
  withdrawal.amount = event.params.amount;
  withdrawal.transactionHash = event.transaction.hash;
  withdrawal.logIndex = event.logIndex;
  withdrawal.blockNumber = event.block.number;
  withdrawal.blockHash = event.block.hash;
  withdrawal.timestamp = event.block.timestamp;
  withdrawal.save();
}

export {
  handleFeesDistributed,
  handleProtocolReserveWithdrawn,
  handleSushiFeeBpsUpdated,
  handleTokenLaunched,
} from "./token";

export { handlePositionCreated } from "./pool";
