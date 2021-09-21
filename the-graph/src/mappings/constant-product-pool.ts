import { Address, BigDecimal, BigInt, log } from "@graphprotocol/graph-ts";
import {
  Approval,
  Burn,
  Mint,
  Swap,
  Sync,
  Transfer,
} from "../../generated/templates/ConstantProductPool/ConstantProductPool";

import { ADDRESS_ZERO } from "../constants";
import { getOrCreateConstantProductPool } from "../functions";

export function onMint(event: Mint): void {
  log.debug("onMint...", []);

  const pool = getOrCreateConstantProductPool(event.address);
  pool.transactionLength = pool.transactionLength.plus(BigInt.fromI32(1));

  pool.save();
}

export function onBurn(event: Burn): void {
  log.debug("onBurn...", []);

  const pool = getOrCreateConstantProductPool(event.address);
  pool.transactionLength = pool.transactionLength.plus(BigInt.fromI32(1));

  pool.save();
}

export function onSync(event: Sync): void {
  log.debug("onSync...", []);

  const pool = getOrCreateConstantProductPool(event.address);

  pool.reserve0 = event.params.reserve0;
  pool.reserve1 = event.params.reserve1;

  pool.save();
}

export function onSwap(event: Swap): void {
  log.debug("onSwap...", []);
}

export function onApproval(event: Approval): void {
  log.debug("onApproval...", []);
}

export function onTransfer(event: Transfer): void {
  log.debug("onTransfer... {} {} {}", [
    event.params.amount.divDecimal(BigDecimal.fromString("1e18")).toString(),
    event.params.recipient.toHex(),
    event.params.sender.toHex(),
  ]);

  const pool = getOrCreateConstantProductPool(event.address);

  // If sender is black hole, we're mintin'
  if (event.params.sender == ADDRESS_ZERO) {
    pool.totalSupply = pool.totalSupply.plus(event.params.amount);
    pool.save();
  }

  // If recipient is black hole we're burnin'
  if (
    event.params.sender.toHex() == pool.id &&
    event.params.recipient == ADDRESS_ZERO
  ) {
    pool.totalSupply = pool.totalSupply.minus(event.params.amount);
    pool.save();
  }
}
