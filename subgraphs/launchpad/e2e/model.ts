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

export interface PoolConfiguration {
  address: string;
  token0: string;
  token1: string;
  fee: number;
  tickSpacing: number;
}

export interface ExpectedModelInput {
  chainId: bigint;
  launchpadAddress: string;
  quoteToken: string;
  positionManager: string;
  protocolRecipient: string;
  launchFee: bigint;
  defaultSushiFeeBps: number;
  protocolReserveBps: number;
  events: IndexedEvent[];
  pools: Map<string, PoolConfiguration>;
}

type Entity = Record<string, unknown> & { id: string };

export interface EntitySnapshot {
  launchpads: Entity[];
  creators: Entity[];
  tokens: Entity[];
  pools: Entity[];
  launchPositions: Entity[];
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

function positionId(
  chainId: bigint,
  positionManager: string,
  onchainPositionId: unknown
): string {
  return `${chainId}:${positionManager.toLowerCase()}:${decimal(
    onchainPositionId
  )}`;
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

function add(value: unknown, amount: unknown): string {
  return (BigInt(String(value)) + BigInt(amount as bigint)).toString();
}

export function buildExpectedSnapshot(
  input: ExpectedModelInput
): EntitySnapshot {
  const launchpadId = addressId(input.chainId, input.launchpadAddress);
  const creators = new Map<string, Entity>();
  const tokens = new Map<string, Entity>();
  const pools = new Map<string, Entity>();
  const launchPositions = new Map<string, Entity>();
  const feeDistributions = new Map<string, Entity>();
  const reserveWithdrawals = new Map<string, Entity>();
  const launchFeeWithdrawals = new Map<string, Entity>();

  const launchpad: Entity = {
    id: launchpadId,
    chainId: input.chainId.toString(),
    address: input.launchpadAddress.toLowerCase(),
    quoteToken: input.quoteToken.toLowerCase(),
    positionManager: input.positionManager.toLowerCase(),
    protocolRecipient: input.protocolRecipient.toLowerCase(),
    launchFee: input.launchFee.toString(),
    defaultSushiFeeBps: input.defaultSushiFeeBps,
    protocolReserveBps: input.protocolReserveBps,
    tokenCount: 0,
    creatorCount: 0,
    positionCount: 0,
    tokens: [],
    pools: [],
    creators: [],
    launchFeeWithdrawals: [],
  };

  const orderedEvents = [...input.events].sort(
    (left, right) =>
      left.blockNumber - right.blockNumber || left.logIndex - right.logIndex
  );

  for (const event of orderedEvents) {
    const args = event.args;

    if (event.name === "PositionCreated") {
      const poolAddress = lower(args.pool);
      const poolConfiguration = input.pools.get(poolAddress);
      assert(
        poolConfiguration,
        `Missing pool configuration for ${poolAddress}`
      );
      const idForPool = addressId(input.chainId, poolAddress);
      let pool = pools.get(idForPool);
      if (!pool) {
        pool = {
          id: idForPool,
          chainId: input.chainId.toString(),
          address: poolAddress,
          launchpad: relation(launchpadId),
          token0: poolConfiguration.token0.toLowerCase(),
          token1: poolConfiguration.token1.toLowerCase(),
          fee: poolConfiguration.fee,
          tickSpacing: poolConfiguration.tickSpacing,
          positionManager: input.positionManager.toLowerCase(),
          positionCount: 0,
          creationTransactionHash: event.transactionHash.toLowerCase(),
          creationBlockNumber: event.blockNumber.toString(),
          creationBlockHash: event.blockHash.toLowerCase(),
          createdAt: event.timestamp.toString(),
          positions: [],
        };
        pools.set(idForPool, pool);
      }

      const tokenIs0 =
        poolConfiguration.token0.toLowerCase() === lower(args.token);
      const idForPosition = positionId(
        input.chainId,
        input.positionManager,
        args.positionId
      );
      const index = pool.positionCount as number;
      const zero = "0";
      const desired = decimal(args.tokenDesired);
      const used = decimal(args.tokenUsed);
      const position: Entity = {
        id: idForPosition,
        chainId: input.chainId.toString(),
        positionManager: input.positionManager.toLowerCase(),
        positionId: decimal(args.positionId),
        index,
        pool: relation(idForPool),
        tickLower: integer(args.tickLower),
        tickUpper: integer(args.tickUpper),
        liquidity: decimal(args.liquidity),
        amount0Desired: tokenIs0 ? desired : zero,
        amount1Desired: tokenIs0 ? zero : desired,
        amount0: tokenIs0 ? used : zero,
        amount1: tokenIs0 ? zero : used,
        creationTransactionHash: event.transactionHash.toLowerCase(),
        creationLogIndex: event.logIndex.toString(),
        creationBlockNumber: event.blockNumber.toString(),
        creationBlockHash: event.blockHash.toLowerCase(),
        createdAt: event.timestamp.toString(),
      };
      launchPositions.set(idForPosition, position);
      (pool.positions as Array<{ id: string }>).push(relation(idForPosition));
      pool.positionCount = index + 1;
      launchpad.positionCount = (launchpad.positionCount as number) + 1;
      continue;
    }

    if (event.name === "TokenLaunched") {
      const idForToken = addressId(input.chainId, args.token);
      const idForCreator = `${launchpadId}:${lower(args.creator)}`;
      const idForPool = addressId(input.chainId, args.pool);
      let creator = creators.get(idForCreator);
      if (!creator) {
        creator = {
          id: idForCreator,
          chainId: input.chainId.toString(),
          address: lower(args.creator),
          launchpad: relation(launchpadId),
          tokenCount: 0,
          tokens: [],
        };
        creators.set(idForCreator, creator);
        launchpad.creatorCount = (launchpad.creatorCount as number) + 1;
      }
      creator.tokenCount = (creator.tokenCount as number) + 1;
      (creator.tokens as Array<{ id: string }>).push(relation(idForToken));

      const token: Entity = {
        id: idForToken,
        chainId: input.chainId.toString(),
        address: lower(args.token),
        launchpad: relation(launchpadId),
        creator: relation(idForCreator),
        pool: relation(idForPool),
        name: String(args.name),
        symbol: String(args.symbol),
        decimals: integer(args.decimals),
        totalSupply: decimal(args.totalSupply),
        sushiFeeBps: integer(args.initialSushiFeeBps),
        reserveBps: integer(args.reserveBps),
        reserveAmount: decimal(args.reserveAmount),
        reserveUnlockAt: decimal(args.reserveUnlockAt),
        reserveWithdrawn: false,
        reserveWithdrawal: null,
        totalAmount0Collected: "0",
        totalAmount1Collected: "0",
        totalAmount0ToSushi: "0",
        totalAmount1ToSushi: "0",
        totalAmount0ToCreator: "0",
        totalAmount1ToCreator: "0",
        feeDistributions: [],
        creationTransactionHash: event.transactionHash.toLowerCase(),
        creationLogIndex: event.logIndex.toString(),
        creationBlockNumber: event.blockNumber.toString(),
        creationBlockHash: event.blockHash.toLowerCase(),
        createdAt: event.timestamp.toString(),
      };
      tokens.set(idForToken, token);
      launchpad.tokenCount = (launchpad.tokenCount as number) + 1;
      continue;
    }

    if (event.name === "SushiFeeBpsUpdated") {
      const token = tokens.get(addressId(input.chainId, args.token));
      assert(
        token,
        `Unknown token in SushiFeeBpsUpdated: ${lower(args.token)}`
      );
      token.sushiFeeBps = integer(args.newSushiFeeBps);
      continue;
    }

    if (event.name === "FeesDistributed") {
      const idForToken = addressId(input.chainId, args.token);
      const idForPool = addressId(input.chainId, args.pool);
      const token = tokens.get(idForToken);
      const pool = pools.get(idForPool);
      assert(token && pool, `Unknown fee distribution target ${idForToken}`);
      const id = eventId(input.chainId, event);
      const tokenIs0 = lower(pool.token0) === lower(args.token);
      const amount0Collected = tokenIs0
        ? decimal(args.tokenCollected)
        : decimal(args.wethCollected);
      const amount1Collected = tokenIs0
        ? decimal(args.wethCollected)
        : decimal(args.tokenCollected);
      const amount0ToSushi = tokenIs0
        ? decimal(args.tokenToSushi)
        : decimal(args.wethToSushi);
      const amount1ToSushi = tokenIs0
        ? decimal(args.wethToSushi)
        : decimal(args.tokenToSushi);
      const amount0ToCreator = tokenIs0
        ? decimal(args.tokenToCreator)
        : decimal(args.wethToCreator);
      const amount1ToCreator = tokenIs0
        ? decimal(args.wethToCreator)
        : decimal(args.tokenToCreator);
      const distribution: Entity = {
        id,
        chainId: input.chainId.toString(),
        token: relation(idForToken),
        pool: relation(idForPool),
        caller: lower(args.caller),
        sushiRecipient: lower(args.protocolRecipient),
        creatorRecipient: lower(args.creator),
        sushiFeeBps: integer(args.sushiFeeBps),
        amount0Collected,
        amount1Collected,
        amount0ToSushi,
        amount1ToSushi,
        amount0ToCreator,
        amount1ToCreator,
        ...metadata(event),
      };
      feeDistributions.set(id, distribution);
      (token.feeDistributions as Array<{ id: string }>).push(relation(id));
      token.totalAmount0Collected = add(
        token.totalAmount0Collected,
        amount0Collected
      );
      token.totalAmount1Collected = add(
        token.totalAmount1Collected,
        amount1Collected
      );
      token.totalAmount0ToSushi = add(
        token.totalAmount0ToSushi,
        amount0ToSushi
      );
      token.totalAmount1ToSushi = add(
        token.totalAmount1ToSushi,
        amount1ToSushi
      );
      token.totalAmount0ToCreator = add(
        token.totalAmount0ToCreator,
        amount0ToCreator
      );
      token.totalAmount1ToCreator = add(
        token.totalAmount1ToCreator,
        amount1ToCreator
      );
      continue;
    }

    if (event.name === "ProtocolReserveWithdrawn") {
      const idForToken = addressId(input.chainId, args.token);
      const token = tokens.get(idForToken);
      assert(token, `Unknown reserve withdrawal target ${idForToken}`);
      const id = eventId(input.chainId, event);
      const withdrawal: Entity = {
        id,
        chainId: input.chainId.toString(),
        token: relation(idForToken),
        recipient: lower(args.recipient),
        amount: decimal(args.amount),
        ...metadata(event),
      };
      reserveWithdrawals.set(id, withdrawal);
      token.reserveWithdrawn = true;
      token.reserveWithdrawal = relation(id);
      continue;
    }

    if (event.name === "LaunchFeesWithdrawn") {
      const id = eventId(input.chainId, event);
      const withdrawal: Entity = {
        id,
        chainId: input.chainId.toString(),
        launchpad: relation(launchpadId),
        recipient: lower(args.recipient),
        amount: decimal(args.amount),
        ...metadata(event),
      };
      launchFeeWithdrawals.set(id, withdrawal);
    }
  }

  launchpad.tokens = values(tokens).map((entity) => relation(entity.id));
  launchpad.pools = values(pools).map((entity) => relation(entity.id));
  launchpad.creators = values(creators).map((entity) => relation(entity.id));
  launchpad.launchFeeWithdrawals = values(launchFeeWithdrawals).map((entity) =>
    relation(entity.id)
  );

  return normalizeSnapshot({
    launchpads: [launchpad],
    creators: values(creators),
    tokens: values(tokens),
    pools: values(pools),
    launchPositions: values(launchPositions),
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
