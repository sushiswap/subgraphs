import {
  Address,
  BigInt,
  Bytes,
  dataSource,
  ethereum,
} from "@graphprotocol/graph-ts";
import { SushiLaunchpad as SushiLaunchpadContract } from "../../generated/SushiLaunchpad/SushiLaunchpad";
import { Launchpad, Pool, Token } from "../../generated/schema";

export class DeploymentContext {
  chainId: BigInt;

  constructor(chainId: BigInt) {
    this.chainId = chainId;
  }
}

export function deploymentContext(): DeploymentContext {
  const context = dataSource.context();
  assert(
    context.get("chainId") != null,
    "Launchpad data source context is incomplete"
  );

  return new DeploymentContext(context.getBigInt("chainId"));
}

export function addressId(chainId: BigInt, address: Bytes): string {
  return chainId.toString().concat(":").concat(address.toHexString());
}

export function creatorId(launchpad: Launchpad, address: Bytes): string {
  return launchpad.id.concat(":").concat(address.toHexString());
}

export function positionId(
  chainId: BigInt,
  positionManager: Bytes,
  onchainPositionId: BigInt
): string {
  return addressId(chainId, positionManager)
    .concat(":")
    .concat(onchainPositionId.toString());
}

export function eventId(chainId: BigInt, event: ethereum.Event): string {
  return chainId
    .toString()
    .concat(":")
    .concat(event.transaction.hash.toHexString())
    .concat(":")
    .concat(event.logIndex.toString());
}

export function getOrCreateLaunchpad(
  context: DeploymentContext,
  factory: Address
): Launchpad {
  const id = addressId(context.chainId, factory);
  let launchpad = Launchpad.load(id);
  if (launchpad == null) {
    // Contract calls establish the first block-visible state. Mutable values
    // are subsequently owned exclusively by their dedicated update handlers.
    const contract = SushiLaunchpadContract.bind(factory);
    launchpad = new Launchpad(id);
    launchpad.chainId = context.chainId;
    launchpad.address = factory;
    launchpad.positionManager = contract.positionManager();
    launchpad.protocolRecipient = contract.protocolRecipient();
    launchpad.launchFee = contract.launchFee();
    launchpad.defaultSushiFeeBps = contract.defaultSushiFeeBps();
    launchpad.protocolReserveBps = contract.protocolReserveBps();
    launchpad.tokenCount = 0;
    launchpad.creatorCount = 0;
    launchpad.positionCount = 0;
    launchpad.save();
  }
  return changetype<Launchpad>(launchpad);
}

export function requireToken(
  context: DeploymentContext,
  address: Bytes
): Token {
  const id = addressId(context.chainId, address);
  const token = Token.load(id);
  assert(token != null, "Launchpad event references unknown token " + id);
  return changetype<Token>(token);
}

export function requirePool(context: DeploymentContext, address: Bytes): Pool {
  const id = addressId(context.chainId, address);
  const pool = Pool.load(id);
  assert(pool != null, "Launchpad event references unknown pool " + id);
  return changetype<Pool>(pool);
}
