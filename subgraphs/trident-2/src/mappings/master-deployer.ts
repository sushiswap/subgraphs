import {
  DeployPool
} from '../../generated/MasterDeployer/MasterDeployer'
import { CONSTANT_PRODUCT_POOL_FACTORY_ADDRESS } from '../constants'
import { createPair } from '../functions/pair'


export function onDeployPool(event: DeployPool): void {

  if (event.params.factory == CONSTANT_PRODUCT_POOL_FACTORY_ADDRESS) {
    createPair(event)
  }

}

