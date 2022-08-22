
import { handleUser } from "../functions";
import { Transfer, Swap } from "../../generated/templates/Pair/Pair";
import { Product } from "../constants";

export function onTransfer(event: Transfer): void {
    handleUser(event.params.from, event, Product.SUSHISWAP)
    handleUser(event.params.to, event, Product.SUSHISWAP)
}

export function onSwap(event: Swap): void {
    handleUser(event.transaction.from, event, Product.SUSHISWAP)
}
