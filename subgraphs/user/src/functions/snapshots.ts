import { BigInt } from "@graphprotocol/graph-ts"
import { DailySnapshot, Global, HourlySnapshot } from "../../generated/schema"
import { BIG_INT_ONE, BIG_INT_ZERO, DAY_IN_SECONDS, HOUR_IN_SECONDS, Product, WEEK_IN_SECONDS } from "../constants"
import { getOrCreateGlobal } from "./global"

export function updateSnapshots(
    timestamp: BigInt,
    isNewUser: boolean,
    product: string
): void {
    let global = getOrCreateGlobal()
    updateHourSnapshot(timestamp, global, isNewUser, product)
    updateDaySnapshot(timestamp, global, isNewUser, product)
    updateWeekSnapshot(timestamp, global, isNewUser, product)
}

function updateHourSnapshot(
    timestamp: BigInt,
    global: Global,
    isNewUser: boolean,
    product: string,
): void {
    let id = getHourSnapshotId(timestamp)

    let snapshot = HourlySnapshot.load(id)

    if (snapshot === null) {
        snapshot = new HourlySnapshot(id)
        snapshot.date = getHourStartDate(timestamp)
        snapshot.newUsers = BIG_INT_ZERO
        snapshot.newBentoBoxUsers = BIG_INT_ZERO
        snapshot.newSushiswapUsers = BIG_INT_ZERO
        snapshot.newTridentUsers = BIG_INT_ZERO
        snapshot.newSushiXSwapUsers = BIG_INT_ZERO
        snapshot.newMasterChefV1Users = BIG_INT_ZERO
        snapshot.newMasterChefV2Users = BIG_INT_ZERO
        snapshot.newMiniChefUsers = BIG_INT_ZERO
        snapshot.newSushiUsers = BIG_INT_ZERO
        snapshot.newXSushiUsers = BIG_INT_ZERO
        snapshot.newFuroUsers = BIG_INT_ZERO
        snapshot.newLimitOrderUsers = BIG_INT_ZERO
        snapshot.newKashiUsers = BIG_INT_ZERO
        snapshot.newMisoUsers = BIG_INT_ZERO
    }
    snapshot.totalUsers = global.totalUsers
    snapshot.bentoBoxTotalUsers = global.bentoBoxUsers
    snapshot.sushiswapTotalUsers = global.sushiswapUsers
    snapshot.tridentTotalUsers = global.tridentUsers
    snapshot.sushiXSwapTotalUsers = global.sushiXSwapUsers
    snapshot.masterChefV1TotalUsers = global.masterChefV1Users
    snapshot.masterChefV2TotalUsers = global.masterChefV2Users
    snapshot.miniChefTotalUsers = global.miniChefUsers
    snapshot.sushiTotalUsers = global.sushiUsers
    snapshot.xSushiTotalUsers = global.xSushiUsers
    snapshot.furoTotalUsers = global.furoUsers
    snapshot.limitOrderTotalUsers = global.limitOrderUsers
    snapshot.kashiTotalUsers = global.kashiUsers
    snapshot.misoTotalUsers = global.misoUsers
    if (isNewUser) {
        if (product === Product.BENTOBOX) {
            snapshot.newBentoBoxUsers = snapshot.newBentoBoxUsers.plus(BIG_INT_ONE)
        } else if (product === Product.SUSHISWAP) {
            snapshot.newSushiswapUsers = snapshot.newSushiswapUsers.plus(BIG_INT_ONE)
        } else if (product === Product.TRIDENT) {
            snapshot.newTridentUsers = snapshot.newTridentUsers.plus(BIG_INT_ONE)
        } else if (product === Product.SUSHI_X_SWAP) {
            snapshot.newSushiXSwapUsers = snapshot.newSushiXSwapUsers.plus(BIG_INT_ONE)
        } else if (product === Product.MASTER_CHEF_V1) {
            snapshot.newMasterChefV1Users = snapshot.newMasterChefV1Users.plus(BIG_INT_ONE)
        } else if (product === Product.MASTER_CHEF_V2) {
            snapshot.newMasterChefV2Users = snapshot.newMasterChefV2Users.plus(BIG_INT_ONE)
        } else if (product === Product.MINI_CHEF) {
            snapshot.newMiniChefUsers = snapshot.newMiniChefUsers.plus(BIG_INT_ONE)
        } else if (product === Product.SUSHI) {
            snapshot.newSushiUsers = snapshot.newSushiUsers.plus(BIG_INT_ONE)
        } else if (product === Product.XSUSHI) {
            snapshot.newXSushiUsers = snapshot.newXSushiUsers.plus(BIG_INT_ONE)
        } else if (product === Product.FURO) {
            snapshot.newFuroUsers = snapshot.newFuroUsers.plus(BIG_INT_ONE)
        } else if (product === Product.LIMIT_ORDERS) {
            snapshot.newLimitOrderUsers = snapshot.newLimitOrderUsers.plus(BIG_INT_ONE)
        } else if (product === Product.KASHI) {
            snapshot.newKashiUsers = snapshot.newKashiUsers.plus(BIG_INT_ONE)
        } else if (product === Product.MISO) {
            snapshot.newMisoUsers = snapshot.newMisoUsers.plus(BIG_INT_ONE)
        }
    }
    snapshot.save()
}


