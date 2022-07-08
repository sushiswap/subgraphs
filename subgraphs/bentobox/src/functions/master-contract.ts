import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts'
import { MasterContract } from '../../generated/schema'
import { getOrCreateBentoBox } from './bentobox'
import { getBentoBoxKpi, increaseMasterContractCount } from './bentobox-kpi'

export function getOrCreateMasterContract(id: Address, event: ethereum.Event): MasterContract {
  const bentoBox = getOrCreateBentoBox()

  let masterContract = MasterContract.load(id.toHex())

  if (masterContract === null) {
    masterContract = new MasterContract(id.toHex())
    masterContract.bentoBox = bentoBox.id
    masterContract.approved = false
    masterContract.save()

    increaseMasterContractCount(event.block.timestamp)
  }

  return masterContract as MasterContract
}
