import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts'

import { KashiPair } from '../../generated/schema'
import { KashiPair as KashiPairContract } from '../../generated/BentoBox/KashiPair'
import { getOrCreateBentoBox } from './bentobox'
import { getOrCreateMasterContract } from './master-contract'
import { createKashiPairAccrueInfo } from './kashi-pair-accrue-info'
import { getOrCreateToken } from './token'
import { LogDeploy } from '../../generated/BentoBox/BentoBox'
import { createRebase } from './rebase'
import { STARTING_INTEREST_PER_YEAR } from '../constants'

// TODO: should add props for specific kashi pair types (collateralization rates, etc.)

export function createKashiPair(event: LogDeploy): KashiPair {
  const pairContract = KashiPairContract.bind(event.params.cloneAddress)

  const bentoBox = getOrCreateBentoBox()

  const master = getOrCreateMasterContract(event.params.masterContract)

  const asset = getOrCreateToken(pairContract.asset().toHex())
  const collateral = getOrCreateToken(pairContract.collateral().toHex())

  const accrueInfo = createKashiPairAccrueInfo(event.params.cloneAddress)

  const totalAsset = createRebase(event.params.cloneAddress.toHex().concat('-').concat('asset'))
  const totalBorrow = createRebase(event.params.cloneAddress.toHex().concat('-').concat('borrow'))

  const pair = new KashiPair(event.params.cloneAddress.toHex())
  pair.bentoBox = bentoBox.id
  pair.masterContract = master.id
  pair.feeTo = pairContract.feeTo()
  pair.collateral = collateral.id
  pair.asset = asset.id
  pair.oracle = pairContract.oracle()
  pair.oracleData = pairContract.oracleData()
  pair.totalCollateralShare = pairContract.totalCollateralShare()
  pair.totalAsset = totalAsset.id
  pair.totalBorrow = totalBorrow.id
  pair.exchangeRate = pairContract.exchangeRate()
  pair.accrueInfo = accrueInfo.id
  pair.name = pairContract.name()
  pair.symbol = pairContract.symbol()
  pair.decimals = BigInt.fromU32(pairContract.decimals())
  pair.totalSupply = pairContract.totalSupply()

  pair.borrowAPR = BigInt.fromU32(0)
  pair.supplyAPR = STARTING_INTEREST_PER_YEAR
  pair.utilization = BigInt.fromU32(0)
  pair.totalFeesEarnedFraction = BigInt.fromU32(0)

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
