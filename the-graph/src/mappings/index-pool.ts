import { Address, BigDecimal, BigInt, log } from "@graphprotocol/graph-ts";
import {
  Approval,
  Burn,
  Mint,
  Swap,
  Transfer,
} from "../../generated/templates/IndexPool/IndexPool";

import { getOrCreateHybridPool } from "../functions";

export function onMint(event: Mint): void {
  log.debug("[Hybrid] onMint...", []);

  const pool = getOrCreateHybridPool(event.address);
  pool.transactionCount = pool.transactionCount.plus(BigInt.fromI32(1));

  pool.save();
}

export function onBurn(event: Burn): void {
  log.debug("[Hybrid] onBurn...", []);

  const pool = getOrCreateHybridPool(event.address);
  pool.transactionCount = pool.transactionCount.plus(BigInt.fromI32(1));

  pool.save();
}

export function onSwap(event: Swap): void {
  log.debug("[Hybrid] onSwap...", []);
}

export function onApproval(event: Approval): void {
  log.debug("[Hybrid] onApproval...", []);
}

export function onTransfer(event: Transfer): void {
  log.debug("[Hybrid] onTransfer... {} {} {}", [
    event.params.amount.divDecimal(BigDecimal.fromString("1e18")).toString(),
    event.params.recipient.toHex(),
    event.params.sender.toHex(),
  ]);

  const pool = getOrCreateHybridPool(event.address);

  // If sender is black hole, we're mintin'
  if (
    event.params.sender ==
    Address.fromString("0x0000000000000000000000000000000000000000")
  ) {
    pool.totalSupply = pool.totalSupply.plus(event.params.amount);
    pool.save();
  }

  // If recipient is black hole we're burnin'
  if (
    event.params.sender.toHex() == pool.id &&
    event.params.recipient ==
      Address.fromString("0x0000000000000000000000000000000000000000")
  ) {
    pool.totalSupply = pool.totalSupply.minus(event.params.amount);
    pool.save();
  }
}
