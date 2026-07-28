import {
  Address,
  BigInt,
  Bytes,
  dataSource,
  ethereum,
} from "@graphprotocol/graph-ts";
import { SushiLaunchpad as SushiLaunchpadContract } from "../../generated/SushiLaunchpad/SushiLaunchpad";
import { Launch, Launchpad } from "../../generated/schema";

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
  return chainId.toString().concat(":").concat(canonicalHex(address));
}

export function canonicalHex(value: Bytes): string {
  return value.toHexString().toLowerCase();
}

export function eventId(chainId: BigInt, event: ethereum.Event): string {
  return chainId
    .toString()
    .concat(":")
    .concat(canonicalHex(event.transaction.hash))
    .concat(":")
    .concat(event.logIndex.toString());
}

export function quoteTokenPriceFeedId(
  launchpad: Launchpad,
  quoteToken: Bytes
): string {
  return launchpad.id.concat(":").concat(canonicalHex(quoteToken));
}

export function getOrCreateLaunchpad(
  context: DeploymentContext,
  factory: Address
): Launchpad {
  const id = addressId(context.chainId, factory);
  let launchpad = Launchpad.load(id);
  if (launchpad == null) {
    // These deployment/current settings are not present in every event. The
    // dedicated update handlers exclusively own them after initialization.
    const contract = SushiLaunchpadContract.bind(factory);
    launchpad = new Launchpad(id);
    launchpad.chainId = context.chainId;
    const positionManager = contract.positionManager();
    const protocolRecipient = contract.protocolRecipient();
    launchpad.address = canonicalHex(factory);
    launchpad.positionManager = canonicalHex(positionManager);
    launchpad.initialFdvUsd = contract.INITIAL_FDV_USD();
    launchpad.protocolRecipient = canonicalHex(protocolRecipient);
    launchpad.launchFee = contract.launchFee();
    launchpad.defaultSushiFeeBps = contract.defaultSushiFeeBps();
    launchpad.protocolReserveBps = contract.protocolReserveBps();
    launchpad.save();
  }
  return changetype<Launchpad>(launchpad);
}

export function requireLaunch(
  context: DeploymentContext,
  token: Bytes
): Launch {
  const id = addressId(context.chainId, token);
  const launch = Launch.load(id);
  assert(launch != null, "Launchpad event references unknown launch " + id);
  return changetype<Launch>(launch);
}