function updateDaySnapshot(
    timestamp: BigInt,
    global: Global,
    isNewUser: boolean,
    product: string,
): void {
    let id = getDaySnapshotId(timestamp)

    let snapshot = DailySnapshot.load(id)

    if (snapshot === null) {
        snapshot = new DailySnapshot(id)
        snapshot.date = getDayStartDate(timestamp)
        snapshot.newUsers = BIG_INT_ZERO
        snapshot.newBentoBoxUsers = BIG_INT_ZERO
        snapshot.newSushiswapUsers = BIG_INT_ZERO
        snapshot.newTridentUsers = BIG_INT_ZERO
        snapshot.newSushiXSwapUsers = BIG_INT_ZERO
        snapshot.newMasterChefV1Users = BIG_INT_ZERO
        snapshot.newMasterChefV2Users = BIG_INT_ZERO
        snapshot.newMiniChefUsers = BIG_INT_ZERO
        snapshot.newSushiUsers = BIG_INT_ZERO
        snapshot.newXSushiUsers = BIG_INT_ZERO
        snapshot.newFuroUsers = BIG_INT_ZERO
        snapshot.newLimitOrderUsers = BIG_INT_ZERO
        snapshot.newKashiUsers = BIG_INT_ZERO
        snapshot.newMisoUsers = BIG_INT_ZERO
    }
    snapshot.totalUsers = global.totalUsers
    snapshot.bentoBoxTotalUsers = global.bentoBoxUsers
    snapshot.sushiswapTotalUsers = global.sushiswapUsers
    snapshot.tridentTotalUsers = global.tridentUsers
    snapshot.sushiXSwapTotalUsers = global.sushiXSwapUsers
    snapshot.masterChefV1TotalUsers = global.masterChefV1Users
    snapshot.masterChefV2TotalUsers = global.masterChefV2Users
    snapshot.miniChefTotalUsers = global.miniChefUsers
    snapshot.sushiTotalUsers = global.sushiUsers
    snapshot.xSushiTotalUsers = global.xSushiUsers
    snapshot.furoTotalUsers = global.furoUsers
    snapshot.limitOrderTotalUsers = global.limitOrderUsers
    snapshot.kashiTotalUsers = global.kashiUsers
    snapshot.misoTotalUsers = global.misoUsers
    if (isNewUser) {
        if (product === Product.BENTOBOX) {
            snapshot.newBentoBoxUsers = snapshot.newBentoBoxUsers.plus(BIG_INT_ONE)
        } else if (product === Product.SUSHISWAP) {
            snapshot.newSushiswapUsers = snapshot.newSushiswapUsers.plus(BIG_INT_ONE)
        } else if (product === Product.TRIDENT) {
            snapshot.newTridentUsers = snapshot.newTridentUsers.plus(BIG_INT_ONE)
        } else if (product === Product.SUSHI_X_SWAP) {
            snapshot.newSushiXSwapUsers = snapshot.newSushiXSwapUsers.plus(BIG_INT_ONE)
        } else if (product === Product.MASTER_CHEF_V1) {
            snapshot.newMasterChefV1Users = snapshot.newMasterChefV1Users.plus(BIG_INT_ONE)
        } else if (product === Product.MASTER_CHEF_V2) {
            snapshot.newMasterChefV2Users = snapshot.newMasterChefV2Users.plus(BIG_INT_ONE)
        } else if (product === Product.MINI_CHEF) {
            snapshot.newMiniChefUsers = snapshot.newMiniChefUsers.plus(BIG_INT_ONE)
        } else if (product === Product.SUSHI) {
            snapshot.newSushiUsers = snapshot.newSushiUsers.plus(BIG_INT_ONE)
        } else if (product === Product.XSUSHI) {
            snapshot.newXSushiUsers = snapshot.newXSushiUsers.plus(BIG_INT_ONE)
        } else if (product === Product.FURO) {
            snapshot.newFuroUsers = snapshot.newFuroUsers.plus(BIG_INT_ONE)
        } else if (product === Product.LIMIT_ORDERS) {
            snapshot.newLimitOrderUsers = snapshot.newLimitOrderUsers.plus(BIG_INT_ONE)
        } else if (product === Product.KASHI) {
            snapshot.newKashiUsers = snapshot.newKashiUsers.plus(BIG_INT_ONE)
        } else if (product === Product.MISO) {
            snapshot.newMisoUsers = snapshot.newMisoUsers.plus(BIG_INT_ONE)
        }
    }

    snapshot.save()
}


