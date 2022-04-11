import { Address, BigInt } from '@graphprotocol/graph-ts'
import { MasterContract } from '../../generated/schema'
import { getOrCreateBentoBox } from './index'

export function getOrCreateMasterContract(id: Address): MasterContract {
  const bentoBox = getOrCreateBentoBox()

  let masterContract = MasterContract.load(id.toHex())

  if (masterContract === null) {
    masterContract = new MasterContract(id.toHex())
    masterContract.bentoBox = bentoBox.id
    masterContract.save()

    bentoBox.masterContractCount = bentoBox.masterContractCount.plus(BigInt.fromI32(1))
    bentoBox.save()
  }

  return masterContract as MasterContract
}
