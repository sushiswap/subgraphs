import {
  Approval,
  Burn,
  Mint,
  Swap,
  Sync,
  Transfer,
} from "../generated/templates/ConstantProductPool/ConstantProductPool";

import { log } from "@graphprotocol/graph-ts";

export function onMint(event: Mint): void {
  log.info("onMint...", []);
}

export function onBurn(event: Burn): void {
  log.info("onBurn...", []);
}

export function onSync(event: Sync): void {
  log.info("onSync...", []);
}

export function onSwap(event: Swap): void {
  log.info("onSwap...", []);
}

export function onApproval(event: Approval): void {
  log.info("onApproval...", []);
}

export function onTransfer(event: Transfer): void {
  log.info("onTransfer...", []);
}
