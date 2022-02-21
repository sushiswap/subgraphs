import { Address } from '@graphprotocol/graph-ts'
import { getOrCreateBentoBox } from '.'
import { MasterContract } from '../../generated/schema'


export function getOrCreateMasterContract(id: Address): MasterContract {
  const bentoBox = getOrCreateBentoBox(id)

  let masterContract = MasterContract.load(id.toHex())

  if (masterContract === null) {
    masterContract = new MasterContract(id.toHex())
    masterContract.bentoBox = bentoBox.id
    masterContract.save()
  }

  return masterContract as MasterContract
}

