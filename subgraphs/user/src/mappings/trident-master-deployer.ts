import { ConstantProductPool } from '../../generated/templates'
import {
  DeployPool
} from '../../generated/MasterDeployer/MasterDeployer'
import { CONSTANT_PRODUCT_POOL_FACTORY_ADDRESS } from '../constants'



export function onDeployPool(event: DeployPool): void {

  if (event.params.factory == CONSTANT_PRODUCT_POOL_FACTORY_ADDRESS) {
    ConstantProductPool.create(event.params.pool)
  }

}

