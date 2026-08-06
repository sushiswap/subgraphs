import assert from "node:assert/strict";

export interface IndexedEvent {
  name: string;
  args: Record<string, unknown>;
  transactionHash: string;
  logIndex: number;
  blockNumber: number;
  blockHash: string;
  timestamp: number;
}

export interface ExpectedModelInput {
  chainId: bigint;
  launchpadAddress: string;
  positionManager: string;
  protocolRecipient: string;
  launchFee: bigint;
  initialFdvUsd: bigint;
  defaultSushiFeeBps: number;
  protocolReserveBps: number;
  launchpadObservation: LaunchObservation | null;
  events: IndexedEvent[];
}

export interface LaunchObservation {
  decimals: number;
  totalSupply: bigint;
  poolFee: number;
  poolTickSpacing: number;
}

type Entity = Record<string, unknown> & { id: string };

export interface EntitySnapshot {
  launchpads: Entity[];
  launches: Entity[];
  pendingLaunches: Entity[];
  quoteTokenPriceFeeds: Entity[];
  creatorTransfers: Entity[];
  initialBuys: Entity[];
  feeDistributions: Entity[];
  reserveWithdrawals: Entity[];
  launchFeeWithdrawals: Entity[];
}

const lower = (value: unknown): string => String(value).toLowerCase();
const decimal = (value: unknown): string => BigInt(value as bigint).toString();
const integer = (value: unknown): number => Number(value);
const relation = (id: string): { id: string } => ({ id });

function addressId(chainId: bigint, address: unknown): string {
  return `${chainId}:${lower(address)}`;
}

function eventId(chainId: bigint, event: IndexedEvent): string {
  return `${chainId}:${event.transactionHash.toLowerCase()}:${event.logIndex}`;
}

function metadata(event: IndexedEvent): Record<string, unknown> {
  return {
    transactionHash: event.transactionHash.toLowerCase(),
    logIndex: event.logIndex.toString(),
    blockNumber: event.blockNumber.toString(),
    blockHash: event.blockHash.toLowerCase(),
    timestamp: event.timestamp.toString(),
  };
}

function values<T>(entities: Map<string, T>): T[] {
  return [...entities.values()];
}

