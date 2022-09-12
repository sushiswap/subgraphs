import { LogSetMasterContractApproval } from '../../generated/BentoBox/BentoBox'
import { MasterContractApproval } from '../../generated/schema'

export function getMasterContractApprovalId(event: LogSetMasterContractApproval): string {
  return event.params.user.toHex().concat('-').concat(event.params.masterContract.toHex())
}

export function getOrCreateMasterContractApproval(event: LogSetMasterContractApproval): MasterContractApproval {
  const id = getMasterContractApprovalId(event)

  let masterContractApproval = MasterContractApproval.load(id)

  if (masterContractApproval === null) {
    masterContractApproval = new MasterContractApproval(id)
    masterContractApproval.approved = event.params.approved
    masterContractApproval.user = event.params.user.toHex()
    masterContractApproval.masterContract = event.params.masterContract.toHex()
    masterContractApproval.save()
  }

  return masterContractApproval as MasterContractApproval
}
