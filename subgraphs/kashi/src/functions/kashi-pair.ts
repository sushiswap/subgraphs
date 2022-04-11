import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts'

import { STARTING_INTEREST_PER_YEAR } from '../constants/kashi-constants'
import { KashiPair } from '../../generated/schema'
import { KashiPair as KashiPairContract } from '../../generated/BentoBox/KashiPair'
import { getBentoBox } from './bentobox'
import { getOrCreateMasterContract } from './master-contract'

export function createKashiPair(address: Address, block: ethereum.Block, type: string): KashiPair {
  const pairContract = KashiPairContract.bind(address)
  const masterContract = KashiPairContract.bind(pairContract.masterContract())

  const bentoBox = getBentoBox()
  const master = getOrCreateMasterContract(pairContract.masterContract())
  const asset = pairContract.asset()
  const collateral = pairContract.collateral()
  const accrueInfo = pairContract.accrueInfo()

  const pair = new KashiPair(address.toHex())

  // TODO: should add props for specific kashi pair types (collateralization rates, etc.)

  pair.bentoBox = bentoBox.id
  pair.type = type
  pair.masterContract = master.id
  pair.owner = masterContract.owner()
  pair.feeTo = masterContract.feeTo()
  pair.name = pairContract.name()
  pair.symbol = pairContract.symbol()
  pair.oracle = pairContract.oracle()
  pair.asset = asset
  pair.collateral = collateral
  pair.exchangeRate = pairContract.exchangeRate()
  pair.interestPerSecond = accrueInfo.value0
  pair.feesEarnedFraction = accrueInfo.value2
  pair.lastAccrued = accrueInfo.value1
  pair.borrowAPR = STARTING_INTEREST_PER_YEAR
  pair.block = block.number
  pair.timestamp = block.timestamp

  pair.save()

  bentoBox.kashiPairCount = bentoBox.kashiPairCount.plus(BigInt.fromI32(1))
  bentoBox.save()

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
