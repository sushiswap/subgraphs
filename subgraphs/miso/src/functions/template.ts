import { AuctionType, BATCH_AUCTION_TEMPLATE_ID, CROWDSALE_AUCTION_TEMPLATE_ID, DUTCH_AUCTION_TEMPLATE_ID, HYPERBOLIC_AUCTION_TEMPLATE_ID } from '../constants'
import { AuctionTemplateAdded } from '../../generated/MISOMarket/MISOMarket'
import { Template } from '../../generated/schema'

export function createTemplate(event: AuctionTemplateAdded): Template {
  const template = new Template(event.params.newAuction.toHex())
  
  template.factory = event.address.toHex()
  template.block = event.block.number
  template.timestamp = event.block.timestamp
  if (event.params.templateId.equals(CROWDSALE_AUCTION_TEMPLATE_ID)) {
    template.type = AuctionType.CROWDSALE
  } else if (event.params.templateId.equals(DUTCH_AUCTION_TEMPLATE_ID)) {
    template.type = AuctionType.DUTCH
  } else if (event.params.templateId.equals(BATCH_AUCTION_TEMPLATE_ID)) {
    template.type = AuctionType.BATCH
  } else if (event.params.templateId.equals(HYPERBOLIC_AUCTION_TEMPLATE_ID)) {
    template.type = AuctionType.CROWDSALE
  }

  template.save()

  return template as Template
}

export function getTemplate(id: string): Template {
  let template = Template.load(id)
  return template as Template
}
