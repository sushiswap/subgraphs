import {
  Mint as MintEvent
} from '../templates/ConstantProductPool/ConstantProductPool'
import {
  getOrCreateConstantProductPoolFactory
} from '../functions/constant-product-pool'


export function onMint(event: MintEvent): void {
  getOrCreateConstantProductPoolFactory()
}
