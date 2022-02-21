import { LogSetMasterContractApproval } from '../../generated/BentoBox/BentoBox'
import { MasterContractApproval } from '../../generated/schema'

export function getOrCreateMasterContractApproval(event: LogSetMasterContractApproval): MasterContractApproval {
  const id = getMasterContractApprovalId(event)

  let masterContractApproval = MasterContractApproval.load(id)

  if (masterContractApproval === null) {
    masterContractApproval = new MasterContractApproval(id)
    masterContractApproval.user = event.params.user.toHex()
    masterContractApproval.masterContract = event.params.masterContract.toHex()
    masterContractApproval.approved = false
    masterContractApproval.save()
  }

  return masterContractApproval as MasterContractApproval
}

export function getMasterContractApprovalId(event: LogSetMasterContractApproval): string {
  return event.params.user.toHex().concat('-').concat(event.params.masterContract.toHex())
}
