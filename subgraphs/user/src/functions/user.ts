import { Address, ethereum } from '@graphprotocol/graph-ts'

import { User } from '../../generated/schema'
import { BIG_INT_ZERO, Product } from '../constants'
import { updateGlobalMetrics } from './global'
import { updateSnapshots } from './snapshots'


export function handleUser(id: Address, event: ethereum.Event, product: string): void {
  let user = User.load(id.toHex())

  if (user === null) {
    user = new User(id.toHex())
    user.createdAtBlock = event.block.number
    user.createdAtTimestamp = event.block.timestamp
    user.modifiedAtBlock = event.block.number
    user.modifiedAtTimestamp = event.block.timestamp

    user.usedBentoBox = false
    user.bentoBoxFirstInteractionAtBlock = BIG_INT_ZERO
    user.bentoBoxFirstInteractionAtTimestamp = BIG_INT_ZERO
    user.bentoBoxLatestInteractionAtBlock = BIG_INT_ZERO
    user.bentoBoxLatestInteractionAtTimestamp = BIG_INT_ZERO

    user.usedSushiswap = false
    user.sushiswapFirstInteractionAtBlock = BIG_INT_ZERO
    user.sushiswapFirstInteractionAtTimestamp = BIG_INT_ZERO
    user.sushiswapLatestInteractionAtBlock = BIG_INT_ZERO
    user.sushiswapLatestInteractionAtTimestamp = BIG_INT_ZERO

    user.usedTrident = false
    user.tridentFirstInteractionAtBlock = BIG_INT_ZERO
    user.tridentFirstInteractionAtTimestamp = BIG_INT_ZERO
    user.tridentLatestInteractionAtBlock = BIG_INT_ZERO
    user.tridentLatestInteractionAtTimestamp = BIG_INT_ZERO

    user.usedSushiXSwap = false
    user.sushiXSwapFirstInteractionAtBlock = BIG_INT_ZERO
    user.sushiXSwapFirstInteractionAtTimestamp = BIG_INT_ZERO
    user.sushiXSwapLatestInteractionAtBlock = BIG_INT_ZERO
    user.sushiXSwapLatestInteractionAtTimestamp = BIG_INT_ZERO

    user.usedMasterChefV1 = false
    user.masterChefV1FirstInteractionAtBlock = BIG_INT_ZERO
    user.masterChefV1FirstInteractionAtTimestamp = BIG_INT_ZERO
    user.masterChefV1LatestInteractionAtBlock = BIG_INT_ZERO
    user.masterChefV1LatestInteractionAtTimestamp = BIG_INT_ZERO

    user.usedMasterChefV2 = false
    user.masterChefV2FirstInteractionAtBlock = BIG_INT_ZERO
    user.masterChefV2FirstInteractionAtTimestamp = BIG_INT_ZERO
    user.masterChefV2LatestInteractionAtBlock = BIG_INT_ZERO
    user.masterChefV2LatestInteractionAtTimestamp = BIG_INT_ZERO

    user.usedMiniChef = false
    user.miniChefFirstInteractionAtBlock = BIG_INT_ZERO
    user.miniChefFirstInteractionAtTimestamp = BIG_INT_ZERO
    user.miniChefLatestInteractionAtBlock = BIG_INT_ZERO
    user.miniChefLatestInteractionAtTimestamp = BIG_INT_ZERO

    user.usedSushi = false
    user.sushiFirstInteractionAtBlock = BIG_INT_ZERO
    user.sushiFirstInteractionAtTimestamp = BIG_INT_ZERO
    user.sushiLatestInteractionAtBlock = BIG_INT_ZERO
    user.sushiLatestInteractionAtTimestamp = BIG_INT_ZERO

    user.usedXSushi = false
    user.xSushiFirstInteractionAtBlock = BIG_INT_ZERO
    user.xSushiFirstInteractionAtTimestamp = BIG_INT_ZERO
    user.xSushiLatestInteractionAtBlock = BIG_INT_ZERO
    user.xSushiLatestInteractionAtTimestamp = BIG_INT_ZERO

    user.usedFuro = false
    user.furoFirstInteractionAtBlock = BIG_INT_ZERO
    user.furoFirstInteractionAtTimestamp = BIG_INT_ZERO
    user.furoLatestInteractionAtBlock = BIG_INT_ZERO
    user.furoLatestInteractionAtTimestamp = BIG_INT_ZERO

    user.usedLimitOrder = false
    user.limitOrderFirstInteractionAtBlock = BIG_INT_ZERO
    user.limitOrderFirstInteractionAtTimestamp = BIG_INT_ZERO
    user.limitOrderLatestInteractionAtBlock = BIG_INT_ZERO
    user.limitOrderLatestInteractionAtTimestamp = BIG_INT_ZERO

    user.usedKashi = false
    user.kashiFirstInteractionAtBlock = BIG_INT_ZERO
    user.kashiFirstInteractionAtTimestamp = BIG_INT_ZERO
    user.kashiLatestInteractionAtBlock = BIG_INT_ZERO
    user.kashiLatestInteractionAtTimestamp = BIG_INT_ZERO

    user.usedMiso = false
    user.misoFirstInteractionAtBlock = BIG_INT_ZERO
    user.misoFirstInteractionAtTimestamp = BIG_INT_ZERO
    user.misoLatestInteractionAtBlock = BIG_INT_ZERO
    user.misoLatestInteractionAtTimestamp = BIG_INT_ZERO

    user.save()
  }

  let isNewUser = false
  if (product === Product.BENTOBOX) {
    if (!user.usedBentoBox) {
      isNewUser = true
      user.usedBentoBox = true
    }
    user.bentoBoxLatestInteractionAtBlock = event.block.number
    user.bentoBoxLatestInteractionAtTimestamp = event.block.timestamp
    user.modifiedAtBlock = event.block.number
    user.modifiedAtTimestamp = event.block.timestamp
    user.save()
  } else if (product === Product.SUSHISWAP) {
    if (!user.usedSushiswap) {
      isNewUser = true
      user.usedSushiswap = true
    }
    user.sushiswapLatestInteractionAtBlock = event.block.number
    user.sushiswapLatestInteractionAtTimestamp = event.block.timestamp
    user.modifiedAtBlock = event.block.number
    user.modifiedAtTimestamp = event.block.timestamp
    user.save()
  } else if (product === Product.TRIDENT) {
    if (!user.usedTrident) {
      isNewUser = true
      user.usedTrident = true
    }
    user.tridentLatestInteractionAtBlock = event.block.number
    user.tridentLatestInteractionAtTimestamp = event.block.timestamp
    user.modifiedAtBlock = event.block.number
    user.modifiedAtTimestamp = event.block.timestamp
    user.save()
  } else if (product === Product.SUSHI_X_SWAP) {
    if (!user.usedSushiXSwap) {
      isNewUser = true
      user.usedSushiXSwap = true
    }
    user.sushiXSwapLatestInteractionAtBlock = event.block.number
    user.sushiXSwapLatestInteractionAtTimestamp = event.block.timestamp
    user.modifiedAtBlock = event.block.number
    user.modifiedAtTimestamp = event.block.timestamp
    user.save()
  } else if (product === Product.MASTER_CHEF_V1) {
    if (!user.usedMasterChefV1) {
      isNewUser = true
      user.usedMasterChefV1 = true
    }
    user.masterChefV1LatestInteractionAtBlock = event.block.number
    user.masterChefV1LatestInteractionAtTimestamp = event.block.timestamp
    user.modifiedAtBlock = event.block.number
    user.modifiedAtTimestamp = event.block.timestamp
    user.save()
  } else if (product === Product.MASTER_CHEF_V2) {
    if (!user.usedMasterChefV2) {
      isNewUser = true
      user.usedMasterChefV2 = true
    }
    user.masterChefV2LatestInteractionAtBlock = event.block.number
    user.masterChefV2LatestInteractionAtTimestamp = event.block.timestamp
    user.modifiedAtBlock = event.block.number
    user.modifiedAtTimestamp = event.block.timestamp
    user.save()
  } else if (product === Product.MINI_CHEF) {
    if (!user.usedMiniChef) {
      isNewUser = true
      user.usedMiniChef = true
    }
    user.miniChefLatestInteractionAtBlock = event.block.number
    user.miniChefLatestInteractionAtTimestamp = event.block.timestamp
    user.modifiedAtBlock = event.block.number
    user.modifiedAtTimestamp = event.block.timestamp
    user.save()
  }
  else if (product === Product.SUSHI) {
    if (!user.usedSushi) {
      isNewUser = true
      user.usedSushi = true
    }
    user.sushiLatestInteractionAtBlock = event.block.number
    user.sushiLatestInteractionAtTimestamp = event.block.timestamp
    user.modifiedAtBlock = event.block.number
    user.modifiedAtTimestamp = event.block.timestamp
    user.save()
  }
  else if (product === Product.XSUSHI) {
    if (!user.usedXSushi) {
      isNewUser = true
      user.usedXSushi = true
    }
    user.xSushiLatestInteractionAtBlock = event.block.number
    user.xSushiLatestInteractionAtTimestamp = event.block.timestamp
    user.modifiedAtBlock = event.block.number
    user.modifiedAtTimestamp = event.block.timestamp
    user.save()
  }
  else if (product === Product.FURO) {
    if (!user.usedFuro) {
      isNewUser = true
      user.usedFuro = true
    }
    user.furoLatestInteractionAtBlock = event.block.number
    user.furoLatestInteractionAtTimestamp = event.block.timestamp
    user.modifiedAtBlock = event.block.number
    user.modifiedAtTimestamp = event.block.timestamp
    user.save()
  }
  else if (product === Product.LIMIT_ORDERS) {
    if (!user.usedLimitOrder) {
      isNewUser = true
      user.usedLimitOrder = true
    }
    user.limitOrderLatestInteractionAtBlock = event.block.number
    user.limitOrderLatestInteractionAtTimestamp = event.block.timestamp
    user.modifiedAtBlock = event.block.number
    user.modifiedAtTimestamp = event.block.timestamp
    user.save()
  } else if (product === Product.KASHI) {
    if (!user.usedKashi) {
      isNewUser = true
      user.usedKashi = true
    }
    user.kashiLatestInteractionAtBlock = event.block.number
    user.kashiLatestInteractionAtTimestamp = event.block.timestamp
    user.modifiedAtBlock = event.block.number
    user.modifiedAtTimestamp = event.block.timestamp
    user.save()
  } else if (product === Product.MISO) {
    if (!user.usedMiso) {
      isNewUser = true
      user.usedMiso = true
    }
    user.misoLatestInteractionAtBlock = event.block.number
    user.misoLatestInteractionAtTimestamp = event.block.timestamp
    user.modifiedAtBlock = event.block.number
    user.modifiedAtTimestamp = event.block.timestamp
    user.save()
  }

  if (isNewUser) {
    updateGlobalMetrics(product)
  }

  updateSnapshots(event.block.timestamp, isNewUser, product)
}
