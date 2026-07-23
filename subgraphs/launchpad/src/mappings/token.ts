import { BigInt } from "@graphprotocol/graph-ts";
import {
  FeesDistributed as FeesDistributedEvent,
  ProtocolReserveWithdrawn as ProtocolReserveWithdrawnEvent,
  SushiFeeBpsUpdated as SushiFeeBpsUpdatedEvent,
  TokenLaunched as TokenLaunchedEvent,
} from "../../generated/SushiLaunchpad/SushiLaunchpad";
import {
  Creator,
  FeeDistribution,
  ReserveWithdrawal,
  Token,
} from "../../generated/schema";
import {
  addressId,
  creatorId,
  deploymentContext,
  eventId,
  getOrCreateLaunchpad,
  requirePool,
  requireToken,
} from "./helpers";

const BPS_DENOMINATOR = 10_000;

export function handleTokenLaunched(event: TokenLaunchedEvent): void {
  const context = deploymentContext();
  const launchpad = getOrCreateLaunchpad(context, event.address);
  const idForToken = addressId(context.chainId, event.params.token);
  assert(
    Token.load(idForToken) == null,
    "Duplicate token launch " + idForToken
  );

  const pool = requirePool(context, event.params.pool);
  assert(
    pool.launchpad == launchpad.id &&
      ((pool.token0.equals(event.params.token) &&
        pool.token1.equals(event.params.quoteToken)) ||
        (pool.token1.equals(event.params.token) &&
          pool.token0.equals(event.params.quoteToken))) &&
      event.params.positionCount.equals(BigInt.fromI32(pool.positionCount)),
    "Token launch does not reconcile with pool " + pool.id
  );

  const idForCreator = creatorId(launchpad, event.params.creator);
  let creator = Creator.load(idForCreator);
  if (creator == null) {
    creator = new Creator(idForCreator);
    creator.chainId = context.chainId;
    creator.launchpad = launchpad.id;
    creator.address = event.params.creator;
    creator.tokenCount = 0;
    launchpad.creatorCount += 1;
  }
  creator.tokenCount += 1;
  creator.save();

  const zero = BigInt.zero();
  const token = new Token(idForToken);
  token.chainId = context.chainId;
  token.launchpad = launchpad.id;
  token.address = event.params.token;
  token.creator = creator.id;
  token.pool = pool.id;
  token.quoteToken = event.params.quoteToken;
  token.name = event.params.name;
  token.symbol = event.params.symbol;
  token.decimals = event.params.decimals;
  token.totalSupply = event.params.totalSupply;
  token.sushiFeeBps = event.params.initialSushiFeeBps;
  token.reserveBps = event.params.reserveBps;
  token.reserveAmount = event.params.reserveAmount;
  token.reserveUnlockAt = event.params.reserveUnlockAt;
  token.reserveWithdrawn = false;
  token.totalAmount0Collected = zero;
  token.totalAmount1Collected = zero;
  token.totalAmount0ToSushi = zero;
  token.totalAmount1ToSushi = zero;
  token.totalAmount0ToCreator = zero;
  token.totalAmount1ToCreator = zero;
  token.creationTransactionHash = event.transaction.hash;
  token.creationLogIndex = event.logIndex;
  token.creationBlockNumber = event.block.number;
  token.creationBlockHash = event.block.hash;
  token.createdAt = event.block.timestamp;
  token.save();

  launchpad.tokenCount += 1;
  launchpad.save();
}

export function handleSushiFeeBpsUpdated(event: SushiFeeBpsUpdatedEvent): void {
  const context = deploymentContext();
  const launchpad = getOrCreateLaunchpad(context, event.address);
  const token = requireToken(context, event.params.token);
  assert(
    token.launchpad == launchpad.id &&
      token.sushiFeeBps == event.params.previousSushiFeeBps &&
      event.params.newSushiFeeBps <= BPS_DENOMINATOR,
    "Sushi fee update does not reconcile for " + token.id
  );

  token.sushiFeeBps = event.params.newSushiFeeBps;
  token.save();
}

