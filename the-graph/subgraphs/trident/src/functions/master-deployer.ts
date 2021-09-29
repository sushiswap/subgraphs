import { Address, BigInt } from '@graphprotocol/graph-ts'

import { ADDRESS_ZERO } from '../constants'
import { MasterDeployer } from '../../generated/schema'
import { MasterDeployer as MasterDeployerContract } from '../../generated/MasterDeployer/MasterDeployer'

export function getOrCreateMasterDeployer(id: Address): MasterDeployer {
  let masterDeployer = MasterDeployer.load(id.toHex())

  if (masterDeployer === null) {
    const contract = MasterDeployerContract.bind(id)
    masterDeployer = new MasterDeployer(id.toHex())
    masterDeployer.owner = contract.owner()
    masterDeployer.migrator = ADDRESS_ZERO
    masterDeployer.barFee = contract.barFee()
    masterDeployer.barFeeTo = contract.barFeeTo()
    masterDeployer.bento = contract.bento()
    masterDeployer.save()
  }

  return masterDeployer as MasterDeployer
}
