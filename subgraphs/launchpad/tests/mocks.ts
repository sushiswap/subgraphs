import {
  Address,
  BigInt,
  DataSourceContext,
  ethereum,
} from "@graphprotocol/graph-ts";
import {
  createMockedFunction,
  dataSourceMock,
  newMockEvent,
} from "matchstick-as";
import {
  CreatorTransferred,
  DefaultSushiFeeBpsUpdated,
  FeesDistributed,
  InitialBuyExecuted,
  LaunchFeesWithdrawn,
  LaunchFeeUpdated,
  PositionCreated,
  ProtocolRecipientUpdated,
  ProtocolReserveBpsUpdated,
  ProtocolReserveWithdrawn,
  QuoteTokenPriceFeedUpdated,
  SushiFeeBpsUpdated,
  TokenLaunched,
} from "../generated/SushiLaunchpad/SushiLaunchpad";

export const CHAIN_ID = BigInt.fromI32(4663);
export const INITIAL_FDV_USD = BigInt.fromI32(12_345);
export const LAUNCH_TOKEN_DECIMALS = 6;
export const LAUNCH_TOKEN_TOTAL_SUPPLY = BigInt.fromString(
  "2000000000000000000000000000"
);
export const LAUNCH_POOL_FEE = 3_000;
export const LAUNCH_POOL_TICK_SPACING = 100;
export const LAUNCH_TOKEN_DESIRED = BigInt.fromString(
  "1970000000000000000000000000"
);
export const LAUNCH_TOKEN_USED = BigInt.fromString(
  "1969999999999999999999999999"
);
export const FACTORY = Address.fromString(
  "0x1000000000000000000000000000000000000001"
);
export const CREATOR = Address.fromString(
  "0x2000000000000000000000000000000000000002"
);
export const CREATOR_TWO = Address.fromString(
  "0xc00000000000000000000000000000000000000c"
);
export const CALLER = Address.fromString(
  "0x3000000000000000000000000000000000000003"
);
export const PROTOCOL_RECIPIENT = Address.fromString(
  "0x4000000000000000000000000000000000000004"
);
export const PROTOCOL_RECIPIENT_TWO = Address.fromString(
  "0xe00000000000000000000000000000000000000e"
);
export const TOKEN = Address.fromString(
  "0x5000000000000000000000000000000000000005"
);
export const TOKEN_TWO = Address.fromString(
  "0xa00000000000000000000000000000000000000a"
);
export const TOKEN_THREE = Address.fromString(
  "0xb00000000000000000000000000000000000000b"
);
export const POOL = Address.fromString(
  "0x6000000000000000000000000000000000000006"
);
export const OTHER_POOL = Address.fromString(
  "0x7000000000000000000000000000000000000007"
);
export const POOL_THREE = Address.fromString(
  "0xd00000000000000000000000000000000000000d"
);
export const QUOTE_TOKEN = Address.fromString(
  "0x8000000000000000000000000000000000000008"
);
export const QUOTE_TOKEN_TWO = Address.fromString(
  "0xf00000000000000000000000000000000000000f"
);
export const POSITION_MANAGER = Address.fromString(
  "0x9000000000000000000000000000000000000009"
);
export const PRICE_FEED = Address.fromString(
  "0x1100000000000000000000000000000000000011"
);
export const PRICE_FEED_TWO = Address.fromString(
  "0x1200000000000000000000000000000000000012"
);

function mockLaunchContracts(token: Address, pool: Address): void {
  createMockedFunction(token, "decimals", "decimals():(uint8)").returns([
    ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(LAUNCH_TOKEN_DECIMALS)),
  ]);
  createMockedFunction(token, "totalSupply", "totalSupply():(uint256)").returns(
    [ethereum.Value.fromUnsignedBigInt(LAUNCH_TOKEN_TOTAL_SUPPLY)]
  );
  createMockedFunction(pool, "fee", "fee():(uint24)").returns([
    ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(LAUNCH_POOL_FEE)),
  ]);
  createMockedFunction(pool, "tickSpacing", "tickSpacing():(int24)").returns([
    ethereum.Value.fromI32(LAUNCH_POOL_TICK_SPACING),
  ]);
}

