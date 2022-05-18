import { FeeSender } from '../../generated/schema'
import { Transfer as SushiTransferEvent } from '../../generated/sushi/sushi'

export function getOrCreateFeeSender(event: SushiTransferEvent): FeeSender {
  const id = event.params.from.toHex()
  let feeSender = FeeSender.load(id)

  if (feeSender === null) {
    feeSender = new FeeSender(id)
    feeSender.createdAtBlock = event.block.number
    feeSender.createdAtTimestamp = event.block.timestamp
    feeSender.modifiedAtBlock = event.block.number
    feeSender.modifiedAtTimestamp = event.block.timestamp
    feeSender.save()
    return feeSender
  }

  return feeSender as FeeSender
}
