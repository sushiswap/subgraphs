import { Address, BigInt } from '@graphprotocol/graph-ts'

export const ADDRESS_ZERO = Address.fromString('0x0000000000000000000000000000000000000000')

export const ACCESS_CONTROLS_ADDRESS = Address.fromString('{{ miso.accessControls.address }}')

export const CROWDSALE_AUCTION_TEMPLATE_ID = BigInt.fromI32(1)
export const DUTCH_AUCTION_TEMPLATE_ID = BigInt.fromI32(2)
export const BATCH_AUCTION_TEMPLATE_ID = BigInt.fromI32(3)
export const HYPERBOLIC_AUCTION_TEMPLATE_ID = BigInt.fromI32(4)



export namespace AuctionType {
    export const CROWDSALE = "CROWDSALE"
    export const DUTCH = "DUTCH"
    export const BATCH = "BATCH"
    export const HYBERBOLIC = "HYBERBOLIC"
  }

  
//   const socials = [
//     {
//       key: 'twitter',
//     },
//     {
//       key: 'github',
//     },
//     {
//       key: 'telegram',
//     },
//     {
//       key: 'wechat',
//     },
//     {
//       key: 'discord',
//     },
//     {
//       key: 'reddit',
//     },
//     {
//       key: 'medium',
//     },
//   ]
export namespace DocumentType {
    export const WEBSITE = "website"
    export const WHITE_PAPER = "whitepaper"
    export const TOKENOMICS = "tokenomics"
    export const CATEGORY = "category"
    export const ICON = "icon"
    export const DESKTOP_BANNER = "desktopBanner"
    export const MOBILE_BANNER = "mobileBanner"
    export const DESCRIPTION = "description"
    export const TWITTER = "twitter"
    export const GITHUB = "github"
    export const TELEGRAM = "telegram"
    export const WECHAT = "wechat"
    export const DISCORD = "discord"
    export const REDDIT = "reddit"
    export const MEDIUM = "medium"
  }


export * from './roles'