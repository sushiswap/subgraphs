import { Bundle } from '../schema'
import { BIG_DECIMAL_ZERO } from '../constants'

export function getOrCreateBundle(): Bundle {
  let bundle = Bundle.load('1')

  if (bundle === null) {
    bundle = new Bundle('1')
    bundle.ethPrice = BIG_DECIMAL_ZERO
    bundle.save()
  }

  return bundle as Bundle
}