export function buildExpectedSnapshot(
  input: ExpectedModelInput
): EntitySnapshot {
  const launchpadId = addressId(input.chainId, input.launchpadAddress);
  const launches = new Map<string, Entity>();
  const pendingLaunches = new Map<string, Entity>();
  const quoteTokenPriceFeeds = new Map<string, Entity>();
  const creatorTransfers = new Map<string, Entity>();
  const initialBuys = new Map<string, Entity>();
  const feeDistributions = new Map<string, Entity>();
  const reserveWithdrawals = new Map<string, Entity>();
  const launchFeeWithdrawals = new Map<string, Entity>();

  const launchpad: Entity = {
    id: launchpadId,
    chainId: input.chainId.toString(),
    address: input.launchpadAddress.toLowerCase(),
    positionManager: input.positionManager.toLowerCase(),
    protocolRecipient: input.protocolRecipient.toLowerCase(),
    launchFee: input.launchFee.toString(),
    initialFdvUsd: input.initialFdvUsd.toString(),
    defaultSushiFeeBps: input.defaultSushiFeeBps,
    protocolReserveBps: input.protocolReserveBps,
    launchTokenDecimals: null,
    launchTokenTotalSupply: null,
    launchPoolFee: null,
    launchPoolTickSpacing: null,
    launches: [],
    quoteTokenPriceFeeds: [],
    launchFeeWithdrawals: [],
  };

  const orderedEvents = [...input.events].sort(
    (left, right) =>
      left.blockNumber - right.blockNumber || left.logIndex - right.logIndex
  );

  for (const event of orderedEvents) {
    const args = event.args;

    if (event.name === "TokenLaunched") {
      const id = addressId(input.chainId, args.token);
      const token = lower(args.token);
      const quoteToken = lower(args.quoteToken);
      if (launchpad.launchTokenDecimals === null) {
        const observation = input.launchpadObservation;
        assert(
          observation,
          `Missing observed launchpad values for ${launchpadId}`
        );
        launchpad.launchTokenDecimals = observation.decimals;
        launchpad.launchTokenTotalSupply = observation.totalSupply.toString();
        launchpad.launchPoolFee = observation.poolFee;
        launchpad.launchPoolTickSpacing = observation.poolTickSpacing;
      }
      assert(!pendingLaunches.has(id) && !launches.has(id));
      pendingLaunches.set(id, {
        id,
        chainId: input.chainId.toString(),
        launchpad: relation(launchpadId),
        token,
        creator: lower(args.creator),
        quoteToken,
        pool: lower(args.pool),
        launchTokenIsToken0: token < quoteToken,
        name: String(args.name),
        symbol: String(args.symbol),
        startTick: integer(args.startTick),
        sushiFeeBps: integer(args.initialSushiFeeBps),
        reserveBps: integer(args.reserveBps),
        reserveAmount: decimal(args.reserveAmount),
        reserveUnlockAt: decimal(args.reserveUnlockAt),
        creationTransactionHash: event.transactionHash.toLowerCase(),
        creationLogIndex: event.logIndex.toString(),
        creationBlockNumber: event.blockNumber.toString(),
        creationBlockHash: event.blockHash.toLowerCase(),
        createdAt: event.timestamp.toString(),
      });
      continue;
    }

    if (event.name === "PositionCreated") {
      const id = addressId(input.chainId, args.token);
      const pending = pendingLaunches.get(id);
      assert(pending, `Missing pending launch ${id}`);
      assert.equal(pending.pool, lower(args.pool));
      assert.equal(
        pending.creationTransactionHash,
        event.transactionHash.toLowerCase()
      );
      const launch: Entity = {
        id,
        chainId: input.chainId.toString(),
        launchpad: relation(launchpadId),
        token: pending.token,
        initialCreator: pending.creator,
        creator: pending.creator,
        quoteToken: pending.quoteToken,
        pool: pending.pool,
        launchTokenIsToken0: pending.launchTokenIsToken0,
        name: pending.name,
        symbol: pending.symbol,
        decimals: launchpad.launchTokenDecimals,
        totalSupply: launchpad.launchTokenTotalSupply,
        initialFdvUsd: launchpad.initialFdvUsd,
        startTick: pending.startTick,
        poolFee: launchpad.launchPoolFee,
        poolTickSpacing: launchpad.launchPoolTickSpacing,
        positionManager: input.positionManager.toLowerCase(),
        positionId: decimal(args.positionId),
        tickLower: integer(args.tickLower),
        tickUpper: integer(args.tickUpper),
        tokenDesired: decimal(args.tokenDesired),
        tokenUsed: decimal(args.tokenUsed),
        liquidity: decimal(args.liquidity),
        sushiFeeBps: pending.sushiFeeBps,
        reserveBps: pending.reserveBps,
        reserveAmount: pending.reserveAmount,
        reserveUnlockAt: pending.reserveUnlockAt,
        reserveWithdrawn: false,
        reserveWithdrawal: null,
        initialBuy: null,
        feeDistributions: [],
        creatorTransfers: [],
        creationTransactionHash: pending.creationTransactionHash,
        creationLogIndex: pending.creationLogIndex,
        positionCreationLogIndex: event.logIndex.toString(),
        creationBlockNumber: pending.creationBlockNumber,
        creationBlockHash: pending.creationBlockHash,
        createdAt: pending.createdAt,
      };
      pendingLaunches.delete(id);
      launches.set(id, launch);
      continue;
    }

    if (event.name === "InitialBuyExecuted") {
      const launch = launches.get(addressId(input.chainId, args.token));
      assert(launch, `Unknown initial buy launch ${lower(args.token)}`);
      const id = eventId(input.chainId, event);
      initialBuys.set(id, {
        id,
        chainId: input.chainId.toString(),
        launch: relation(launch.id),
        creator: lower(args.creator),
        recipient: lower(args.recipient),
        quoteToken: lower(args.quoteToken),
        pool: lower(args.pool),
        amountIn: decimal(args.amountIn),
        amountOut: decimal(args.amountOut),
        ...metadata(event),
      });
      launch.initialBuy = relation(id);
      continue;
    }

    if (event.name === "CreatorTransferred") {
      const launch = launches.get(addressId(input.chainId, args.token));
      assert(launch, `Unknown creator transfer launch ${lower(args.token)}`);
      assert.equal(launch.creator, lower(args.previousCreator));
      const id = eventId(input.chainId, event);
      creatorTransfers.set(id, {
        id,
        chainId: input.chainId.toString(),
        launch: relation(launch.id),
        previousCreator: lower(args.previousCreator),
        newCreator: lower(args.newCreator),
        ...metadata(event),
      });
      launch.creator = lower(args.newCreator);
      (launch.creatorTransfers as Array<{ id: string }>).push(relation(id));
      continue;
    }

    if (event.name === "SushiFeeBpsUpdated") {
      const launch = launches.get(addressId(input.chainId, args.token));
      assert(launch, `Unknown fee update launch ${lower(args.token)}`);
      launch.sushiFeeBps = integer(args.newSushiFeeBps);
      continue;
    }

    if (event.name === "FeesDistributed") {
      const launch = launches.get(addressId(input.chainId, args.token));
      assert(launch, `Unknown fee distribution launch ${lower(args.token)}`);
      const id = eventId(input.chainId, event);
      const tokenIs0 = Boolean(launch.launchTokenIsToken0);
      feeDistributions.set(id, {
        id,
        chainId: input.chainId.toString(),
        launch: relation(launch.id),
        pool: lower(args.pool),
        caller: lower(args.caller),
        sushiRecipient: lower(args.protocolRecipient),
        creatorRecipient: lower(args.creator),
        sushiFeeBps: integer(args.sushiFeeBps),
        amount0Collected: decimal(
          tokenIs0 ? args.tokenCollected : args.quoteCollected
        ),
        amount1Collected: decimal(
          tokenIs0 ? args.quoteCollected : args.tokenCollected
        ),
        amount0ToSushi: decimal(
          tokenIs0 ? args.tokenToSushi : args.quoteToSushi
        ),
        amount1ToSushi: decimal(
          tokenIs0 ? args.quoteToSushi : args.tokenToSushi
        ),
        amount0ToCreator: decimal(
          tokenIs0 ? args.tokenToCreator : args.quoteToCreator
        ),
        amount1ToCreator: decimal(
          tokenIs0 ? args.quoteToCreator : args.tokenToCreator
        ),
        ...metadata(event),
      });
      (launch.feeDistributions as Array<{ id: string }>).push(relation(id));
      continue;
    }

    if (event.name === "ProtocolReserveWithdrawn") {
      const launch = launches.get(addressId(input.chainId, args.token));
      assert(launch, `Unknown reserve withdrawal launch ${lower(args.token)}`);
      const id = eventId(input.chainId, event);
      reserveWithdrawals.set(id, {
        id,
        chainId: input.chainId.toString(),
        launch: relation(launch.id),
        recipient: lower(args.recipient),
        amount: decimal(args.amount),
        ...metadata(event),
      });
      launch.reserveWithdrawn = true;
      launch.reserveWithdrawal = relation(id);
      continue;
    }

    if (event.name === "DefaultSushiFeeBpsUpdated") {
      launchpad.defaultSushiFeeBps = integer(args.newBps);
      continue;
    }
    if (event.name === "ProtocolReserveBpsUpdated") {
      launchpad.protocolReserveBps = integer(args.newBps);
      continue;
    }
    if (event.name === "ProtocolRecipientUpdated") {
      launchpad.protocolRecipient = lower(args.newRecipient);
      continue;
    }
    if (event.name === "LaunchFeeUpdated") {
      launchpad.launchFee = decimal(args.newFee);
      continue;
    }

    if (event.name === "QuoteTokenPriceFeedUpdated") {
      const id = `${launchpadId}:${lower(args.quoteToken)}`;
      const current = quoteTokenPriceFeeds.get(id);
      if (current) {
        assert.equal(current.priceFeed, lower(args.previousPriceFeed));
      } else {
        assert.equal(
          lower(args.previousPriceFeed),
          "0x0000000000000000000000000000000000000000"
        );
      }
      if (
        lower(args.newPriceFeed) ===
        "0x0000000000000000000000000000000000000000"
      ) {
        quoteTokenPriceFeeds.delete(id);
        continue;
      }
      quoteTokenPriceFeeds.set(id, {
        id,
        chainId: input.chainId.toString(),
        launchpad: relation(launchpadId),
        quoteToken: lower(args.quoteToken),
        priceFeed: lower(args.newPriceFeed),
        updatedTransactionHash: event.transactionHash.toLowerCase(),
        updatedLogIndex: event.logIndex.toString(),
        updatedBlockNumber: event.blockNumber.toString(),
        updatedBlockHash: event.blockHash.toLowerCase(),
        updatedAt: event.timestamp.toString(),
      });
      continue;
    }

    if (event.name === "LaunchFeesWithdrawn") {
      const id = eventId(input.chainId, event);
      launchFeeWithdrawals.set(id, {
        id,
        chainId: input.chainId.toString(),
        launchpad: relation(launchpadId),
        recipient: lower(args.recipient),
        amount: decimal(args.amount),
        ...metadata(event),
      });
    }
  }

  launchpad.launches = values(launches).map((entity) => relation(entity.id));
  launchpad.quoteTokenPriceFeeds = values(quoteTokenPriceFeeds).map((entity) =>
    relation(entity.id)
  );
  launchpad.launchFeeWithdrawals = values(launchFeeWithdrawals).map((entity) =>
    relation(entity.id)
  );

  return normalizeSnapshot({
    launchpads: [launchpad],
    launches: values(launches),
    pendingLaunches: values(pendingLaunches),
    quoteTokenPriceFeeds: values(quoteTokenPriceFeeds),
    creatorTransfers: values(creatorTransfers),
    initialBuys: values(initialBuys),
    feeDistributions: values(feeDistributions),
    reserveWithdrawals: values(reserveWithdrawals),
    launchFeeWithdrawals: values(launchFeeWithdrawals),
  });
}

function normalizeValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    const normalized = value.map(normalizeValue);
    if (
      normalized.every(
        (entry) => entry && typeof entry === "object" && "id" in entry
      )
    ) {
      normalized.sort((left, right) =>
        String((left as { id: string }).id).localeCompare(
          String((right as { id: string }).id)
        )
      );
    }
    return normalized;
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
        key,
        normalizeValue(entry),
      ])
    );
  }
  return value;
}

export function normalizeSnapshot(snapshot: EntitySnapshot): EntitySnapshot {
  return normalizeValue(snapshot) as EntitySnapshot;
}
