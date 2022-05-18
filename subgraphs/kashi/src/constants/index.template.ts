import { Address } from '@graphprotocol/graph-ts'

export const BENTOBOX_ADDRESS = Address.fromString('{{ bentobox.address }}')

class KashiType {
  address: Address
  type: string
}

export const KASHI_MEDIUM: KashiType = { address: Address.fromString('{{ kashi.medium }}'), type: 'medium' }

export * from './kashi-constants'
