import { log } from '@graphprotocol/graph-ts'

import { Global } from '../../generated/schema'
import { BIG_INT_ONE, BIG_INT_ZERO, Product } from '../constants'

export function getOrCreateGlobal(): Global {
  let global = Global.load('1')

  if (global === null) {
    global = new Global('1')
    global.totalUsers = BIG_INT_ZERO
    global.bentoBoxUsers = BIG_INT_ZERO
    global.sushiswapUsers = BIG_INT_ZERO
    global.tridentUsers = BIG_INT_ZERO
    global.sushiXSwapUsers = BIG_INT_ZERO
    global.masterChefV1Users = BIG_INT_ZERO
    global.masterChefV2Users = BIG_INT_ZERO
    global.miniChefUsers = BIG_INT_ZERO
    global.sushiUsers = BIG_INT_ZERO
    global.xSushiUsers = BIG_INT_ZERO
    global.furoUsers = BIG_INT_ZERO
    global.limitOrderUsers = BIG_INT_ZERO
    global.kashiUsers = BIG_INT_ZERO
    global.misoUsers = BIG_INT_ZERO

    global.save()
  }
  return global
}

export function updateGlobalMetrics(type: string): Global {
  let global = getOrCreateGlobal()

  if (type === Product.BENTOBOX) {
    global.bentoBoxUsers = global.bentoBoxUsers.plus(BIG_INT_ONE)
  } else if (type === Product.SUSHISWAP) {
    global.sushiswapUsers = global.sushiswapUsers.plus(BIG_INT_ONE)
  } else if (type === Product.TRIDENT) {
    global.tridentUsers = global.tridentUsers.plus(BIG_INT_ONE)
  } else if (type === Product.SUSHI_X_SWAP) {
    global.sushiXSwapUsers = global.sushiXSwapUsers.plus(BIG_INT_ONE)
  } else if (type === Product.MASTER_CHEF_V1) {
    global.masterChefV1Users = global.masterChefV1Users.plus(BIG_INT_ONE)
  } else if (type === Product.MASTER_CHEF_V2) {
    global.masterChefV2Users = global.masterChefV2Users.plus(BIG_INT_ONE)
  } else if (type === Product.MINI_CHEF) {
    global.miniChefUsers = global.miniChefUsers.plus(BIG_INT_ONE)
  } else if (type === Product.SUSHI) {
    global.sushiUsers = global.sushiUsers.plus(BIG_INT_ONE)
  } else if (type === Product.XSUSHI) {
    global.xSushiUsers = global.xSushiUsers.plus(BIG_INT_ONE)
  } else if (type === Product.FURO) {
    global.furoUsers = global.furoUsers.plus(BIG_INT_ONE)
  } else if (type === Product.LIMIT_ORDERS) {
    global.limitOrderUsers = global.limitOrderUsers.plus(BIG_INT_ONE)
  } else if (type === Product.KASHI) {
    global.kashiUsers = global.kashiUsers.plus(BIG_INT_ONE)
  } else if (type === Product.MISO) {
    global.misoUsers = global.misoUsers.plus(BIG_INT_ONE)
  } else {
    log.warning('An unknown product was defined: {}', [type])
  }
  global.totalUsers = global.totalUsers.plus(BIG_INT_ONE)
  global.save()

  return global
}
