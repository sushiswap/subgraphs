import {
  Approval,
  LogExchangeRate,
  LogAccrue,
  LogAddCollateral,
  LogAddAsset,
  LogRemoveCollateral,
  LogRemoveAsset,
  LogBorrow,
  LogRepay,
  LogFeeTo,
  LogWithdrawFees,
  Transfer,
} from '../../generated/templates/KashiPair/KashiPair'
import { getKashiPair, getRebase, getToken, toBase } from '../functions'
import { BigDecimal, BigInt, log } from '@graphprotocol/graph-ts'
import { getInterestPerYear, takeFee } from '../functions/interest'
import { getKashiPairAccrueInfo } from '../functions/kashi-pair-accrue-info'
import { updateKashiPairSnapshots } from '../functions/kashi-pair-snapshot'
import { getTokenPrice } from '../functions/token-price'
import { ADDRESS_ZERO } from '../constants'

// TODO: add callHandler for liquidate function on KashiPairs

// class ChainlinkPriceFeedRegistry {}

export function handleLogExchangeRate(event: LogExchangeRate): void {
  log.info('[BentoBox:KashiPair] Log Exchange Rate {}', [event.params.rate.toString()])
  const pair = getKashiPair(event.address, event.block)
  pair.exchangeRate = event.params.rate
  pair.block = event.block.number
  pair.timestamp = event.block.timestamp

  const asset = getToken(pair.asset)
  const collateral = getToken(pair.collateral)
  // const assetPrice = getTokenPrice(pair.asset)
  // const collateralPrice = getTokenPrice(pair.collateral)

  // Figure out if priced against BTC/ETH/USD

  // if (pair.oracleMultiply == ADDRESS_ZERO) {
  //   assetPrice.usd = pair.exchangeRate.toBigDecimal().div(BigDecimal.fromString('1e18'))
  //   assetPrice.eth = pair.exchangeRate.toBigDecimal().div(BigDecimal.fromString('1e18'))
  //   assetPrice.btc = pair.exchangeRate.toBigDecimal().div(BigDecimal.fromString('1e18'))
  //   assetPrice.save()
  // }

  if (pair.oracleValidated) {
    const needed = collateral.decimals.plus(BigInt.fromU32(18)).minus(asset.decimals)
    // const divider = BigInt.fromU32(10).pow(decimals.minus(needed).toU32() as u8)

    log.debug(
      'Asset price... collateral decimals: {} asset decimals: {} needed: {} rate: {} divider: {} rate/divider: {}',
      [
        collateral.decimals.toString(),
        asset.decimals.toString(),
        needed.toString(),
        event.params.rate.toString(),
        BigInt.fromI32(10)
          .pow(needed.toI32() as u8)
          .toBigDecimal()
          .toString(),
        event.params.rate
          .divDecimal(
            BigInt.fromI32(10)
              .pow(needed.toI32() as u8)
              .toBigDecimal()
          )
          .toString(),
      ]
    )
    // Price of asset in terms of collateral
    pair.assetPrice = event.params.rate.divDecimal(
      BigInt.fromI32(10)
        .pow(needed.toI32() as u8)
        .toBigDecimal()
    )
    // Price of collateral in terms of asset
    pair.collateralPrice = BigDecimal.fromString('1').div(
      event.params.rate.divDecimal(
        BigInt.fromI32(10)
          .pow(needed.toI32() as u8)
          .toBigDecimal()
      )
    )
  }

  pair.save()

  updateKashiPairSnapshots(event.block.timestamp, pair)
}

