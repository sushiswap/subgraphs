
import { handleUser } from "../functions";
import { Transfer } from "../../generated/templates/Pair/Pair";
import { Product } from "../constants";

export function onTransfer(event: Transfer): void {
    handleUser(event.params.from, event, Product.SUSHISWAP)
    handleUser(event.params.to, event, Product.SUSHISWAP)
}
