
import { handleUser } from "../functions";
import { Product } from "../constants";
import { CreateStream, Withdraw } from "../../generated/FuroStream/FuroStream";

export function onCreateStream(event: CreateStream): void {
    handleUser(event.params.sender, event, Product.FURO)
}

export function onWithdraw(event: Withdraw): void {
    handleUser(event.transaction.from, event, Product.FURO)
}