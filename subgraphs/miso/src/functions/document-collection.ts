import { DocumentType } from "../constants";
import { DutchAuction } from "../../generated/templates";
import { DocumentCollection } from "../../generated/schema";
import { log } from "@graphprotocol/graph-ts";

export function createDocumentcollection(id: string): DocumentCollection {
    const documentCollection = new DocumentCollection(id)
    documentCollection.save()
    return documentCollection
}

export function getDocumentCollection(id: string): DocumentCollection {
    return DocumentCollection.load(id) as DocumentCollection
}

export function updateDocument(auctionId: string, documents: string[], values: string[]): void {
    const documentCollection = getDocumentCollection(auctionId)

    for (let i = 0; i < documents.length; i++) {
        const documentName = documents[i]
        const documentValue = values[i]
        if (documentName.includes(DocumentType.WHITE_PAPER)) {
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
