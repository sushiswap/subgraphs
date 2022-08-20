import { Product } from "../constants";
import { Transfer } from "../../generated/xSushi/xSushi";
import { handleUser } from "../functions";

export function handleLogAddCollateral(event: Transfer): void {
    handleUser(event.params.from, event, Product.KASHI)
    // handleUser(event.params.to, event, Product.KASHI) // TODO: do we need this?
}

export function handleLogAddAsset(event: Transfer): void {
    handleUser(event.params.from, event, Product.KASHI)
    // handleUser(event.params.to, event, Product.KASHI) // TODO: do we need this?
}