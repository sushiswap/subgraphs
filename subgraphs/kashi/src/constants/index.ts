import { Address } from '@graphprotocol/graph-ts'

export const BENTOBOX_ADDRESS = Address.fromString('0x0319000133d3ada02600f0875d2cf03d442c3367')

class KashiType {
  address: Address
  type: string
}

export const KASHI_MEDIUM: KashiType = { address: Address.fromString(''), type: 'medium' }

export * from './kashi-constants'