function updateWeekSnapshot(
    timestamp: BigInt,
    global: Global,
    isNewUser: boolean,
    product: string,
): void {
    let id = getWeeklySnapshotId(timestamp)

    let snapshot = DailySnapshot.load(id)

    if (snapshot === null) {
        snapshot = new DailySnapshot(id)
        snapshot.date = getWeeklyStartDate(timestamp)
        snapshot.newUsers = BIG_INT_ZERO
        snapshot.newBentoBoxUsers = BIG_INT_ZERO
        snapshot.newSushiswapUsers = BIG_INT_ZERO
        snapshot.newTridentUsers = BIG_INT_ZERO
        snapshot.newSushiXSwapUsers = BIG_INT_ZERO
        snapshot.newMasterChefV1Users = BIG_INT_ZERO
        snapshot.newMasterChefV2Users = BIG_INT_ZERO
        snapshot.newMiniChefUsers = BIG_INT_ZERO
        snapshot.newSushiUsers = BIG_INT_ZERO
        snapshot.newXSushiUsers = BIG_INT_ZERO
        snapshot.newFuroUsers = BIG_INT_ZERO
        snapshot.newLimitOrderUsers = BIG_INT_ZERO
        snapshot.newKashiUsers = BIG_INT_ZERO
        snapshot.newMisoUsers = BIG_INT_ZERO
    }
    snapshot.totalUsers = global.totalUsers
    snapshot.bentoBoxTotalUsers = global.bentoBoxUsers
    snapshot.sushiswapTotalUsers = global.sushiswapUsers
    snapshot.tridentTotalUsers = global.tridentUsers
    snapshot.sushiXSwapTotalUsers = global.sushiXSwapUsers
    snapshot.masterChefV1TotalUsers = global.masterChefV1Users
    snapshot.masterChefV2TotalUsers = global.masterChefV2Users
    snapshot.miniChefTotalUsers = global.miniChefUsers
    snapshot.sushiTotalUsers = global.sushiUsers
    snapshot.xSushiTotalUsers = global.xSushiUsers
    snapshot.furoTotalUsers = global.furoUsers
    snapshot.limitOrderTotalUsers = global.limitOrderUsers
    snapshot.kashiTotalUsers = global.kashiUsers
    snapshot.misoTotalUsers = global.misoUsers
    if (isNewUser) {
        if (product === Product.BENTOBOX) {
            snapshot.newBentoBoxUsers = snapshot.newBentoBoxUsers.plus(BIG_INT_ONE)
        } else if (product === Product.SUSHISWAP) {
            snapshot.newSushiswapUsers = snapshot.newSushiswapUsers.plus(BIG_INT_ONE)
        } else if (product === Product.TRIDENT) {
            snapshot.newTridentUsers = snapshot.newTridentUsers.plus(BIG_INT_ONE)
        } else if (product === Product.SUSHI_X_SWAP) {
            snapshot.newSushiXSwapUsers = snapshot.newSushiXSwapUsers.plus(BIG_INT_ONE)
        } else if (product === Product.MASTER_CHEF_V1) {
            snapshot.newMasterChefV1Users = snapshot.newMasterChefV1Users.plus(BIG_INT_ONE)
        } else if (product === Product.MASTER_CHEF_V2) {
            snapshot.newMasterChefV2Users = snapshot.newMasterChefV2Users.plus(BIG_INT_ONE)
        } else if (product === Product.MINI_CHEF) {
            snapshot.newMiniChefUsers = snapshot.newMiniChefUsers.plus(BIG_INT_ONE)
        } else if (product === Product.SUSHI) {
            snapshot.newSushiUsers = snapshot.newSushiUsers.plus(BIG_INT_ONE)
        } else if (product === Product.XSUSHI) {
            snapshot.newXSushiUsers = snapshot.newXSushiUsers.plus(BIG_INT_ONE)
        } else if (product === Product.FURO) {
            snapshot.newFuroUsers = snapshot.newFuroUsers.plus(BIG_INT_ONE)
        } else if (product === Product.LIMIT_ORDERS) {
            snapshot.newLimitOrderUsers = snapshot.newLimitOrderUsers.plus(BIG_INT_ONE)
        } else if (product === Product.KASHI) {
            snapshot.newKashiUsers = snapshot.newKashiUsers.plus(BIG_INT_ONE)
        } else if (product === Product.MISO) {
            snapshot.newMisoUsers = snapshot.newMisoUsers.plus(BIG_INT_ONE)
        }
    }

    snapshot.save()
}


