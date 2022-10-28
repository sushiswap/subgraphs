import { _Version } from '../../generated/schema'
import { VERSION } from '../constants'

export function getOrCreateVersion(): _Version {
  let version = _Version.load('1')

  if (version === null) {
    version = new _Version('1')
    version.version = VERSION
    version.save()
  }

  if (version.version !== VERSION) {
    version.version = VERSION
    version.save()
  }

  return version as _Version
}