export function handleFeesDistributed(event: FeesDistributedEvent): void {
  const context = deploymentContext();
  const launchpad = getOrCreateLaunchpad(context, event.address);
  const token = requireToken(context, event.params.token);
  const pool = requirePool(context, event.params.pool);
  const creator = Creator.load(token.creator);
  assert(creator != null, "Token references unknown creator " + token.creator);
  const tokenCreator = changetype<Creator>(creator);
  assert(
    token.launchpad == launchpad.id &&
      token.pool == pool.id &&
      tokenCreator.address.equals(event.params.creator) &&
      token.sushiFeeBps == event.params.sushiFeeBps &&
      event.params.quoteCollected.equals(
        event.params.quoteToSushi.plus(event.params.quoteToCreator)
      ) &&
      event.params.tokenCollected.equals(
        event.params.tokenToSushi.plus(event.params.tokenToCreator)
      ),
    "Fee distribution does not reconcile for " + token.id
  );

  const id = eventId(context.chainId, event);
  assert(FeeDistribution.load(id) == null, "Duplicate fee distribution " + id);
  const tokenIs0 = pool.token0.equals(event.params.token);
  const distribution = new FeeDistribution(id);
  distribution.chainId = context.chainId;
  distribution.token = token.id;
  distribution.pool = pool.id;
  distribution.caller = event.params.caller;
  distribution.sushiRecipient = event.params.protocolRecipient;
  distribution.creatorRecipient = event.params.creator;
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
  distribution.transactionHash = event.transaction.hash;
  distribution.logIndex = event.logIndex;
  distribution.blockNumber = event.block.number;
  distribution.blockHash = event.block.hash;
  distribution.timestamp = event.block.timestamp;
  distribution.save();

  token.totalAmount0Collected = token.totalAmount0Collected.plus(
    distribution.amount0Collected
  );
  token.totalAmount1Collected = token.totalAmount1Collected.plus(
    distribution.amount1Collected
  );
  token.totalAmount0ToSushi = token.totalAmount0ToSushi.plus(
    distribution.amount0ToSushi
  );
  token.totalAmount1ToSushi = token.totalAmount1ToSushi.plus(
    distribution.amount1ToSushi
  );
  token.totalAmount0ToCreator = token.totalAmount0ToCreator.plus(
    distribution.amount0ToCreator
  );
  token.totalAmount1ToCreator = token.totalAmount1ToCreator.plus(
    distribution.amount1ToCreator
  );
  token.save();
}

export function handleProtocolReserveWithdrawn(
  event: ProtocolReserveWithdrawnEvent
): void {
  const context = deploymentContext();
  const launchpad = getOrCreateLaunchpad(context, event.address);
  const token = requireToken(context, event.params.token);
  assert(
    token.launchpad == launchpad.id &&
      !token.reserveWithdrawn &&
      event.params.amount.equals(token.reserveAmount),
    "Reserve withdrawal does not reconcile for " + token.id
  );

  const id = eventId(context.chainId, event);
  assert(
    ReserveWithdrawal.load(id) == null,
    "Duplicate reserve withdrawal " + id
  );
  const withdrawal = new ReserveWithdrawal(id);
  withdrawal.chainId = context.chainId;
  withdrawal.token = token.id;
  withdrawal.recipient = event.params.recipient;
  withdrawal.amount = event.params.amount;
  withdrawal.transactionHash = event.transaction.hash;
  withdrawal.logIndex = event.logIndex;
  withdrawal.blockNumber = event.block.number;
  withdrawal.blockHash = event.block.hash;
  withdrawal.timestamp = event.block.timestamp;
  withdrawal.save();

  token.reserveWithdrawn = true;
  token.reserveWithdrawal = withdrawal.id;
  token.save();
}
