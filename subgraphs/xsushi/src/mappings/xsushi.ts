import { BigDecimal, BigInt, log } from '@graphprotocol/graph-ts'
import { WeekSnapshot, XSushi } from '../../generated/schema'
import { Transfer as SushiTransferEvent } from '../../generated/sushi/sushi'
import { Transfer as TransferEvent } from '../../generated/xSushi/xSushi'
import { BIG_DECIMAL_1E18, BIG_INT_ONE, BURN, MINT, TRACK_APR_BLOCK, TRANSFER, XSUSHI_ADDRESS } from '../constants'
import { getOrCreateFee } from '../functions/fee'
import { getOrCreateFeeSender } from '../functions/fee-sender'
import {
  createTransaction,
  isBurnTransaction,
  isMintTransaction,
  transactionExists
} from '../functions/transaction'
import { getOrCreateUser } from '../functions/user'
import { getOrCreateXSushi } from '../functions/xsushi'
import { getAprSnapshot, updateSnapshots } from '../functions/xsushi-snapshot'

export function onTransfer(event: TransferEvent): void {
  let sender = getOrCreateUser(event.params.from.toHex(), event)
  let reciever = getOrCreateUser(event.params.to.toHex(), event)
  sender.balance = sender.balance.minus(event.params.value)
  sender.modifiedAtBlock = event.block.number
  sender.modifiedAtTimestamp = event.block.timestamp
  sender.save()

  reciever.balance = reciever.balance.plus(event.params.value)
  reciever.modifiedAtBlock = event.block.number
  reciever.modifiedAtTimestamp = event.block.timestamp
  reciever.save()

  const transaction = createTransaction(event)
  const value = event.params.value.divDecimal(BIG_DECIMAL_1E18)

  transaction.from = event.params.from.toHex()
  transaction.to = event.params.to.toHex()
  transaction.amount = value
  transaction.gasUsed = event.block.gasUsed
  transaction.gasLimit = event.transaction.gasLimit
  transaction.gasPrice = event.transaction.gasPrice
  transaction.createdAtBlock = event.block.number
  transaction.createdAtTimestamp = event.block.timestamp

  const xSushi = getOrCreateXSushi()
  xSushi.transactionCount = xSushi.transactionCount.plus(BigInt.fromU32(1))
  if (isMintTransaction(event)) {
    transaction.type = MINT
    xSushi.xSushiSupply = xSushi.xSushiSupply.plus(value)
    xSushi.xSushiMinted = xSushi.xSushiMinted.plus(value)
    xSushi.save()
    const snapshots = updateSnapshots(event.block.timestamp)
    snapshots.hour.newTransactions = snapshots.hour.newTransactions.plus(BIG_INT_ONE)
    snapshots.hour.newXSushiMinted = snapshots.hour.newXSushiMinted.plus(value)
    snapshots.day.newTransactions = snapshots.day.newTransactions.plus(BIG_INT_ONE)
    snapshots.day.newXSushiMinted = snapshots.day.newXSushiMinted.plus(value)
    snapshots.week.newTransactions = snapshots.week.newTransactions.plus(BIG_INT_ONE)
    snapshots.week.newXSushiMinted = snapshots.week.newXSushiMinted.plus(value)
    snapshots.hour.save()
    snapshots.day.save()
    snapshots.week.save()
  } else if (isBurnTransaction(event)) {
    transaction.type = BURN
    xSushi.xSushiBurned = xSushi.xSushiBurned.plus(value)
    xSushi.xSushiSupply = xSushi.xSushiSupply.minus(value)
    updateRatio(xSushi)
    updateApr(xSushi, event.block.timestamp)
    xSushi.save()

    const snapshots = updateSnapshots(event.block.timestamp)
    snapshots.hour.newTransactions = snapshots.hour.newTransactions.plus(BIG_INT_ONE)
    snapshots.hour.newXSushiBurned = snapshots.hour.newXSushiBurned.plus(value)
    snapshots.day.newTransactions = snapshots.day.newTransactions.plus(BIG_INT_ONE)
    snapshots.day.newXSushiBurned = snapshots.day.newXSushiBurned.plus(value)
    snapshots.week.newTransactions = snapshots.week.newTransactions.plus(BIG_INT_ONE)
    snapshots.week.newXSushiBurned = snapshots.week.newXSushiBurned.plus(value)
    snapshots.hour.save()
    snapshots.day.save()
    snapshots.week.save()
  } else {
    transaction.type = TRANSFER
    const snapshots = updateSnapshots(event.block.timestamp)
    snapshots.hour.newTransactions = snapshots.hour.newTransactions.plus(BIG_INT_ONE)
    snapshots.day.newTransactions = snapshots.day.newTransactions.plus(BIG_INT_ONE)
    snapshots.week.newTransactions = snapshots.week.newTransactions.plus(BIG_INT_ONE)
    snapshots.hour.save()
    snapshots.day.save()
    snapshots.week.save()
  }
  transaction.save()
}