function getHourStartDate(timestamp: BigInt): i32 {
    let hourIndex = timestamp.toI32() / HOUR_IN_SECONDS // get unique hour within unix history
    return hourIndex * HOUR_IN_SECONDS // want the rounded effect
}

function getDayStartDate(timestamp: BigInt): i32 {
    let dayIndex = timestamp.toI32() / DAY_IN_SECONDS // get unique day within unix history
    return dayIndex * DAY_IN_SECONDS // want the rounded effect
}

function getWeeklyStartDate(timestamp: BigInt): i32 {
    let weeklyIndex = timestamp.toI32() / WEEK_IN_SECONDS // get unique day within unix history
    return weeklyIndex * WEEK_IN_SECONDS // want the rounded effect
}


export function getHourSnapshotId(timestamp: BigInt): string {
    let startDate = getHourStartDate(timestamp)
    return '-hour-'.concat(BigInt.fromI32(startDate).toString())
}

export function getDaySnapshotId(timestamp: BigInt): string {
    let startDate = getDayStartDate(timestamp)
    return '-day-'.concat(BigInt.fromI32(startDate).toString())
}

export function getWeeklySnapshotId(timestamp: BigInt): string {
    let startDate = getWeeklyStartDate(timestamp)
    return '-weekly-'.concat(BigInt.fromI32(startDate).toString())
}

