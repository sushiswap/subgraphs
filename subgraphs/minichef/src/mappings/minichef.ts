import {
    Deposit,
    EmergencyWithdraw,
    Harvest,
    LogPoolAddition,
    LogSetPool,
    LogSushiPerSecond,
    LogUpdatePool,
    Withdraw,
  } from '../../generated/MiniChef/MiniChef'
import { getMiniChef, getPool, getRewarder, getUser } from '../functions'
import { ACC_SUSHI_PRECISION, BIG_INT_ONE, BIG_INT_ZERO } from '../constants'

export function logPoolAddition(event: LogPoolAddition): void {
  const miniChef = getMiniChef(event.block)
  const pool = getPool(event.params.pid, event.block)

  const rewarder = getRewarder(event.params.rewarder, event.block)
  pool.rewarder = rewarder.id
  pool.pair = event.params.lpToken
  pool.allocPoint = event.params.allocPoint
  pool.save()

  miniChef.totalAllocPoint = miniChef.totalAllocPoint.plus(pool.allocPoint)
  miniChef.poolCount = miniChef.poolCount.plus(BIG_INT_ONE)
  miniChef.save()
}

export function logSetPool(event: LogSetPool): void {
  const miniChef = getMiniChef(event.block)
  const pool = getPool(event.params.pid, event.block)

  if (event.params.overwrite == true) {
    const rewarder = getRewarder(event.params.rewarder, event.block)
    pool.rewarder = rewarder.id
  }

  miniChef.totalAllocPoint = miniChef.totalAllocPoint.plus(event.params.allocPoint.minus(pool.allocPoint))
  miniChef.save()
  pool.allocPoint = event.params.allocPoint
  pool.save()
}

export function logUpdatePool(event: LogUpdatePool): void {
  const pool = getPool(event.params.pid, event.block)
  pool.accSushiPerShare = event.params.accSushiPerShare
  pool.lastRewardTime = event.params.lastRewardTime
  pool.save()
}

export function logSushiPerSecond(event: LogSushiPerSecond): void {
  const miniChef = getMiniChef(event.block)

  miniChef.sushiPerSecond = event.params.sushiPerSecond
  miniChef.save()
}

export function deposit(event: Deposit): void {
  const pool = getPool(event.params.pid, event.block)
  const user = getUser(event.params.to, event.params.pid, event.block)

  if (user.amount === BIG_INT_ZERO && event.params.amount.gt(BIG_INT_ZERO) ) {
    pool.userCount = pool.userCount.plus(BIG_INT_ONE)
  }

  pool.slpBalance = pool.slpBalance.plus(event.params.amount)
  pool.save()

  user.amount = user.amount.plus(event.params.amount)
  user.rewardDebt = user.rewardDebt.plus(event.params.amount.times(pool.accSushiPerShare).div(ACC_SUSHI_PRECISION))
  user.save()
}

export function withdraw(event: Withdraw): void {
  const pool = getPool(event.params.pid, event.block)
  const user = getUser(event.params.user, event.params.pid, event.block)

  pool.slpBalance = pool.slpBalance.minus(event.params.amount)
  
  user.amount = user.amount.minus(event.params.amount)
  user.rewardDebt = user.rewardDebt.minus(event.params.amount.times(pool.accSushiPerShare).div(ACC_SUSHI_PRECISION))
  user.save()

  if (user.amount === BIG_INT_ZERO) {
    pool.userCount = pool.userCount.minus(BIG_INT_ONE)
  }
  
  pool.save()
}

export function emergencyWithdraw(event: EmergencyWithdraw): void {
  const pool = getPool(event.params.pid, event.block)
  const user = getUser(event.params.user, event.params.pid, event.block)

  pool.slpBalance = pool.slpBalance.minus(event.params.amount)
  pool.userCount = pool.userCount.minus(BIG_INT_ONE)
  pool.save()

  user.amount = BIG_INT_ZERO
  user.rewardDebt = BIG_INT_ZERO
  user.save()
}

export function harvest(event: Harvest): void {
  const pool = getPool(event.params.pid, event.block)
  const user = getUser(event.params.user, event.params.pid, event.block)

  const accumulatedSushi = user.amount.times(pool.accSushiPerShare).div(ACC_SUSHI_PRECISION)

  user.rewardDebt = accumulatedSushi
  user.sushiHarvested = user.sushiHarvested.plus(event.params.amount)
  user.save()
}
