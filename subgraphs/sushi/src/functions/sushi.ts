import { Sushi } from '../../generated/schema'
import { SUSHI } from '../constants'

export function getOrCreateSushi(): Sushi {
  let sushi = Sushi.load(SUSHI)

  if (sushi === null) {
    sushi = new Sushi(SUSHI)
    sushi.save()
    return sushi
  }

  return sushi as Sushi
}
