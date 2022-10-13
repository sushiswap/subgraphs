import { LogRegisterProtocol } from '../../generated/BentoBox/BentoBox'
import { Protocol } from '../../generated/schema'
import { increaseProtocolCount } from './bentobox-kpi'

export function getOrCreateProtocol(event: LogRegisterProtocol): Protocol {
  let registeredProtocol = Protocol.load(event.params.protocol.toHex())
  if (registeredProtocol === null) {
    registeredProtocol = new Protocol(event.params.protocol.toHex())
    registeredProtocol.bentoBox = event.address.toHex()
    registeredProtocol.save()
    increaseProtocolCount(event.block.timestamp)
  }
  return registeredProtocol
}
