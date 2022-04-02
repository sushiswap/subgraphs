import { Address } from '@graphprotocol/graph-ts'
import { MasterContract } from '../../generated/schema'
import { getOrCreateBentoBox } from '.'

export function getOrCreateMasterContract(id: Address): MasterContract {
  const bentoBox = getOrCreateBentoBox()

  let masterContract = MasterContract.load(id.toHex())

  if (masterContract === null) {
    masterContract = new MasterContract(id.toHex())
    masterContract.bentoBox = bentoBox.id
    masterContract.save()
  }

  return masterContract as MasterContract
}