export function mockDeploymentContext(): void {
  const context = new DataSourceContext();
  context.setBigInt("chainId", CHAIN_ID);
  dataSourceMock.setAddressAndContext(FACTORY.toHexString(), context);

  createMockedFunction(
    FACTORY,
    "positionManager",
    "positionManager():(address)"
  ).returns([ethereum.Value.fromAddress(POSITION_MANAGER)]);
  createMockedFunction(
    FACTORY,
    "INITIAL_FDV_USD",
    "INITIAL_FDV_USD():(uint256)"
  ).returns([ethereum.Value.fromUnsignedBigInt(INITIAL_FDV_USD)]);
  createMockedFunction(
    FACTORY,
    "defaultSushiFeeBps",
    "defaultSushiFeeBps():(uint16)"
  ).returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(7_000))]);
  createMockedFunction(
    FACTORY,
    "protocolReserveBps",
    "protocolReserveBps():(uint16)"
  ).returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(300))]);
  createMockedFunction(
    FACTORY,
    "protocolRecipient",
    "protocolRecipient():(address)"
  ).returns([ethereum.Value.fromAddress(PROTOCOL_RECIPIENT)]);
  createMockedFunction(FACTORY, "launchFee", "launchFee():(uint256)").returns([
    ethereum.Value.fromUnsignedBigInt(BigInt.fromString("500000000000000")),
  ]);

  mockLaunchContracts(TOKEN, POOL);
}

function configureEvent(event: ethereum.Event, logIndex: i32): void {
  event.address = FACTORY;
  event.logIndex = BigInt.fromI32(logIndex);
}

export function createPositionCreated(
  onchainPositionId: i32,
  logIndex: i32,
  pool: Address = POOL,
  token: Address = TOKEN
): PositionCreated {
  const event = changetype<PositionCreated>(newMockEvent());
  configureEvent(event, logIndex);
  const tokenIs0 =
    token.toHexString().toLowerCase() < QUOTE_TOKEN.toHexString().toLowerCase();
  event.parameters = new Array();
  event.parameters.push(
    new ethereum.EventParam("token", ethereum.Value.fromAddress(token))
  );
  event.parameters.push(
    new ethereum.EventParam("pool", ethereum.Value.fromAddress(pool))
  );
  event.parameters.push(
    new ethereum.EventParam(
      "positionId",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(onchainPositionId))
    )
  );
  event.parameters.push(
    new ethereum.EventParam(
      "tickLower",
      ethereum.Value.fromI32(tokenIs0 ? -12_400 : -887_200)
    )
  );
  event.parameters.push(
    new ethereum.EventParam(
      "tickUpper",
      ethereum.Value.fromI32(tokenIs0 ? 887_200 : 12_400)
    )
  );
  event.parameters.push(
    new ethereum.EventParam(
      "tokenDesired",
      ethereum.Value.fromUnsignedBigInt(LAUNCH_TOKEN_DESIRED)
    )
  );
  event.parameters.push(
    new ethereum.EventParam(
      "tokenUsed",
      ethereum.Value.fromUnsignedBigInt(LAUNCH_TOKEN_USED)
    )
  );
  event.parameters.push(
    new ethereum.EventParam(
      "liquidity",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(500))
    )
  );
  return event;
}

export function createPositionCreatedWithInvalidTicks(
  onchainPositionId: i32,
  logIndex: i32
): PositionCreated {
  const event = createPositionCreated(onchainPositionId, logIndex);
  event.parameters[3] = new ethereum.EventParam(
    "tickLower",
    ethereum.Value.fromI32(-400)
  );
  return event;
}

export function createTokenLaunched(
  logIndex: i32,
  token: Address = TOKEN,
  pool: Address = POOL,
  creator: Address = CREATOR,
  quoteToken: Address = QUOTE_TOKEN,
  initialSushiFeeBps: i32 = 7_000,
  reserveBps: i32 = 300
): TokenLaunched {
  const event = changetype<TokenLaunched>(newMockEvent());
  configureEvent(event, logIndex);
  event.parameters = new Array();
  event.parameters.push(
    new ethereum.EventParam("creator", ethereum.Value.fromAddress(creator))
  );
  event.parameters.push(
    new ethereum.EventParam("token", ethereum.Value.fromAddress(token))
  );
  event.parameters.push(
    new ethereum.EventParam("pool", ethereum.Value.fromAddress(pool))
  );
  event.parameters.push(
    new ethereum.EventParam(
      "quoteToken",
      ethereum.Value.fromAddress(quoteToken)
    )
  );
  event.parameters.push(
    new ethereum.EventParam("startTick", ethereum.Value.fromI32(-12_400))
  );
  event.parameters.push(
    new ethereum.EventParam("name", ethereum.Value.fromString("Sushi Test"))
  );
  event.parameters.push(
    new ethereum.EventParam("symbol", ethereum.Value.fromString("SUSHIT"))
  );
  event.parameters.push(
    new ethereum.EventParam("reserveBps", ethereum.Value.fromI32(reserveBps))
  );
  event.parameters.push(
    new ethereum.EventParam(
      "reserveAmount",
      ethereum.Value.fromUnsignedBigInt(
        BigInt.fromString("30000000000000000000000000")
      )
    )
  );
  event.parameters.push(
    new ethereum.EventParam(
      "reserveUnlockAt",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(31_536_001))
    )
  );
  event.parameters.push(
    new ethereum.EventParam(
      "initialSushiFeeBps",
      ethereum.Value.fromI32(initialSushiFeeBps)
    )
  );
  return event;
}

