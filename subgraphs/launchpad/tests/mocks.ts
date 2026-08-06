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
  DefaultSushiFeeBpsUpdated,
  FeesDistributed,
  LaunchFeesWithdrawn,
  LaunchFeeUpdated,
  PositionCreated,
  ProtocolRecipientUpdated,
  ProtocolReserveBpsUpdated,
  ProtocolReserveWithdrawn,
  SushiFeeBpsUpdated,
  TokenLaunched,
} from "../generated/SushiLaunchpad/SushiLaunchpad";

export const CHAIN_ID = BigInt.fromI32(4663);
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
  mockV3Pool(POOL, TOKEN, QUOTE_TOKEN);
}

export function mockV3Pool(
  pool: Address,
  token0: Address,
  token1: Address
): void {
  createMockedFunction(pool, "token0", "token0():(address)").returns([
    ethereum.Value.fromAddress(token0),
  ]);
  createMockedFunction(pool, "token1", "token1():(address)").returns([
    ethereum.Value.fromAddress(token1),
  ]);
  createMockedFunction(pool, "fee", "fee():(uint24)").returns([
    ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(10_000)),
  ]);
  createMockedFunction(pool, "tickSpacing", "tickSpacing():(int24)").returns([
    ethereum.Value.fromI32(200),
  ]);
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
    new ethereum.EventParam("tickLower", ethereum.Value.fromI32(-400))
  );
  event.parameters.push(
    new ethereum.EventParam("tickUpper", ethereum.Value.fromI32(-200))
  );
  event.parameters.push(
    new ethereum.EventParam(
      "tokenDesired",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1_000))
    )
  );
  event.parameters.push(
    new ethereum.EventParam(
      "tokenUsed",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(999))
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

export function createTokenLaunched(
  positionCount: i32,
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
    new ethereum.EventParam("name", ethereum.Value.fromString("Sushi Test"))
  );
  event.parameters.push(
    new ethereum.EventParam("symbol", ethereum.Value.fromString("SUSHIT"))
  );
  event.parameters.push(
    new ethereum.EventParam("decimals", ethereum.Value.fromI32(18))
  );
  event.parameters.push(
    new ethereum.EventParam(
      "totalSupply",
      ethereum.Value.fromUnsignedBigInt(
        BigInt.fromString("1000000000000000000")
      )
    )
  );
  event.parameters.push(
    new ethereum.EventParam("reserveBps", ethereum.Value.fromI32(reserveBps))
  );
  event.parameters.push(
    new ethereum.EventParam(
      "reserveAmount",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromString("30000000000000000"))
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
  event.parameters.push(
    new ethereum.EventParam(
      "positionCount",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(positionCount))
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
      ethereum.Value.fromUnsignedBigInt(BigInt.fromString("30000000000000000"))
    )
  );
  return event;
}
