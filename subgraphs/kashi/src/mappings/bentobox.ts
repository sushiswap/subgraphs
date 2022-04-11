import { BigInt, log } from '@graphprotocol/graph-ts'
import { Clone } from '../../generated/schema'
import { KashiPair as KashiPairTemplate } from '../../generated/templates'
import { LogDeploy, LogSetMasterContractApproval, LogWhiteListMasterContract } from '../../generated/BentoBox/BentoBox'
import { createKashiPair, getOrCreateBentoBox, getOrCreateMasterContractApproval, getOrCreateUser } from '../functions'

import { getOrCreateMasterContract } from '../functions/master-contract'
import { KASHI_MEDIUM } from '../constants'

export function onLogWhiteListMasterContract(event: LogWhiteListMasterContract): void {
  if (event.params.approved == true) {
    getOrCreateMasterContract(event.params.masterContract)
  }
}

export function onLogSetMasterContractApproval(event: LogSetMasterContractApproval): void {
  getOrCreateUser(event.params.user)

  const masterContractApproval = getOrCreateMasterContractApproval(event)
  masterContractApproval.masterContract = event.params.masterContract.toHex()
  masterContractApproval.approved = event.params.approved
  masterContractApproval.save()
}

export function onLogDeploy(event: LogDeploy): void {
  let clone = new Clone(event.params.cloneAddress.toHex())

  clone.bentoBox = event.address.toHex()
  clone.masterContract = event.params.masterContract.toHex()
  clone.data = event.params.data.toHexString()
  clone.block = event.block.number
  clone.timestamp = event.block.timestamp
  clone.save()

  // Should eventually be converted to something like types.find
  if (event.params.masterContract == KASHI_MEDIUM.address) {
    createKashiPair(event.params.cloneAddress, event.block, KASHI_MEDIUM.type)
    KashiPairTemplate.create(event.params.cloneAddress)
  }
}