export function onSushiTransfer(event: SushiTransferEvent): void {
  const value = event.params.value.divDecimal(BIG_DECIMAL_1E18)
  if (event.params.to == XSUSHI_ADDRESS) {
    // STAKE
    if (transactionExists(event)) {
      let xSushi = getOrCreateXSushi()
      xSushi.sushiSupply = xSushi.sushiSupply.plus(value)
      xSushi.sushiStaked = xSushi.sushiStaked.plus(value)
      xSushi.sushiXsushiRatio = xSushi.sushiSupply.div(xSushi.xSushiSupply)
      xSushi.xSushiSushiRatio = xSushi.xSushiSupply.div(xSushi.sushiSupply)
      xSushi.save()

      const snapshots = updateSnapshots(event.block.timestamp)
      snapshots.hour.newSushiStaked = snapshots.hour.newSushiStaked.plus(value)
      snapshots.day.newSushiStaked = snapshots.day.newSushiStaked.plus(value)
      snapshots.week.newSushiStaked = snapshots.week.newSushiStaked.plus(value)
      snapshots.hour.save()
      snapshots.day.save()
      snapshots.week.save()
    }
    // If no transaction exists, it means that the it's a direct transfer (not from enter function in the sushibar contract)
    else {
      const sender = getOrCreateFeeSender(event)
      sender.totalFeeSent = sender.totalFeeSent.plus(event.params.value)
      sender.modifiedAtBlock = event.block.number
      sender.modifiedAtTimestamp = event.block.timestamp
      sender.save()

      getOrCreateFee(event)

      let xSushi = getOrCreateXSushi()
      xSushi.totalFeeAmount = xSushi.totalFeeAmount.plus(value)
      xSushi.sushiSupply = xSushi.sushiSupply.plus(value)
      updateRatio(xSushi)
      updateApr(xSushi, event.block.timestamp)
      xSushi.save()

      const snapshots = updateSnapshots(event.block.timestamp)
      snapshots.hour.newFeeAmount = snapshots.hour.newFeeAmount.plus(value)
      snapshots.day.newFeeAmount = snapshots.day.newFeeAmount.plus(value)
      snapshots.week.newFeeAmount = snapshots.week.newFeeAmount.plus(value)
      snapshots.hour.save()
      snapshots.day.save()
      snapshots.week.save()
    }
    // HARVEST
  } else if (event.params.from == XSUSHI_ADDRESS) {
    let xSushi = getOrCreateXSushi()
    xSushi.sushiHarvested = xSushi.sushiHarvested.plus(value)
    xSushi.sushiSupply = xSushi.sushiSupply.minus(value)
    updateRatio(xSushi)
    updateApr(xSushi, event.block.timestamp)
    xSushi.save()

    const snapshots = updateSnapshots(event.block.timestamp)
    snapshots.hour.newSushiHarvested = snapshots.hour.newSushiHarvested.plus(value)
    snapshots.day.newSushiHarvested = snapshots.day.newSushiHarvested.plus(value)
    snapshots.week.newSushiHarvested = snapshots.week.newSushiHarvested.plus(value)
    snapshots.hour.save()
    snapshots.day.save()
    snapshots.week.save()
  }
}

function updateRatio(xSushi: XSushi): void {
  if (xSushi.xSushiSupply.gt(BigDecimal.zero()) && xSushi.sushiSupply.gt(BigDecimal.zero())) {
    xSushi.sushiXsushiRatio = xSushi.sushiSupply.div(xSushi.xSushiSupply)
    xSushi.xSushiSushiRatio = xSushi.xSushiSupply.div(xSushi.sushiSupply)
  } else {
    xSushi.sushiXsushiRatio = BigDecimal.fromString('1')
    xSushi.xSushiSushiRatio = BigDecimal.fromString('1')
  }
}

export function updateApr(xSushi: XSushi, timestamp: BigInt): void {
  if (timestamp.le(TRACK_APR_BLOCK)) {
    return // We don't track the apr before the apr tracking block, at least a year must have passed since the starting block
  }
  const snapshot = getAprSnapshot(timestamp)
  if (snapshot == null) {
    log.debug('no snapshot found, should we set apr to zero?', [])
    return
  }
  xSushi.apr = calculateApr(xSushi, snapshot)
  xSushi.aprUpdatedAtTimestamp = timestamp
}

/**
 * Formula from https://github.com/sushiswap/sushiswap/blob/feature/pool/apps/pool/pages/api/bar.tsx#L17
 * @param xSushi 
 * @param snapshot 
 * @returns 
 */
const calculateApr = (xSushi: XSushi, snapshot: WeekSnapshot): BigDecimal => {
  return xSushi.sushiXsushiRatio.div(snapshot.sushiXsushiRatio)
    .minus(BigDecimal.fromString('1'))
    .div(BigDecimal.fromString('100')) // TODO: div 100k?
}