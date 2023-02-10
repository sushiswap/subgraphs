import { Address, ethereum } from '@graphprotocol/graph-ts'
import { ZERO_ADDRESS, BIG_INT_ZERO, COMPLEX_REWARDER, COMPLEX_REWARDER_TOKEN } from '../constants'
import {
  CloneRewarderTime as CloneRewarderTimeTemplate,
  ComplexRewarderTime as ComplexRewarderTimeTemplate,
} from '../../generated/templates'
import { CloneRewarderTime as CloneRewarderTimeContract } from '../../generated/MiniChef/CloneRewarderTime'
import { Rewarder } from '../../generated/schema'

export function getRewarder(address: Address, block: ethereum.Block): Rewarder {
  let rewarder = Rewarder.load(address.toHex())

  if (rewarder === null) {
    rewarder = new Rewarder(address.toHex())

    if (address == ZERO_ADDRESS) {
      rewarder.rewardToken = ZERO_ADDRESS
      rewarder.rewardPerSecond = BIG_INT_ZERO
      rewarder.totalAllocPoint = BIG_INT_ZERO
      rewarder.timestamp = block.timestamp
      rewarder.block = block.number
      rewarder.save()
    }

    if (COMPLEX_REWARDER != ZERO_ADDRESS && address == COMPLEX_REWARDER) {
      rewarder.timestamp = block.timestamp
      rewarder.block = block.number
      rewarder.rewardToken = COMPLEX_REWARDER_TOKEN
      rewarder.rewardPerSecond = BIG_INT_ZERO
      rewarder.totalAllocPoint = BIG_INT_ZERO
      rewarder.save()
      ComplexRewarderTimeTemplate.create(address)
    } else if (address != ZERO_ADDRESS) {
      const rewarderContract = CloneRewarderTimeContract.bind(address)
      const rewardTokenResult = rewarderContract.try_rewardToken()
      const rewardRateResult = rewarderContract.try_rewardPerSecond()
      if (!rewardTokenResult.reverted) {
        rewarder.rewardToken = rewardTokenResult.value
      } else {
        rewarder.rewardToken = ZERO_ADDRESS
      }
      if (!rewardRateResult.reverted) {
        rewarder.rewardPerSecond = rewardRateResult.value
      } else {
        rewarder.rewardPerSecond = BIG_INT_ZERO
      }
      rewarder.totalAllocPoint = BIG_INT_ZERO
      rewarder.timestamp = block.timestamp
      rewarder.block = block.number
      rewarder.save()
      CloneRewarderTimeTemplate.create(address)
    }
  }

  return rewarder as Rewarder
}
