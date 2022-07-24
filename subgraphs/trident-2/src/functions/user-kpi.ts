import { Address } from '@graphprotocol/graph-ts'
import { UserKpi } from '../../generated/schema'
import { BIG_INT_ZERO } from '../constants'

export function createUserKpi(address: Address): UserKpi {
  const userKpi = new UserKpi(address.toHex())
  userKpi.lpSnapshotsCount = BIG_INT_ZERO
  userKpi.user = address.toHex()
  userKpi.save()
  return userKpi as UserKpi
}

export function getUserKpi(address: string): UserKpi {
  return UserKpi.load(address) as UserKpi
}