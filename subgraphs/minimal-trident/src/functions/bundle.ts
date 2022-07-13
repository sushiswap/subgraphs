import { BIG_DECIMAL_ZERO } from '../constants'
import { Bundle } from '../../generated/schema'

export function getOrCreateBundle(): Bundle {
  let bundle = Bundle.load('1')

  if (bundle === null) {
    bundle = new Bundle('1')
    bundle.nativePrice = BIG_DECIMAL_ZERO
    bundle.save()
  }

  return bundle as Bundle
}
