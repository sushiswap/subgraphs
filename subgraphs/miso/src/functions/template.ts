import { AuctionTemplateAdded } from '../../generated/MISOMarket/MISOMarket'
import { Template } from '../../generated/schema'
import { BatchAuction } from '../../generated/MISOMarket/BatchAuction'
import { AuctionType, BATCH_AUCTION_TEMPLATE_ID, CROWDSALE_AUCTION_TEMPLATE_ID, DUTCH_AUCTION_TEMPLATE_ID, HYPERBOLIC_AUCTION_TEMPLATE_ID } from '../constants'

export function createTemplate(event: AuctionTemplateAdded): Template {
  const template = new Template(event.params.newAuction.toHex())
  
  // There are several auction types, but they all have marketTemplate function, therefore the generated method should be is the same 
  // and we can use only one template to get the marketTemplate
  const contract = BatchAuction.bind(event.params.newAuction) 
  template.templateId = contract.marketTemplate()

  template.factory = event.address.toHex()
  template.block = event.block.number
  template.timestamp = event.block.timestamp
  if (template.templateId.equals(CROWDSALE_AUCTION_TEMPLATE_ID)) {
    template.type = AuctionType.CROWDSALE
  } else if (template.templateId.equals(DUTCH_AUCTION_TEMPLATE_ID)) {
    template.type = AuctionType.DUTCH
  } else if (template.templateId.equals(BATCH_AUCTION_TEMPLATE_ID)) {
    template.type = AuctionType.BATCH
  } else if (template.templateId.equals(HYPERBOLIC_AUCTION_TEMPLATE_ID)) {
    template.type = AuctionType.HYBERBOLIC
  }

  template.save()

  return template as Template
}

export function getTemplate(id: string): Template {
  let template = Template.load(id)
  return template as Template
}
