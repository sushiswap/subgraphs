import { LogRewardPerSecond } from '../../generated/MiniChef/CloneRewarderTime'
import { getRewarder } from '../functions'

export function logRewardPerSecond(event: LogRewardPerSecond): void {
    const rewarder = getRewarder(event.address, event.block)
    rewarder.rewardPerSecond = event.params.rewardPerSecond
    rewarder.save()
}
