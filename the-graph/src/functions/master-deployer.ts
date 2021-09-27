import { Address, BigInt } from "@graphprotocol/graph-ts";

import { ADDRESS_ZERO } from "../constants";
import { MasterDeployer } from "../../generated/schema";

export function getOrCreateMasterDeployer(id: Address): MasterDeployer {
  let masterDeployer = MasterDeployer.load(id.toHex());

  if (masterDeployer === null) {
    masterDeployer = new MasterDeployer(id.toHex());
    masterDeployer.owner = ADDRESS_ZERO;
    masterDeployer.migrator = ADDRESS_ZERO;
    masterDeployer.barFee = BigInt.fromI32(0);
    masterDeployer.save();
  }

  return masterDeployer as MasterDeployer;
}
