import { Bundle } from '../../generated/schema'

export function getBundle(): Bundle {
  let bundle = Bundle.load('0')

  if (bundle === null) {
    bundle = new Bundle('0')
    bundle.save()
  }

  return bundle as Bundle
}