export function handleLogAccrue(event: LogAccrue): void {
  log.info('[BentoBox:KashiPair] Log Accrue {} {} {} {}', [
    event.params.accruedAmount.toString(),
    event.params.feeFraction.toString(),
    event.params.rate.toString(),
    event.params.utilization.toString(),
  ])

  const pair = getKashiPair(event.address, event.block)

  const totalAsset = getRebase(pair.id.concat('-').concat('asset'))
  const totalBorrow = getRebase(pair.id.concat('-').concat('borrow'))

  const extraAmount = event.params.accruedAmount
  const feeFraction = event.params.feeFraction

  totalAsset.base = totalAsset.base.plus(feeFraction)
  totalAsset.save()

  totalBorrow.elastic = totalBorrow.elastic.plus(extraAmount)
  totalBorrow.save()

  const accrueInfo = getKashiPairAccrueInfo(pair.id)
  accrueInfo.feesEarnedFraction = accrueInfo.feesEarnedFraction.plus(feeFraction)
  accrueInfo.interestPerSecond = event.params.rate
  accrueInfo.lastAccrued = event.block.timestamp
  accrueInfo.save()

  const borrowAPR = getInterestPerYear(
    totalBorrow.base,
    accrueInfo.interestPerSecond,
    accrueInfo.lastAccrued,
    event.block.timestamp,
    pair.utilization
  )
  const supplyAPR = takeFee(borrowAPR.times(pair.utilization)).div(BigInt.fromString('1000000000000000000'))
  pair.supplyAPR = supplyAPR
  pair.borrowAPR = borrowAPR
  pair.utilization = event.params.utilization
  pair.block = event.block.number
  pair.timestamp = event.block.timestamp
  pair.save()

  // Temp, for querying
  pair.feesEarnedFraction = accrueInfo.feesEarnedFraction
  pair.interestPerSecond = accrueInfo.interestPerSecond
  pair.lastAccrued = accrueInfo.lastAccrued
  pair.save()

  updateKashiPairSnapshots(event.block.timestamp, pair)
}

export function handleLogAddCollateral(event: LogAddCollateral): void {
  log.info('[BentoBox:KashiPair] Log Add Collateral {} {} {}', [
    event.params.from.toHex(),
    event.params.to.toHex(),
    event.params.share.toString(),
  ])
  const pair = getKashiPair(event.address, event.block)
  pair.totalCollateralShare = pair.totalCollateralShare.plus(event.params.share)
  pair.save()
  updateKashiPairSnapshots(event.block.timestamp, pair)
}

export function handleLogRemoveCollateral(event: LogRemoveCollateral): void {
  log.info('[BentoBox:KashiPair] Log Remove Collateral {} {} {}', [
    event.params.from.toHex(),
    event.params.to.toHex(),
    event.params.share.toString(),
  ])

  const share = event.params.share

  const pair = getKashiPair(event.address, event.block)
  pair.totalCollateralShare = pair.totalCollateralShare.minus(share)
  pair.save()
  updateKashiPairSnapshots(event.block.timestamp, pair)
  // const poolPercentage = share.div(pair.totalCollateralShare).times(BigInt.fromI32(100))
}

export function handleLogAddAsset(event: LogAddAsset): void {
  log.info('[BentoBox:KashiPair] Log Add Asset {} {} {} {}', [
    event.params.from.toHex(),
    event.params.to.toHex(),
    event.params.share.toString(),
    event.params.fraction.toString(),
  ])
  // elastic = BentoBox shares held by the KashiPair, base = Total fractions held by asset suppliers

  const pair = getKashiPair(event.address, event.block)

  const share = event.params.share
  const fraction = event.params.fraction

  const totalAsset = getRebase(event.address.toHex().concat('-').concat('asset'))
  totalAsset.elastic = totalAsset.elastic.plus(share)
  totalAsset.base = totalAsset.base.plus(fraction)
  totalAsset.save()

  pair.totalAssetBase = totalAsset.base
  pair.totalAssetElastic = totalAsset.elastic
  pair.save()
}

export function handleLogRemoveAsset(event: LogRemoveAsset): void {
  log.info('[BentoBox:KashiPair] Log Remove Asset {} {} {} {}', [
    event.params.from.toHex(),
    event.params.to.toHex(),
    event.params.share.toString(),
    event.params.fraction.toString(),
  ])
  // elastic = BentoBox shares held by the KashiPair, base = Total fractions held by asset suppliers
  const pair = getKashiPair(event.address, event.block)

  const share = event.params.share
  const fraction = event.params.fraction
  const totalAsset = getRebase(event.address.toHex().concat('-').concat('asset'))

  const poolPercentage = fraction.div(totalAsset.base).times(BigInt.fromI32(100))

  totalAsset.elastic = totalAsset.elastic.minus(share)
  totalAsset.base = totalAsset.base.minus(fraction)
  totalAsset.save()

  //TODO: maybe update user and check if solvent

  // Temp, for querying
  pair.totalAssetBase = totalAsset.base
  pair.totalAssetElastic = totalAsset.elastic
  pair.save()
}

