import { createPair } from '../functions/pair'
import {
  DeployPool
} from '../../generated/MasterDeployer/MasterDeployer'
import { ConstantProductPool } from '../../generated/templates'
import { CONSTANT_PRODUCT_POOL_FACTORY_ADDRESS } from '../constants'


export function onDeployPool(event: DeployPool): void {

  if (event.params.factory == CONSTANT_PRODUCT_POOL_FACTORY_ADDRESS) {
    createPair(event.params)
    ConstantProductPool.create(event.params.pool)
  }

}

