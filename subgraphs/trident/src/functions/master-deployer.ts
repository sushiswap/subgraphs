import { Address } from '@graphprotocol/graph-ts'
import { ADDRESS_ZERO, MASTER_DEPLOYER_ADDRESS } from '../constants'
import { MasterDeployer } from '../../generated/schema'
import { MasterDeployer as MasterDeployerContract } from '../../generated/MasterDeployer/MasterDeployer'

export function createMasterDeployer(id: Address = MASTER_DEPLOYER_ADDRESS): MasterDeployer {
  const contract = MasterDeployerContract.bind(id)
  const masterDeployer = new MasterDeployer(id.toHex())
  masterDeployer.owner = contract.owner()
  masterDeployer.pendingOwner = ADDRESS_ZERO
  masterDeployer.previousOwner = ADDRESS_ZERO
  masterDeployer.barFee = contract.barFee()
  masterDeployer.barFeeTo = contract.barFeeTo()
  masterDeployer.bento = contract.bento()
  masterDeployer.save()

  return masterDeployer as MasterDeployer
}

export function getOrCreateMasterDeployer(id: Address = MASTER_DEPLOYER_ADDRESS): MasterDeployer {
  let masterDeployer = MasterDeployer.load(id.toHex())

  if (masterDeployer === null) {
    masterDeployer = createMasterDeployer()
  }

  return masterDeployer as MasterDeployer
}