export function createInitialBuyExecuted(
  logIndex: i32,
  token: Address = TOKEN,
  pool: Address = POOL,
  creator: Address = CREATOR,
  quoteToken: Address = QUOTE_TOKEN,
  recipient: Address = CREATOR
): InitialBuyExecuted {
  const event = changetype<InitialBuyExecuted>(newMockEvent());
  configureEvent(event, logIndex);
  event.parameters = new Array();
  event.parameters.push(
    new ethereum.EventParam("creator", ethereum.Value.fromAddress(creator))
  );
  event.parameters.push(
    new ethereum.EventParam("token", ethereum.Value.fromAddress(token))
  );
  event.parameters.push(
    new ethereum.EventParam("pool", ethereum.Value.fromAddress(pool))
  );
  event.parameters.push(
    new ethereum.EventParam("recipient", ethereum.Value.fromAddress(recipient))
  );
  event.parameters.push(
    new ethereum.EventParam(
      "quoteToken",
      ethereum.Value.fromAddress(quoteToken)
    )
  );
  event.parameters.push(
    new ethereum.EventParam(
      "amountIn",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(100))
    )
  );
  event.parameters.push(
    new ethereum.EventParam(
      "amountOut",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(99))
    )
  );
  return event;
}

export function createCreatorTransferred(
  logIndex: i32,
  token: Address = TOKEN,
  previousCreator: Address = CREATOR,
  newCreator: Address = CREATOR_TWO
): CreatorTransferred {
  const event = changetype<CreatorTransferred>(newMockEvent());
  configureEvent(event, logIndex);
  event.parameters = new Array();
  event.parameters.push(
    new ethereum.EventParam("token", ethereum.Value.fromAddress(token))
  );
  event.parameters.push(
    new ethereum.EventParam(
      "previousCreator",
      ethereum.Value.fromAddress(previousCreator)
    )
  );
  event.parameters.push(
    new ethereum.EventParam(
      "newCreator",
      ethereum.Value.fromAddress(newCreator)
    )
  );
  return event;
}

export function createSushiFeeBpsUpdated(
  previousBps: i32,
  newBps: i32,
  logIndex: i32,
  token: Address = TOKEN
): SushiFeeBpsUpdated {
  const event = changetype<SushiFeeBpsUpdated>(newMockEvent());
  configureEvent(event, logIndex);
  event.parameters = new Array();
  event.parameters.push(
    new ethereum.EventParam("token", ethereum.Value.fromAddress(token))
  );
  event.parameters.push(
    new ethereum.EventParam(
      "previousSushiFeeBps",
      ethereum.Value.fromI32(previousBps)
    )
  );
  event.parameters.push(
    new ethereum.EventParam("newSushiFeeBps", ethereum.Value.fromI32(newBps))
  );
  return event;
}

export function createDefaultSushiFeeBpsUpdated(
  previousBps: i32,
  newBps: i32,
  logIndex: i32
): DefaultSushiFeeBpsUpdated {
  const event = changetype<DefaultSushiFeeBpsUpdated>(newMockEvent());
  configureEvent(event, logIndex);
  event.parameters = new Array();
  event.parameters.push(
    new ethereum.EventParam("previousBps", ethereum.Value.fromI32(previousBps))
  );
  event.parameters.push(
    new ethereum.EventParam("newBps", ethereum.Value.fromI32(newBps))
  );
  return event;
}

export function createProtocolReserveBpsUpdated(
  previousBps: i32,
  newBps: i32,
  logIndex: i32
): ProtocolReserveBpsUpdated {
  const event = changetype<ProtocolReserveBpsUpdated>(newMockEvent());
  configureEvent(event, logIndex);
  event.parameters = new Array();
  event.parameters.push(
    new ethereum.EventParam("previousBps", ethereum.Value.fromI32(previousBps))
  );
  event.parameters.push(
    new ethereum.EventParam("newBps", ethereum.Value.fromI32(newBps))
  );
  return event;
}

export function createProtocolRecipientUpdated(
  previousRecipient: Address,
  newRecipient: Address,
  logIndex: i32
): ProtocolRecipientUpdated {
  const event = changetype<ProtocolRecipientUpdated>(newMockEvent());
  configureEvent(event, logIndex);
  event.parameters = new Array();
  event.parameters.push(
    new ethereum.EventParam(
      "previousRecipient",
      ethereum.Value.fromAddress(previousRecipient)
    )
  );
  event.parameters.push(
    new ethereum.EventParam(
      "newRecipient",
      ethereum.Value.fromAddress(newRecipient)
    )
  );
  return event;
}

