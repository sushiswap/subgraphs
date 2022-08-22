
import { handleUser } from "../functions";
import { Transfer, Swap } from "../../generated/templates/ConstantProductPool/ConstantProductPool";
import { Product } from "../constants";

export function onTransfer(event: Transfer): void {
    handleUser(event.params.recipient, event, Product.TRIDENT)
    handleUser(event.params.sender, event, Product.TRIDENT)
}

export function onSwap(event: Swap): void {
    handleUser(event.transaction.from, event, Product.TRIDENT)
}
