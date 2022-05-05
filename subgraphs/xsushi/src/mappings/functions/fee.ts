import { Fee } from '../../../generated/schema'
import { Transfer as SushiTransferEvent } from '../../../generated/sushi/sushi'

export function getOrCreateFee(event: SushiTransferEvent): Fee {
  const id = event.transaction.hash.toHex()
  let fee = Fee.load(id)

  if (fee === null) {
    fee = new Fee(id)
    fee.createdAtBlock = event.block.number
    fee.createdAtTimestamp = event.block.timestamp
    fee.sender = event.params.from.toHex()
    fee.amount = event.params.value
    fee.save()
    return fee
  }

  return fee as Fee
}