export function createLaunchFeeUpdated(
  previousFee: BigInt,
  newFee: BigInt,
  logIndex: i32
): LaunchFeeUpdated {
  const event = changetype<LaunchFeeUpdated>(newMockEvent());
  configureEvent(event, logIndex);
  event.parameters = new Array();
  event.parameters.push(
    new ethereum.EventParam(
      "previousFee",
      ethereum.Value.fromUnsignedBigInt(previousFee)
    )
  );
  event.parameters.push(
    new ethereum.EventParam("newFee", ethereum.Value.fromUnsignedBigInt(newFee))
  );
  return event;
}

export function createLaunchFeesWithdrawn(
  recipient: Address,
  amount: BigInt,
  logIndex: i32
): LaunchFeesWithdrawn {
  const event = changetype<LaunchFeesWithdrawn>(newMockEvent());
  configureEvent(event, logIndex);
  event.parameters = new Array();
  event.parameters.push(
    new ethereum.EventParam("recipient", ethereum.Value.fromAddress(recipient))
  );
  event.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  );
  return event;
}

export function createFeesDistributed(
  logIndex: i32,
  token: Address = TOKEN,
  pool: Address = POOL,
  creator: Address = CREATOR
): FeesDistributed {
  const event = changetype<FeesDistributed>(newMockEvent());
  configureEvent(event, logIndex);
  event.parameters = new Array();
  event.parameters.push(
    new ethereum.EventParam("caller", ethereum.Value.fromAddress(CALLER))
  );
  event.parameters.push(
    new ethereum.EventParam("token", ethereum.Value.fromAddress(token))
  );
  event.parameters.push(
    new ethereum.EventParam("pool", ethereum.Value.fromAddress(pool))
  );
  event.parameters.push(
    new ethereum.EventParam("creator", ethereum.Value.fromAddress(creator))
  );
  event.parameters.push(
    new ethereum.EventParam(
      "protocolRecipient",
      ethereum.Value.fromAddress(PROTOCOL_RECIPIENT)
    )
  );
  event.parameters.push(
    new ethereum.EventParam("sushiFeeBps", ethereum.Value.fromI32(6_500))
  );
  event.parameters.push(
    new ethereum.EventParam(
      "quoteCollected",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(100))
    )
  );
  event.parameters.push(
    new ethereum.EventParam(
      "tokenCollected",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(200))
    )
  );
  event.parameters.push(
    new ethereum.EventParam(
      "quoteToSushi",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(65))
    )
  );
  event.parameters.push(
    new ethereum.EventParam(
      "tokenToSushi",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(130))
    )
  );
  event.parameters.push(
    new ethereum.EventParam(
      "quoteToCreator",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(35))
    )
  );
  event.parameters.push(
    new ethereum.EventParam(
      "tokenToCreator",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(70))
    )
  );
  return event;
}

export function createProtocolReserveWithdrawn(
  logIndex: i32,
  token: Address = TOKEN
): ProtocolReserveWithdrawn {
  const event = changetype<ProtocolReserveWithdrawn>(newMockEvent());
  configureEvent(event, logIndex);
  event.parameters = new Array();
  event.parameters.push(
    new ethereum.EventParam("token", ethereum.Value.fromAddress(token))
  );
  event.parameters.push(
    new ethereum.EventParam(
      "recipient",
      ethereum.Value.fromAddress(PROTOCOL_RECIPIENT)
    )
  );
  event.parameters.push(
    new ethereum.EventParam(
      "amount",
      ethereum.Value.fromUnsignedBigInt(
        BigInt.fromString("30000000000000000000000000")
      )
    )
  );
  return event;
}

export function createQuoteTokenPriceFeedUpdated(
  previousPriceFeed: Address,
  newPriceFeed: Address,
  logIndex: i32,
  quoteToken: Address = QUOTE_TOKEN
): QuoteTokenPriceFeedUpdated {
  const event = changetype<QuoteTokenPriceFeedUpdated>(newMockEvent());
  configureEvent(event, logIndex);
  event.parameters = new Array();
  event.parameters.push(
    new ethereum.EventParam(
      "quoteToken",
      ethereum.Value.fromAddress(quoteToken)
    )
  );
  event.parameters.push(
    new ethereum.EventParam(
      "previousPriceFeed",
      ethereum.Value.fromAddress(previousPriceFeed)
    )
  );
  event.parameters.push(
    new ethereum.EventParam(
      "newPriceFeed",
      ethereum.Value.fromAddress(newPriceFeed)
    )
  );
  return event;
}
