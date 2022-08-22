
import { CreateVesting, Withdraw } from "../../generated/FuroVesting/FuroVesting";
import { Product } from "../constants";
import { handleUser } from "../functions";


export function onCreateVesting(event: CreateVesting): void {
    handleUser(event.params.owner, event, Product.FURO)
    handleUser(event.params.recipient, event, Product.FURO)
}

export function onWithdraw(event: Withdraw): void {
    handleUser(event.transaction.from, event, Product.FURO)
}