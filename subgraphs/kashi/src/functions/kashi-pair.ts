import { Address, BigDecimal, BigInt, Bytes, ethereum, log } from '@graphprotocol/graph-ts'

import { KashiPair } from '../../generated/schema'
import { LogDeploy } from '../../generated/BentoBox/BentoBox'
import { KashiPair as KashiPairContract } from '../../generated/BentoBox/KashiPair'

import { getOrCreateBentoBox } from './bentobox'
import { getOrCreateMasterContract } from './master-contract'
import { createKashiPairAccrueInfo } from './kashi-pair-accrue-info'
import { getOrCreateToken } from './token'
import { createRebase } from './rebase'
import { DEPRECIATED_ADDRESSES, STARTING_INTEREST_PER_YEAR } from '../constants'
import { validateChainlinkOracleData } from './oracle'

export function createKashiPair(event: LogDeploy): KashiPair {
  const pairContract = KashiPairContract.bind(event.params.cloneAddress)

  const bentoBox = getOrCreateBentoBox()

  const master = getOrCreateMasterContract(event.params.masterContract)

  const asset = getOrCreateToken(pairContract.asset().toHex())

  const collateral = getOrCreateToken(pairContract.collateral().toHex())

  const accrueInfo = createKashiPairAccrueInfo(event.params.cloneAddress)

  const totalAsset = createRebase(event.params.cloneAddress.toHex().concat('-').concat('asset'))
  const totalBorrow = createRebase(event.params.cloneAddress.toHex().concat('-').concat('borrow'))

  // const deployData = ethereum.decode('(address,address,address), bytes', event.params.data)!.toTuple()

  // const collateralAddress = deployData[0].toAddress() as Address
  // const assetAddress = deployData[1].toAddress() as Address
  // const oracleAddress = deployData[2].toAddress() as Address
  // const oracleData = deployData[3].toBytes() as Bytes

  // log.info('collateralAddress {} assetAddress {} oracleAddress {}', [
  //   collateralAddress.toHex(),
  //   assetAddress.toHex(),
  //   oracleAddress.toHex(),
  // ])

  // const oracleData = ethereum.decode('(address,address,uint256)', deployData[3].toBytes())!.toTuple()
  const oracleData = pairContract.oracleData()
  const decodedOracleData = ethereum.decode('(address,address,uint256)', oracleData)!.toTuple()

  const oracleMultiply = decodedOracleData[0].toAddress() as Address
  const oracleDivide = decodedOracleData[1].toAddress() as Address
  const oracleDecimals = decodedOracleData[2].toBigInt() as BigInt

  const oracleValidated = validateChainlinkOracleData(asset, collateral, decodedOracleData)

  const pair = new KashiPair(event.params.cloneAddress.toHex())
  pair.bentoBox = bentoBox.id
  pair.masterContract = master.id
  pair.feeTo = pairContract.feeTo()
  pair.collateral = collateral.id
  pair.asset = asset.id

  pair.oracle = pairContract.oracle()
  pair.oracleData = oracleData
  pair.oracleMultiply = oracleMultiply
  pair.oracleDivide = oracleDivide
  pair.oracleDecimals = oracleDecimals
  pair.oracleValidated = oracleValidated

  pair.totalCollateralShare = pairContract.totalCollateralShare()

  const exchangeRate = pairContract.exchangeRate()

  pair.exchangeRate = exchangeRate

  pair.name = pairContract.name()
  pair.symbol = pairContract.symbol()
  pair.decimals = BigInt.fromU32(pairContract.decimals())
  pair.totalSupply = pairContract.totalSupply()

  pair.borrowAPR = BigInt.fromU32(0)
  pair.supplyAPR = STARTING_INTEREST_PER_YEAR
  pair.utilization = BigInt.fromU32(0)
  pair.totalFeesEarnedFraction = BigInt.fromU32(0)

  // AccrueInfo
  pair.accrueInfo = accrueInfo.id
  pair.interestPerSecond = accrueInfo.interestPerSecond
  pair.feesEarnedFraction = accrueInfo.feesEarnedFraction
  pair.lastAccrued = accrueInfo.lastAccrued

  // Total Asset flat
  pair.totalAsset = totalAsset.id
  pair.totalAssetBase = totalAsset.base
  pair.totalAssetElastic = totalAsset.elastic

  // Total Borrow flat
  pair.totalBorrow = totalBorrow.id
  pair.totalBorrowBase = totalBorrow.base
  pair.totalBorrowElastic = totalBorrow.elastic

  // Total Available flat
  pair.totalBorrow = totalBorrow.id
  pair.totalBorrowBase = totalBorrow.base
  pair.totalBorrowElastic = totalBorrow.elastic

  // Depreciated
  pair.depreciated = DEPRECIATED_ADDRESSES.includes(event.params.masterContract.toHex())

  pair.assetPrice = BigDecimal.fromString('0')
  pair.collateralPrice = BigDecimal.fromString('0')

  pair.totalAssetUSD = BigDecimal.fromString('0')
  pair.totalBorrowUSD = BigDecimal.fromString('0')

  pair.block = event.block.number
  pair.timestamp = event.block.timestamp

  pair.save()

  return pair as KashiPair
}

export function getKashiPair(address: Address, block: ethereum.Block): KashiPair {
  const id = address.toHex()
  let pair = KashiPair.load(id) as KashiPair

  pair.block = block.number
  pair.timestamp = block.timestamp
  pair.save()

  return pair as KashiPair
}
