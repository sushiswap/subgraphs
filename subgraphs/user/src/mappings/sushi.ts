import { Product } from "../constants";
import { Transfer } from "../../generated/Sushi/Sushi";
import { handleUser } from "../functions";

export function onTransfer(event: Transfer): void {
    handleUser(event.params.to, event, Product.SUSHI)
}
