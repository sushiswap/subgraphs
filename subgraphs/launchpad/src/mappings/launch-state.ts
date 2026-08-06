import {
  CreatorTransferred as CreatorTransferredEvent,
  SushiFeeBpsUpdated as SushiFeeBpsUpdatedEvent,
} from "../../generated/SushiLaunchpad/SushiLaunchpad";
import { CreatorTransfer } from "../../generated/schema";
import {
  canonicalHex,
  deploymentContext,
  eventId,
  getOrCreateLaunchpad,
  requireLaunch,
} from "./shared";

export function handleCreatorTransferred(event: CreatorTransferredEvent): void {
  const context = deploymentContext();
  const launchpad = getOrCreateLaunchpad(context, event.address);
  const launch = requireLaunch(context, event.params.token);
  assert(
    launch.launchpad == launchpad.id &&
      launch.creator == canonicalHex(event.params.previousCreator),
    "Creator transfer does not reconcile for " + launch.id
  );

  const id = eventId(context.chainId, event);
  assert(CreatorTransfer.load(id) == null, "Duplicate creator transfer " + id);
  const transfer = new CreatorTransfer(id);
  transfer.chainId = context.chainId;
  transfer.launch = launch.id;
  transfer.previousCreator = canonicalHex(event.params.previousCreator);
  transfer.newCreator = canonicalHex(event.params.newCreator);
  transfer.transactionHash = canonicalHex(event.transaction.hash);
  transfer.logIndex = event.logIndex;
  transfer.blockNumber = event.block.number;
  transfer.blockHash = canonicalHex(event.block.hash);
  transfer.timestamp = event.block.timestamp;
  transfer.save();

  launch.creator = canonicalHex(event.params.newCreator);
  launch.save();
}

export function handleSushiFeeBpsUpdated(event: SushiFeeBpsUpdatedEvent): void {
  const context = deploymentContext();
  const launchpad = getOrCreateLaunchpad(context, event.address);
  const launch = requireLaunch(context, event.params.token);
  assert(
    launch.launchpad == launchpad.id &&
      launch.sushiFeeBps == event.params.previousSushiFeeBps,
    "Sushi fee update does not reconcile for " + launch.id
  );

  launch.sushiFeeBps = event.params.newSushiFeeBps;
  launch.save();
}