export function handleLogBorrow(event: LogBorrow): void {
  log.info('[BentoBox:KashiPair] Log Borrow {} {} {} {} {}', [
    event.params.from.toHex(),
    event.params.to.toHex(),
    event.params.amount.toString(),
    event.params.feeAmount.toString(),
    event.params.part.toString(),
  ])
  // elastic = Total token amount to be repayed by borrowers, base = Total parts of the debt held by borrowers

  const amount = event.params.amount
  const feeAmount = event.params.feeAmount
  const part = event.params.part

  const pair = getKashiPair(event.address, event.block)

  const totalBorrow = getRebase(event.address.toHex().concat('-').concat('borrow'))
  totalBorrow.base = totalBorrow.base.plus(part)
  totalBorrow.elastic = totalBorrow.elastic.plus(amount.plus(feeAmount))
  totalBorrow.save()

  const totalAsset = getRebase(event.address.toHex().concat('-').concat('asset'))

  const total = getRebase(pair.asset)

  const share = toBase(total, amount, false)

  log.info('LogBorrowDebug - block: {} total.elastic: {} total.base: {} elastic: {} share: {}', [
    event.block.number.toString(),
    total.elastic.toString(),
    total.base.toString(),
    amount.toString(),
    share.toString(),
  ])

  totalAsset.elastic = totalAsset.elastic.minus(share)
  totalAsset.save()

  // Temp, for querying
  pair.totalBorrowBase = totalBorrow.base
  pair.totalBorrowElastic = totalBorrow.elastic
  pair.totalAssetElastic = totalAsset.elastic
  pair.save()
}

export function handleLogRepay(event: LogRepay): void {
  log.info('[BentoBox:KashiPair] Log Repay {} {}', [
    event.params.from.toHex(),
    event.params.to.toHex(),
    event.params.amount.toString(),
    event.params.part.toString(),
  ])
  // elastic = Total token amount to be repayed by borrowers, base = Total parts of the debt held by borrowers

  const amount = event.params.amount
  const part = event.params.part

  const pair = getKashiPair(event.address, event.block)

  const totalBorrow = getRebase(event.address.toHex().concat('-').concat('borrow'))
  totalBorrow.base = totalBorrow.base.minus(part)
  totalBorrow.elastic = totalBorrow.elastic.minus(amount)
  totalBorrow.save()

  const totalAsset = getRebase(event.address.toHex().concat('-').concat('asset'))
  const share = toBase(getRebase(pair.asset), amount, true)
  totalAsset.elastic = totalAsset.elastic.plus(share)
  totalAsset.save()

  // Temp, for querying
  pair.totalBorrowBase = totalBorrow.base
  pair.totalBorrowElastic = totalBorrow.elastic
  pair.totalAssetElastic = totalAsset.elastic
  pair.save()

  // const poolPercentage = part.div(pair.totalBorrowBase).times(BigInt.fromI32(100))
}

export function handleLogFeeTo(event: LogFeeTo): void {
  log.info('[BentoBox:KashiPair] Log Fee To {}', [event.params.newFeeTo.toHex()])
  const pair = getKashiPair(event.address, event.block)
  pair.feeTo = event.params.newFeeTo
  pair.block = event.block.number
  pair.timestamp = event.block.timestamp
  pair.save()
}

export function handleLogWithdrawFees(event: LogWithdrawFees): void {
  log.info('[BentoBox:KashiPair] Log Withdraw Fees {} {}', [
    event.params.feeTo.toHex(),
    event.params.feesEarnedFraction.toString(),
  ])

  const pair = getKashiPair(event.address, event.block)
  pair.totalFeesEarnedFraction = pair.totalFeesEarnedFraction.plus(event.params.feesEarnedFraction)
  pair.save()

  const kashiPairAccrueInfo = getKashiPairAccrueInfo(event.address.toHex())
  kashiPairAccrueInfo.feesEarnedFraction = BigInt.fromI32(0)
  kashiPairAccrueInfo.save()

  // Temp, for querying
  pair.feesEarnedFraction = kashiPairAccrueInfo.feesEarnedFraction
  pair.save()

  updateKashiPairSnapshots(event.block.timestamp, pair)
}

export function handleApproval(event: Approval): void {
  log.info('[BentoBox:KashiPair] Approval {} {} {}', [
    event.params._owner.toHex(),
    event.params._spender.toHex(),
    event.params._value.toString(),
  ])
}

export function handleTransfer(event: Transfer): void {
  log.info('[BentoBox:KashiPair] Log Transfer {} {} {}', [
    event.params._from.toHex(),
    event.params._to.toHex(),
    event.params._value.toString(),
  ])
}
