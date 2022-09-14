import { log } from "@graphprotocol/graph-ts";
import { DocumentCollection } from "../../generated/schema";
import { DocumentType, DocumentTypeEncoded} from "../constants";

export function createDocumentcollection(id: string): DocumentCollection {
    const documentCollection = new DocumentCollection(id)
    documentCollection.save()
    return documentCollection
}

export function getDocumentCollection(id: string): DocumentCollection {
    return DocumentCollection.load(id) as DocumentCollection
}

export function updateDocuments(auctionId: string, documents: string[], values: string[]): void {
    const documentCollection = getDocumentCollection(auctionId)

    for (let i = 0; i < documents.length; i++) {
        const documentName = documents[i]
        const documentValue = values[i]
        if (documentName.includes(DocumentType.WEBSITE)) {
            documentCollection.website = documentValue
        }
        else if (documentName.includes(DocumentType.WHITE_PAPER)) {
            documentCollection.whitepaper = documentValue
        }
        else if (documentName.includes(DocumentType.TOKENOMICS)) {
            documentCollection.tokenomics = documentValue
        }
        else if (documentName.includes(DocumentType.CATEGORY)) {
            documentCollection.category = documentValue
        }
        else if (documentName.includes(DocumentType.ICON)) {
            documentCollection.icon = documentValue
        }
        else if (documentName.includes(DocumentType.DESKTOP_BANNER)) {
            documentCollection.desktopBanner = documentValue
        }
        else if (documentName.includes(DocumentType.MOBILE_BANNER)) {
            documentCollection.mobileBanner = documentValue
        }
        else if (documentName.includes(DocumentType.DESCRIPTION)) {
            documentCollection.description = documentValue
        }
        else if (documentName.includes(DocumentType.TWITTER)) {
            documentCollection.twitter = documentValue
        }
        else if (documentName.includes(DocumentType.GITHUB)) {
            documentCollection.github = documentValue
        }
        else if (documentName.includes(DocumentType.TELEGRAM)) {
            documentCollection.telegram = documentValue
        }
        else if (documentName.includes(DocumentType.WECHAT)) {
            documentCollection.wechat = documentValue
        }
        else if (documentName.includes(DocumentType.DISCORD)) {
            documentCollection.discord = documentValue
        }
        else if (documentName.includes(DocumentType.REDDIT)) {
            documentCollection.reddit = documentValue
        }
        else if (documentName.includes(DocumentType.MEDIUM)) {
            documentCollection.medium = documentValue
        }
        else {
            log.warning("Unknown document type: {}", [documentName])
        }
    }
    documentCollection.save()
}


export function updateDocument(auctionId: string, name: string, value: string): void {
    const documentCollection = getDocumentCollection(auctionId)
    if (name == DocumentType.WEBSITE || name == DocumentTypeEncoded.WEBSITE) {
        documentCollection.website = value
    }
    else if (name == DocumentType.WHITE_PAPER || name == DocumentTypeEncoded.WHITE_PAPER) {
        documentCollection.whitepaper = value
    }
    else if (name == DocumentType.TOKENOMICS || name == DocumentTypeEncoded.TOKENOMICS) {
        documentCollection.tokenomics = value
    }
    else if (name == DocumentType.CATEGORY || name == DocumentTypeEncoded.CATEGORY) {
        documentCollection.category = value
    }
    else if (name == DocumentType.ICON || name == DocumentTypeEncoded.ICON) {
        documentCollection.icon = value
    }
    else if (name == DocumentType.DESKTOP_BANNER || name == DocumentTypeEncoded.DESKTOP_BANNER) {
        documentCollection.desktopBanner = value
    }
    else if (name == DocumentType.MOBILE_BANNER || name == DocumentTypeEncoded.MOBILE_BANNER) {
        documentCollection.mobileBanner = value
    }
    else if (name == DocumentType.DESCRIPTION || name == DocumentTypeEncoded.DESCRIPTION) {
        documentCollection.description = value
    }
    else if (name == DocumentType.TWITTER || name == DocumentTypeEncoded.TWITTER) {
        documentCollection.twitter = value
    }
    else if (name == DocumentType.GITHUB || name == DocumentTypeEncoded.GITHUB) {
        documentCollection.github = value
    }
    else if (name == DocumentType.TELEGRAM || name == DocumentTypeEncoded.TELEGRAM) {
        documentCollection.telegram = value
    }
    else if (name == DocumentType.WECHAT || name == DocumentTypeEncoded.WECHAT) {
        documentCollection.wechat = value
    }
    else if (name == DocumentType.DISCORD || name == DocumentTypeEncoded.DISCORD) {
        documentCollection.discord = value
    }
    else if (name == DocumentType.REDDIT || name == DocumentTypeEncoded.REDDIT) {
        documentCollection.reddit = value
    }
    else if (name == DocumentType.MEDIUM || name == DocumentTypeEncoded.MEDIUM) {
        documentCollection.medium = value
    }
    else {
        log.warning("Unknown document type: {}", [name])
    }

    documentCollection.save()
}


export function removeDocument(auctionId: string, name: string, value: string): void {
    const documentCollection = getDocumentCollection(auctionId)
    if (name == (DocumentType.WEBSITE) || name == DocumentTypeEncoded.WEBSITE) {
        documentCollection.website = null
    }
    else if (name == (DocumentType.WHITE_PAPER) || name == DocumentTypeEncoded.WHITE_PAPER) {
        documentCollection.whitepaper = null
    }
    else if (name == (DocumentType.TOKENOMICS) || name == DocumentTypeEncoded.TOKENOMICS) {
        documentCollection.tokenomics = null
    }
    else if (name == (DocumentType.CATEGORY) || name == DocumentTypeEncoded.CATEGORY) {
        documentCollection.category = null
    }
    else if (name == (DocumentType.ICON) || name == DocumentTypeEncoded.ICON) {
        documentCollection.icon = null
    }
    else if (name == (DocumentType.DESKTOP_BANNER) || name == DocumentTypeEncoded.DESKTOP_BANNER) {
        documentCollection.desktopBanner = null
    }
    else if (name == (DocumentType.MOBILE_BANNER) || name == DocumentTypeEncoded.MOBILE_BANNER) {
        documentCollection.mobileBanner = null
    }
    else if (name == (DocumentType.DESCRIPTION) || name == DocumentTypeEncoded.DESCRIPTION) {
        documentCollection.description = null
    }
    else if (name == (DocumentType.TWITTER) || name == DocumentTypeEncoded.TWITTER) {
        documentCollection.twitter = null
    }
    else if (name == (DocumentType.GITHUB) || name == DocumentTypeEncoded.GITHUB) {
        documentCollection.github = null
    }
    else if (name == (DocumentType.TELEGRAM) || name == DocumentTypeEncoded.TELEGRAM) {
        documentCollection.telegram = null
    }
    else if (name == (DocumentType.WECHAT) || name == DocumentTypeEncoded.WECHAT) {
        documentCollection.wechat = null
    }
    else if (name == (DocumentType.DISCORD) || name == DocumentTypeEncoded.DISCORD) {
        documentCollection.discord = null
    }
    else if (name == (DocumentType.REDDIT) || name == DocumentTypeEncoded.REDDIT) {
        documentCollection.reddit = null
    }
    else if (name == (DocumentType.MEDIUM) || name == DocumentTypeEncoded.MEDIUM) {
        documentCollection.medium = null
    }
    else {
        log.warning("Unknown document type: {}", [name])
    }

    documentCollection.save()
}


