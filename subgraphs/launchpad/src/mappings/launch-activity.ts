import {
  FeesDistributed as FeesDistributedEvent,
  InitialBuyExecuted as InitialBuyExecutedEvent,
  ProtocolReserveWithdrawn as ProtocolReserveWithdrawnEvent,
} from "../../generated/SushiLaunchpad/SushiLaunchpad";
import {
  FeeDistribution,
  InitialBuy,
  ReserveWithdrawal,
} from "../../generated/schema";
import {
  canonicalHex,
  deploymentContext,
  eventId,
  getOrCreateLaunchpad,
  requireLaunch,
} from "./shared";

export function handleInitialBuyExecuted(event: InitialBuyExecutedEvent): void {
  const context = deploymentContext();
  const launchpad = getOrCreateLaunchpad(context, event.address);
  const launch = requireLaunch(context, event.params.token);
  assert(
    launch.launchpad == launchpad.id &&
      launch.pool == canonicalHex(event.params.pool) &&
      launch.creator == canonicalHex(event.params.creator) &&
      launch.quoteToken == canonicalHex(event.params.quoteToken) &&
      launch.initialBuy == null,
    "Initial buy does not reconcile for " + launch.id
  );

  const id = eventId(context.chainId, event);
  assert(InitialBuy.load(id) == null, "Duplicate initial buy " + id);
  const initialBuy = new InitialBuy(id);
  initialBuy.chainId = context.chainId;
  initialBuy.launch = launch.id;
  initialBuy.creator = canonicalHex(event.params.creator);
  initialBuy.recipient = canonicalHex(event.params.recipient);
  initialBuy.quoteToken = canonicalHex(event.params.quoteToken);
  initialBuy.pool = canonicalHex(event.params.pool);
  initialBuy.amountIn = event.params.amountIn;
  initialBuy.amountOut = event.params.amountOut;
  initialBuy.transactionHash = canonicalHex(event.transaction.hash);
  initialBuy.logIndex = event.logIndex;
  initialBuy.blockNumber = event.block.number;
  initialBuy.blockHash = canonicalHex(event.block.hash);
  initialBuy.timestamp = event.block.timestamp;
  initialBuy.save();

  launch.initialBuy = initialBuy.id;
  launch.save();
}

export function handleFeesDistributed(event: FeesDistributedEvent): void {
  const context = deploymentContext();
  const launchpad = getOrCreateLaunchpad(context, event.address);
  const launch = requireLaunch(context, event.params.token);
  assert(
    launch.launchpad == launchpad.id &&
      launch.pool == canonicalHex(event.params.pool) &&
      launch.creator == canonicalHex(event.params.creator) &&
      launch.sushiFeeBps == event.params.sushiFeeBps &&
      event.params.quoteCollected.equals(
        event.params.quoteToSushi.plus(event.params.quoteToCreator)
      ) &&
      event.params.tokenCollected.equals(
        event.params.tokenToSushi.plus(event.params.tokenToCreator)
      ),
    "Fee distribution does not reconcile for " + launch.id
  );

  const id = eventId(context.chainId, event);
  assert(FeeDistribution.load(id) == null, "Duplicate fee distribution " + id);
  const tokenIs0 = launch.launchTokenIsToken0;
  const distribution = new FeeDistribution(id);
  distribution.chainId = context.chainId;
  distribution.launch = launch.id;
  distribution.pool = canonicalHex(event.params.pool);
  distribution.caller = canonicalHex(event.params.caller);
  distribution.sushiRecipient = canonicalHex(event.params.protocolRecipient);
  distribution.creatorRecipient = canonicalHex(event.params.creator);
  distribution.sushiFeeBps = event.params.sushiFeeBps;
  distribution.amount0Collected = tokenIs0
    ? event.params.tokenCollected
    : event.params.quoteCollected;
  distribution.amount1Collected = tokenIs0
    ? event.params.quoteCollected
    : event.params.tokenCollected;
  distribution.amount0ToSushi = tokenIs0
    ? event.params.tokenToSushi
    : event.params.quoteToSushi;
  distribution.amount1ToSushi = tokenIs0
    ? event.params.quoteToSushi
    : event.params.tokenToSushi;
  distribution.amount0ToCreator = tokenIs0
    ? event.params.tokenToCreator
    : event.params.quoteToCreator;
  distribution.amount1ToCreator = tokenIs0
    ? event.params.quoteToCreator
    : event.params.tokenToCreator;
  distribution.transactionHash = canonicalHex(event.transaction.hash);
  distribution.logIndex = event.logIndex;
  distribution.blockNumber = event.block.number;
  distribution.blockHash = canonicalHex(event.block.hash);
  distribution.timestamp = event.block.timestamp;
  distribution.save();
}

export function handleProtocolReserveWithdrawn(
  event: ProtocolReserveWithdrawnEvent
): void {
  const context = deploymentContext();
  const launchpad = getOrCreateLaunchpad(context, event.address);
  const launch = requireLaunch(context, event.params.token);
  assert(
    launch.launchpad == launchpad.id &&
      !launch.reserveWithdrawn &&
      event.params.amount.equals(launch.reserveAmount),
    "Reserve withdrawal does not reconcile for " + launch.id
  );

  const id = eventId(context.chainId, event);
  assert(
    ReserveWithdrawal.load(id) == null,
    "Duplicate reserve withdrawal " + id
  );
  const withdrawal = new ReserveWithdrawal(id);
  withdrawal.chainId = context.chainId;
  withdrawal.launch = launch.id;
  withdrawal.recipient = canonicalHex(event.params.recipient);
  withdrawal.amount = event.params.amount;
  withdrawal.transactionHash = canonicalHex(event.transaction.hash);
  withdrawal.logIndex = event.logIndex;
  withdrawal.blockNumber = event.block.number;
  withdrawal.blockHash = canonicalHex(event.block.hash);
  withdrawal.timestamp = event.block.timestamp;
  withdrawal.save();

  launch.reserveWithdrawn = true;
  launch.reserveWithdrawal = withdrawal.id;
  launch.save();
}
