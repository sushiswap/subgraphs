import { Address, BigInt, Bytes, crypto } from '@graphprotocol/graph-ts'

export const ADDRESS_ZERO = Address.fromString('0x0000000000000000000000000000000000000000')

export const ACCESS_CONTROLS_ADDRESS = Address.fromString('0x6b2a3ff504798886862ca5ce501e080947a506a2')

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
  
  export namespace DocumentTypeEncoded {
    export const WEBSITE = crypto.keccak256(Bytes.fromUTF8(DocumentType.WEBSITE)).toHex()
    export const WHITE_PAPER = crypto.keccak256(Bytes.fromUTF8(DocumentType.WHITE_PAPER)).toHex()
    export const TOKENOMICS = crypto.keccak256(Bytes.fromUTF8(DocumentType.TOKENOMICS)).toHex()
    export const CATEGORY = crypto.keccak256(Bytes.fromUTF8(DocumentType.CATEGORY)).toHex()
    export const ICON = crypto.keccak256(Bytes.fromUTF8(DocumentType.ICON)).toHex()
    export const DESKTOP_BANNER = crypto.keccak256(Bytes.fromUTF8(DocumentType.DESKTOP_BANNER)).toHex()
    export const MOBILE_BANNER = crypto.keccak256(Bytes.fromUTF8(DocumentType.MOBILE_BANNER)).toHex()
    export const DESCRIPTION = crypto.keccak256(Bytes.fromUTF8(DocumentType.DESCRIPTION)).toHex()
    export const TWITTER = crypto.keccak256(Bytes.fromUTF8(DocumentType.TWITTER)).toHex()
    export const GITHUB = crypto.keccak256(Bytes.fromUTF8(DocumentType.GITHUB)).toHex()
    export const TELEGRAM = crypto.keccak256(Bytes.fromUTF8(DocumentType.TELEGRAM)).toHex()
    export const WECHAT = crypto.keccak256(Bytes.fromUTF8(DocumentType.WECHAT)).toHex()
    export const DISCORD = crypto.keccak256(Bytes.fromUTF8(DocumentType.DISCORD)).toHex()
    export const REDDIT = crypto.keccak256(Bytes.fromUTF8(DocumentType.REDDIT)).toHex()
    export const MEDIUM = crypto.keccak256(Bytes.fromUTF8(DocumentType.MEDIUM)).toHex()
  }
  

export * from './roles'